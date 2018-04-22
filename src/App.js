import React, { Component } from 'react'
import { connect } from 'react-redux'
import { compose, withProps, withState } from 'recompose'
import './App.css'
import { getServers, getServerNumber, getPlayerNumber, getFilteredServers } from './redux/servers'
import ServerRow from './components/ServerRow'
import { orderBy, map } from 'lodash'
import withDew from './hocs/withDew'
import withDewRcon from './hocs/withDewRcon'

class App extends Component {
  componentDidMount () {
    this.props.getServers()

    document.addEventListener('keydown', this.escFunction, false)
    this.lastUpdate = 0
  }

  state = {
    filter: null,
  }

  setFilter (type) {
    let order = 'asc'
    const { filter } = this.props
    if (filter && filter[0] === type) {
      order = 'desc'
    }

    this.props.setFilter([type, order])
  }

  onClick (server) {
    this.props.dewRcon.send('connect ' + server.ip)
  }

  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.props.dewRcon.send('menu.show')
      this.props.dewRcon.send('Game.SetMenuEnabled 0')
    }
  }

  shouldComponentUpdate (newProps) {
    console.log(newProps)
    if (newProps.fetching && !this.props.fetching) {
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

  render () {
    const { fetching, servers, serverNumber, playerNumber, filter } = this.props
    if (fetching) {
      return (
        <div style={{ color: 'white' }}>Loading servers...</div>
      )
    }

    return (
      <div>
        <div>Servers: {serverNumber}, players: {playerNumber}</div>
        <table
          id='serverTable'
          className='display dataTable no-footer'
          width='100%'
          role='grid'
        >
          <thead>
            <tr role='row' >
              <th
                className='sorting'
                aria-controls='serverTable'
                rowSpan='1'
                colSpan='1'
                aria-label=': activate to sort column ascending'
              >
                <div className='dataTables_sizing' />
              </th>
              <th
                className='sorting'
                onClick={() => this.setFilter('type')}
                aria-controls='serverTable'
                rowSpan='1'
                colSpan='1'
                aria-label='Type: activate to sort column ascending'
              >
                <div className='dataTables_sizing' >Type</div>
              </th>
              <th
                className='sorting'
                onClick={() => this.setFilter('name')}
                aria-controls='serverTable'
                rowSpan='1'
                colSpan='1'
                aria-label='Name: activate to sort column ascending'
              >
                <div className='dataTables_sizing' >Name</div>
              </th>
              <th
                className='sorting'
                onClick={() => this.setFilter('host')}
                aria-controls='serverTable'
                rowSpan='1'
                colSpan='1'
                aria-label='Host: activate to sort column ascending'
              >
                <div className='dataTables_sizing' >Host</div>
              </th>
              <th
                className='sorting'
                onClick={() => this.setFilter('ping')}
                aria-controls='serverTable'
                rowSpan='1'
                colSpan='1'
                aria-label='Ping: activate to sort column ascending'
              >
                <div className='dataTables_sizing' >Ping</div>
              </th>
              <th
                className='sorting'
                onClick={() => this.setFilter('map')}
                aria-controls='serverTable'
                rowSpan='1'
                colSpan='1'
                aria-label='Map: activate to sort column ascending'
              >
                <div className='dataTables_sizing' >Map</div>
              </th>
              <th
                className='sorting'
                onClick={() => this.setFilter('gametype')}
                aria-controls='serverTable'
                rowSpan='1'
                colSpan='1'
                aria-label='Gametype: activate to sort column ascending'
              >
                <div className='dataTables_sizing' >Gametype</div>
              </th>
              <th
                className='sorting'
                onClick={() => this.setFilter('variant')}
                aria-controls='serverTable'
                rowSpan='1'
                colSpan='1'
                aria-label='Variant: activate to sort column ascending'
              >
                <div className='dataTables_sizing' >Variant</div>
              </th>
              <th
                className='sorting'
                onClick={() => this.setFilter('numPlayers')}
                aria-controls='serverTable'
                rowSpan='1'
                colSpan='1'
                aria-label='Players: activate to sort column ascending'
              >
                <div className='dataTables_sizing' >Players</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {map(servers, (server) => (
              <ServerRow
                key={server.ip}
                onClick={(server) => this.onClick(server)}
                server={server}
              />
            ))}
          </tbody>
        </table>
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
    }),
    ({
      getServers,
    })
  ),
  withDew(),
  withDewRcon(),
)(App)
