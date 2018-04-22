// sampleReducer.js
import { createReducer, createActions } from 'reduxsauce'
import Semaphore from './semaphore'

var dewritoManifests = [
  'https://raw.githubusercontent.com/ElDewrito/ElDorito/master/dist/mods/dewrito.json',
  'https://scooterpsu.github.io/dewrito.json',
]

type ServerType = {
  ip: string,
  port: number,
  name: string,
  host: string,
  ping: number,
  map: string,
  mapFile: string,
  gametype: string,
  variant: string,
  status: string, // TODO: enum
  playerCount: string, // ???
  players: [Object], // todo: type
  isFull: boolean,
  version: string,
}

const networkQueue = new Semaphore(40)

setInterval(() => {
  console.log(networkQueue.tasks.length)
  console.log(serversLeft)
}, 1000)

export const { Types, Creators } = createActions({
  serversLoaded: [],
  getServers: ['dewritoManifests'],
  gotServers: ['servers'],
  getServerStatus: ['serverUrl'],
  gotServerStatus: ['serverData'],
})

// the initial state of this reducer
export const INITIAL_STATE = {
  fetching: true,
  masterServersQueried: 0,
  servers: [],
}

const superFetch = (url, timeout = 1000) => {
  const start = Date.now()
  return Promise.race([
    fetch(url),
    new Promise((resolve, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    ),
  ]).then((res) => {
    const end = Date.now()
    if (!res) {
      return null
    }
    return res.json().then(res => ({ ...res, ping: Math.round((end - start) * 0.45) }))
  })
}

var serversLeft = 0

export const loadServers = () => (dispatch, getState) => {
  const { servers } = getState()
  serversLeft = Object.keys(servers).length
  Object.keys(servers).map((ip) => dispatch(getServerStatus(ip)))
}

// the eagle has landed
export const getServers = (masterServerUrls = dewritoManifests) =>
  (dispatch) => Promise.all(

    dewritoManifests.map((url) => networkQueue.acquire().then((release) =>
      superFetch(url)
        .then(({ masterServers: masterServerUrls }) => (
          masterServerUrls.map(({ list: masterServerUrl }) => (
            networkQueue.acquire().then((innerRelease) =>
              superFetch(masterServerUrl)
                .then(({ result: { servers } }) => {
                  dispatch(Creators.gotServers(
                    servers
                  ))
                })
                .then(innerRelease)
                .catch(release)
            )
          ))
        ))
        .then(release)
        .catch(release)
    ))

  ).catch(console.error)
    .then(() => dispatch(Creators.serversLoaded))

const serverCache = []

export const getServerStatus = (serverUrl) =>
  (dispatch, getState) => (
    serverCache[serverUrl]
      ? (false)
      : networkQueue.acquire().then((release) => {
        const state = getState()
        const { ip, metaPort } = state.servers[serverUrl]
        superFetch(`http://${ip}:${metaPort}`)
          .then((serverData) => {
            dispatch(
              Creators.gotServerStatus({ ...serverData, ip })
            )
          })
          .then(() => { serverCache[serverUrl] = true })
          .catch(console.error)
          .then(release)
      })
  )

export const gotServerStatus = (state = INITIAL_STATE, { serverData }) => {
  serversLeft--
  return {
    ...state,
    servers: {
      ...state.servers,
      [serverData.ip]: {
        ...state.servers[serverData.ip],
        ...serverData,
      },
    },
  }
}

export const serversLoaded = (state = INITIAL_STATE) => ({
  ...state,
  fetching: false,
})

export const gotServers = (state = INITIAL_STATE, { servers }) => ({
  ...state,
  masterServersQueried: state.masterServersQueried + 1,
  fetching: state.masterServersQueried !== 3,
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

// map our action types to our reducer functions
export const HANDLERS = {
  [Types.GOT_SERVERS]: gotServers,
  [Types.GOT_SERVER_STATUS]: gotServerStatus,
}

export default createReducer(INITIAL_STATE, HANDLERS)
