import React, { Component } from 'react'
import ScriptLoader from 'react-script-loader-hoc'
import { compose } from 'recompose'

const DewLoader = () => (Child) => class WithDew extends Component {
  static getDerivedStateFromProps (props) {
    const { scriptsLoadedSuccessfully } = props
    if (scriptsLoadedSuccessfully) {
      return { dew: dew } //eslint-disable-line
    } else {
      return {}
    }
  }

  state = {
    dew: null,
  }

  render () {
    const { dew } = this.state
    if (!dew) {
      return (
        <div style={styles.full}>
          <div style={{ height: 20, padding: 5, width: '100%', color: 'white', backgroundColor: 'red' }}>No dew?! You won't be able to connect unless you're ingame!</div>
          <Child
            {...this.props}
          />
        </div>
      )
    }
    return (
      <div style={styles.full}>
        <Child
          {...this.props}
          dew={dew}
        />
      </div>
    )
  }
}

const styles = {
  full: {
    width: '100%',
    height: '100%',
  },
}

export default () => compose(
  ScriptLoader('dew://lib/dew.js'),
  DewLoader(),
)
