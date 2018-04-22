import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getServerStatus } from '../redux/servers'

class ServerRow extends Component {
  props: {
    server: Object, // TODO: type
  }
  componentDidMount () {
    const { server, getServer } = this.props
    if (!server.port) {
      getServer()
    }
  }

  render () {
    const { passworded, port, name, hostPlayer, map, numPlayers, maxPlayers, ping } = this.props.server

    if (!port) {
      return (
        <tr
          role='row'
          className='even'
        >
          <td />
          <td />
          <td>Loading...</td>
          <td />
          <td>
            <img
              className='pingbars'
              src='images/2bars.png'
            /> {ping}</td>
          <td />
          <td />
          <td />
          <td />
        </tr>
      )
    }
    return (
      <tr
        role='row'
        className='even'
        onClick={() => this.props.onClick && this.props.onClick(this.props.server)}
      >
        <td>{passworded ? 'Has password' : null}</td>
        <td />
        <td>{name}</td>
        <td>{hostPlayer}</td>
        <td>
          <img
            className='pingbars'
            src='images/2bars.png'
          /> {ping}</td>
        <td>{map}</td>
        <td>Slayer</td>
        <td>None</td>
        <td>{numPlayers}/{maxPlayers}</td>
      </tr>
    )
  }
}

export default connect(
  null,
  (dispatch, ownProps) => ({
    getServer: () => dispatch(getServerStatus(ownProps.server.ip)),
  })
)(ServerRow)
