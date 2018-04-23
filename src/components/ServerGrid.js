import React, { Component } from 'react'
import { connect } from 'react-redux'
import { compose, withState } from 'recompose'
import { AutoSizer, Table, Column, SortIndicator } from 'react-virtualized'
import '../App.css' //eslint-disable-line
import 'react-virtualized/styles.css' //eslint-disable-line

import { getServers, getServerNumber, getPlayerNumber, getFilteredServers, Creators, getSelected, ServerType } from '../redux/servers'
import ServerRow from './ServerRow'
import ServerCard from './ServerCard'

class App extends Component {
  props: {
    servers: [ServerType],
    dew: Object,
    fetching: boolean,
    filter: [string, string],
    setFilter: (filter: [string, string]) => void,
    serverNumber: number,
    playerNumber: number,
    selected: ServerType,
    getServers: () => void,
    setSelected: (server: ServerType) => void,
  }

  state = {
    filter: null,
  }

  componentDidMount () {
    this.props.getServers()

    document.addEventListener('keydown', this.escFunction, false)
    this.lastUpdate = 0
  }

  shouldComponentUpdate (newProps) {
    if (newProps.selected !== this.props.selected) {
      return true
    }

    if (newProps.fetching && !this.props.fetching) {
      return true
    }

    if (newProps.filter !== this.props.filter) {
      return true
    }
    const serversSinceLastRender = (newProps.servers.length - this.lastUpdate)

    if (serversSinceLastRender > 10) {
      this.lastUpdate = newProps.servers.length
      return true
    }

    return false
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.escFunction, false)
  }

  onClick (server) {
    this.props.dew.command('connect ' + server.ip)
    this.props.dew.command('Game.SetMenuEnabled 0')
  }

  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.props.dew.command('Game.SetMenuEnabled 0')
    }
  }

  renderRow = ({ rowData }) => <ServerRow server={rowData} />

  onSortClick = ({ defaultSortDirection, event, sortBy, sortDirection }) => {
    this.props.setFilter([sortBy, sortDirection])
  }

  setSelected = ({ event, index, rowData }) => {
    this.props.setSelected(rowData)
  }

  _headerRenderer = ({ dataKey, sortBy, sortDirection }) => (
    <div>
      {dataKey}
      {sortBy === dataKey && <SortIndicator sortDirection={sortDirection} />}
    </div>
  )

  connectServer = ({ rowData }) => {
    this.props.dew.command(`connect ${rowData.ip}`)
  }

  render () {
    const { fetching, selected, servers, serverNumber, playerNumber, filter } = this.props
    if (fetching) {
      return (
        <div style={{ color: 'white' }}>Loading servers...</div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ color: 'white' }}>Servers: {serverNumber}, players: {playerNumber}</div>
        <div style={{ color: 'white' }}>Double-click a server to connect.</div>
        <div style={{ display: 'flex', flexDirection: 'row', height: '100%', justifyContent: 'space-between' }}>
          <div style={{ width: '80%', height: '100%' }}>
            <AutoSizer>
              {({ width, height }) => (
                <Table
                  ref='Table'
                  headerHeight={80}
                  height={height}
                  overscanRowCount={20}
                  rowHeight={35}
                  sort={this.onSortClick}
                  sortBy={filter[0]}
                  sortDirection={filter[1]}
                  rowGetter={({ index }) => servers[index]}
                  rowCount={servers.length}
                  width={width}
                  onRowMouseOver={this.setSelected}
                  onRowDoubleClick={this.connectServer}
                >
                  <Column
                    label='Password required'
                    dataKey='passworded'
                    width={30}

                    cellDataGetter={({ rowData: { passworded } }) => passworded ? '🔒' : '✔️'}
                  />
                  <Column
                    label='Is dedicated'
                    dataKey='isDedicated'
                    width={100}

                    cellDataGetter={({ rowData: { isDedicated } }) => isDedicated ? 'Dedicated' : 'Listen server'}
                  />
                  <Column
                    label='Name'
                    dataKey='name'
                    width={180}
                    flexGrow={1}
                  />
                  <Column
                    label='Host'
                    dataKey='hostPlayer'
                    width={150}
                  />
                  <Column
                    label='Ping'
                    width={40}
                    headerRenderer={this._headerRenderer}
                    dataKey='ping'
                  />
                  <Column
                    label='Map'
                    width={120}
                    dataKey='map'
                  />
                  <Column
                    label='Gametype'
                    width={100}
                    dataKey='variantType'
                    cellDataGetter={({ rowData: { variantType } }) => variantType ? variantType[0].toUpperCase() + variantType.slice(1) : ''}
                  />
                  <Column
                    label='Variant'
                    width={120}
                    dataKey='variant'
                  />
                  <Column
                    label='Players'
                    width={100}
                    cellDataGetter={({ rowData: { numPlayers, maxPlayers } }) => `${numPlayers}/${maxPlayers}`}

                  />
                </Table>

              )}
            </AutoSizer>
          </div>
          <ServerCard server={selected} />
        </div>
      </div>
    )
  }
}

export default compose(
  withState('filter', 'setFilter', []),
  connect(
    (state, ownProps) => ({
      servers: getFilteredServers(state, ownProps),
      fetching: state.fetching,
      serverNumber: getServerNumber(state),
      playerNumber: getPlayerNumber(state),
      selected: getSelected(state),
    }),
    ({
      getServers,
      setSelected: Creators.setSelected,
    })
  ),
)(App)
