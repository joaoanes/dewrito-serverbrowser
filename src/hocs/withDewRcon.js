import React, { Component } from 'react'

export default () => (Child) => class WithDewRcon extends Component {
  props: {
    dew: Object,
  }

  state = {
    dewRcon: null,
    dewRconConnected: false,
  }

  dewRconConnected = false

  componentDidMount () {
    this.startRconConnection()
  }

  startRconConnection () {
    const dewRcon = new DewRconHelper()

    dewRcon.dewWebSocket.onopen = () => {
      this.setState({ dewRconConnected: true })
    }
    dewRcon.dewWebSocket.onerror = (err) => {
      // jQuery("#connectionStatus").text('Not connected. Is the game running?')
      console.error('dew err', err)
      this.setState({ dewRconConnected: false })
      this.startRconConnection()
    }
    dewRcon.dewWebSocket.onmessage = (message) => {
      // console.log('message', message)
      if (typeof dewRcon.callback === 'function') { dewRcon.callback(message.data) }
      dewRcon.lastMessage = message.data
    }
    dewRcon.dewWebSocket.onclose = (message) => {
      // jQuery("#connectionStatus").text('Disconnected');
      // console.log(message.code);
      this.setState({ dewRconConnected: false })
    }

    this.setState({ dewRcon })
  }

  render () {
    const { dew } = this.props
    const { dewRcon, dewRconConnected } = this.state

    if (!dew || !dewRconConnected) {
      return (
        <div>
          <div style={{ height: 20, width: '100%', color: 'white', backgroundColor: 'red' }}>No dew rcons!</div>
          <Child
            {...this.props}
          />
        </div>
      )
    }

    return (
      <Child
        {...this.props}
        dewRcon={dewRcon}
      />

    )
  }
}

const DewRconHelper = function () {
  const WebSocket = window.WebSocket || window.MozWebSocket
  this.dewWebSocket = new WebSocket('ws://127.0.0.1:11776', 'dew-rcon')
  this.lastMessage = ''
  this.lastCommand = ''
  this.callback = {}
  this.open = false

  this.send = function (command, cb) {
    try {
      this.dewWebSocket.send(command)
      this.lastCommand = command
      this.callback = cb
      // console.log(command);
    } catch (e) {
      console.error(e)
    }
  }
}
