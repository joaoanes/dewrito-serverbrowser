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
        <div>
          <div style={{ height: 20, width: '100%', color: 'white', backgroundColor: 'red' }}>No dew!</div>
          <Child
            {...this.props}
          />
        </div>
      )
    }
    return (
      <div>
        <Child
          {...this.props}
          dew={dew}
        />
      </div>
    )
  }
}

export default () => compose(
  ScriptLoader('dew://lib/dew.js'),
  DewLoader(),
)
