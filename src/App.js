import React, { Component } from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import './App.css'
import { getServers, loadServers } from './redux/servers'
import ServerRow from './components/ServerRow'
import { orderBy, map } from 'lodash'
import withDewRcon from './hocs/withDewRcon'

class App extends Component {
  componentDidMount () {
    this.props.getServers()
  }

  state = {
    filter: null,
  }

  componentWillReceiveProps (props, previousProps) {
    if (!props.fetching && this.props.fetching) {
      console.log('here goes everything')
      props.loadServers()
    }
  }

  setFilter (type) {
    let order = 'asc'
    const { filter } = this.state
    if (filter && filter[0] === type) {
      order = 'desc'
    }
    this.setState({ filter: [type, order] })
  }

  onClick (server) {
    this.props.dewRcon.send('connect ' + server.ip)
  }

  render () {
    const { fetching, servers } = this.props
    const { filter } = this.state
    if (fetching) {
      return (
        <div>Loading servers...</div>
      )
    }

    let validServers = Object.values(servers).filter(server => server.port)
    if (filter != null) {
      const [type, order] = filter
      validServers = orderBy(validServers, [type], [order])
    }

    return (
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
          {map(validServers, (server) => (
            <ServerRow
              key={server.ip}
              onClick={this.props.onClick}
              server={server}
            />
          ))}
        </tbody>
      </table>
    )
  }
}

export default compose(
  connect(
    (state) => ({
      servers: state.servers,
      fetching: state.fetching,
    }),
    ({
      getServers: getServers,
      loadServers: loadServers,
    })
  ),
  withDewRcon(),
)(App)
