// sampleReducer.js
import { createReducer, createActions } from 'reduxsauce'
import Semaphore from '../services/semaphore'
import request from 'browser-request'
import { filter, orderBy } from 'lodash'
import { createSelector } from 'reselect'

var dewritoManifests = [
  'https://raw.githubusercontent.com/ElDewrito/ElDorito/master/dist/mods/dewrito.json',
  'https://scooterpsu.github.io/dewrito.json',
]

export type ServerType = {
  ip: string,
  port: number,
  name: string,
  host: string,
  ping: number,
  map: string,
  mapFile: string,
  gametype: string,
  variant: string,
  variantType: string,
  status: string, // TODO: enum
  numPlayers: string, // ???
  players: [Object], // todo: type
  isFull: boolean,
  version: string,
  sprintEnabled: boolean,
  sprintUnlimitedEnabled: boolean,
  dualWielding: boolean,
  assassinationEnabled: boolean,
  eldewritoVersion: number,
  isDedicated: boolean,
  passworded: boolean,
}

let networkQueue = new Semaphore(20)

// setInterval(() => {
//   console.log(networkQueue.tasks.length)
//   console.log(serversLeft)
// }, 1000)

export const { Types, Creators } = createActions({
  serversLoaded: [],
  getServers: ['dewritoManifests'],
  gotServers: ['servers'],
  getServerStatus: ['serverUrl'],
  gotServerStatus: ['serverData'],
  setSelected: ['server'],
  reset: [],
})

// the initial state of this reducer
export const INITIAL_STATE = {
  fetching: true,
  masterServersQueried: 0,
  servers: [],
  selected: null,
}

const setSelected = (state = INITIAL_STATE, { server }) => ({
  ...state,
  selected: server.ip,
})

const safeRequest = (uri, timeout = 1000) => new Promise((resolve, reject) =>
  networkQueue.acquire().then((release) => {
    const start = Date.now()
    request({ uri, timeout, resolveWithFullResponse: true }, (err, response, body) => {
      const end = Date.now()
      release()

      if (err) {
        reject(err)
      }
      resolve({ ...response, ping: Math.round((end - start) * 0.45) })
    })
  })
)

export const getServers = (masterServerUrls = dewritoManifests) =>
  (dispatch, getState) => Promise.all(

    dewritoManifests.map((url) =>
      safeRequest(url, 10000)
        .catch(() => ({ body: '' }))
        .then(({ body }) => JSON.parse(body))
        .then(({ masterServers: masterServerUrls }) => (
          Promise.all(
            masterServerUrls.map(({ list: masterServerUrl }) => (
              safeRequest(masterServerUrl, 10000)
                .catch(() => ({ body: '' }))
                .then(({ body }) => JSON.parse(body))
                .then(({ result: { servers } }) => (
                  dispatch(Creators.gotServers(servers)))
                )

            ))
          )
        ))
        .catch(console.error)
    )
  )
    .then(() => {
      dispatch(Creators.serversLoaded())
      const { servers } = getState()
      Object.keys(servers).map((ip) => dispatch(getServerStatus(ip)))
    })

const serverCache = []

const getServerStatusInternal = (dispatch, getState, serverUrl) => {
  const state = getState()
  const { ip, metaPort } = state.servers[serverUrl]
  safeRequest(`http://${ip}:${metaPort}`)
    .then(({ body, ping }) => ({
      ...JSON.parse(body),
      ping,
    }))
    .then((serverData) => {
      dispatch(
        Creators.gotServerStatus({ ...serverData, ip })
      )
    })
    .then(() => { serverCache[serverUrl] = true })
    .catch(console.error)
}

export const getServerStatus = (serverUrl) =>
  (dispatch, getState) => {
    dispatch(Creators.getServerStatus(serverUrl))
    return serverCache[serverUrl]
      ? (false)
      : getServerStatusInternal(dispatch, getState, serverUrl)
  }

export const reset = () => (dispatch) => {
  dispatch(Creators.reset())
  networkQueue.tasks = []
  networkQueue = new Semaphore(20)
  dispatch(getServers())
}

export const hardStop = () => {
  networkQueue.tasks = []
  networkQueue.count = 0
}

export const gotServerStatus = (state = INITIAL_STATE, { serverData }) => ({
  ...state,
  servers: {
    ...state.servers,
    [serverData.ip]: {
      ...state.servers[serverData.ip],
      ...serverData,
    },
  },
})

export const serversLoaded = (state = INITIAL_STATE) => ({
  ...state,
  fetching: false,
})

export const gotServers = (state = INITIAL_STATE, { servers }) => ({
  ...state,
  masterServersQueried: state.masterServersQueried + 1,
  // fetching: state.masterServersQueried !== 3,
  servers: (
    servers
      .map((server) => ({
        ip: server.slice(0, server.indexOf(':')),
        metaPort: server.slice(server.indexOf(':') + 1),
      }))
      .map((server) => ({
        [server.ip]: server,
      }))
      .reduce((acc, server) => ({ ...acc, ...server }), {})
  ),
})

export const getHydratedServers = createSelector(
  state => state.servers,
  state => state.fetching,
  (servers, fetching) => {
    if (fetching) {
      return []
    }

    return filter(Object.values(servers), (server) => server.port)
  }
)

export const getFilteredServers = createSelector(
  getHydratedServers,
  (state, props) => props,
  (servers, props) => {
    const [type, order] = props.filter
    if (!type && !order) {
      return servers
    }

    return orderBy(servers, [type], [order.toLowerCase()])
  }
)

export const getServerNumber = createSelector(
  getHydratedServers,
  (servers) => servers.length
)

export const getPlayerNumber = createSelector(
  getHydratedServers,
  (servers) => servers.reduce((acc, server) => acc + server.numPlayers, 0)
)

export const getSelected = createSelector(
  getHydratedServers,
  (state) => state.selected,
  (servers, selected) => servers.find(({ ip }) => ip === selected) || { players: [] }
)

// map our action types to our reducer functions
export const HANDLERS = {
  [Types.GOT_SERVERS]: gotServers,
  [Types.GOT_SERVER_STATUS]: gotServerStatus,
  [Types.SERVERS_LOADED]: serversLoaded,
  [Types.SET_SELECTED]: setSelected,
  [Types.RESET]: () => INITIAL_STATE,
}

export default createReducer(INITIAL_STATE, HANDLERS)
