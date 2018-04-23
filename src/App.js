import React, { Component } from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'

import './App.css' //eslint-disable-line
import { reset, hardStop } from './redux/servers'
import withDew from './hocs/withDew'
import ServerGrid from './components/ServerGrid'

class App extends Component {
  props: {
    dew: Object,
    reset: () => void,
  }

  state = {
    filter: null,
  }

  componentDidMount () {
    document.addEventListener('keydown', this.escFunction, false)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.escFunction, false)
  }

  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.props.dew.command('Game.SetMenuEnabled 0')
    }
  }

  render () {
    return (
      <div style={{ width: '100%', height: '100%', paddingTop: 20 }}>
        <ServerGrid dew={this.props.dew} />
        <div style={styles.settingsBox}>
          <div>
            <a
              style={{ display: 'block', color: 'white', textAlign: 'center' }}
              href='http://scooterpsu.github.io/new'
            >
               Switch to scooterpsu's server browser
            </a>
          </div>
          <div>
            <a
              style={{ display: 'block', color: 'white', textAlign: 'center', fontSize: 12, opacity: 0.8, marginTop: 10, marginBottom: 10 }}

            >
               code.dewrito.club - PRs welcome!
            </a>
          </div>
          <button
            className='closeButton'
            onClick={this.props.reset}
          >Refresh</button>
          <button
            className='closeButton'
            onClick={hardStop}
          >Stop!</button>

          <button
            className='closeButton'
            onClick={() => this.escFunction({ keyCode: 27 })}
          >Back to menu</button>
        </div>
      </div>
    )
  }
}

const styles = {
  settingsBox: {
    width: 200,
    height: 130,
    position: 'fixed',
    bottom: 20,
    right: 20,
    backgroundColor: '#13233d',
    padding: 20,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
}

export default compose(
  connect(
    null,
    ({
      reset: reset,
    })
  ),
  withDew(),
)(App)
