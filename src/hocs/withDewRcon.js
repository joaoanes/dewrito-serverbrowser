import React, { Component } from 'react'

export default () => (Child) => class WithDewRcon extends Component {
  state = {
    dewRcon: null
  }

  dewRconConnected = false

  componentDidMount() {
    this.startRconConnection()
  }

  startRconConnection() {
    const dewRcon = new dewRconHelper();

    dewRcon.dewWebSocket.onopen = () => {
      if (!this.dewRconConnected) {
         this.dewRconConnected = true;
      }
    };
    dewRcon.dewWebSocket.onerror =  () => {
      //jQuery("#connectionStatus").text('Not connected. Is the game running?');
      this.dewRconConnected = false;
      if (!this.dewRconConnected) {
        this.startRconConnection();
      }
    };
    dewRcon.dewWebSocket.onmessage = (message) => {
      if (typeof dewRcon.callback === 'function')
        dewRcon.callback(message.data);
      dewRcon.lastMessage = message.data;
    };
    dewRcon.dewWebSocket.onclose = (message) => {
      //jQuery("#connectionStatus").text('Disconnected');
      //console.log(message.code);
      this.sdewRconConnected = false;
    }

    this.setState({ dewRcon })
  }

  render () {
    const {dewRcon} = this.state

    if (!dewRcon) {
      return <div>Loading</div>
    }

    return (
      <Child
        {...this.props}
        dewRcon={dewRcon}
      />

    )
  }
}

const dewRconHelper = function () {
  window.WebSocket = window.WebSocket || window.MozWebSocket;
  this.dewWebSocket = new WebSocket('ws://127.0.0.1:11776', 'dew-rcon');
  this.lastMessage = "";
  this.lastCommand = "";
  this.callback = {};
  this.open = false;

  this.send = function (command, cb) {
    try {
      this.dewWebSocket.send(command);
      this.lastCommand = command;
      this.callback = cb;
      //console.log(command);
    } catch (e) {
      console.log(e);
    }
  }
}
