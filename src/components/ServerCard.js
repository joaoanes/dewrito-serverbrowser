import React, { Component } from 'react'
import { ServerType } from '../redux/servers'

export default class ServerCard extends Component {
  props: {
    server: ServerType,
  }
  render () {
    const { server: { variantType, ip, sprintEnabled, eldewritoVersion, assassinationEnabled, status, name, map, players, hostPlayer } } = this.props

    const stringBoolean = (test) => test ? 'Yes :(' : 'No :)'

    return (
      <div id='gamecard'>
        <div id='cardheaderborder'>
          <div id='cardheader'>
            <div id='title'>
              <b>{variantType} on {map}</b>
            </div>
          </div>
        </div>
        { players && (
          <div id='scoreboard'>
            <div id='scoreBoardHeader'>Scoreboard</div>
            <table
              className='statBreakdown'

            >
              <thead className='tableHeader'>
                <tr>
                  <th>Name</th>
                  <th>
                    <center>Score</center>
                  </th>
                  <th>
                    <center>K</center>
                  </th>
                  <th>
                    <center>D</center>
                  </th>
                  <th>
                    <center>A</center>
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  players.map(({ name, score, kills, deaths, assists }) => (
                    <tr>
                      <td className='statLines'>{name}</td>
                      <td className='statLines'>
                        <center>{score}</center>
                      </td>
                      <td className='statLines'>
                        <center>{kills}</center>
                      </td>
                      <td className='statLines'>
                        <center>{deaths}</center>
                      </td>
                      <td className='statLines'>
                        <center>{assists}</center>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )
        }
        <div id='gameinfoborder'>
          <div id='gameinfo'>
            <div id='host'>
              <b>Host: </b>{hostPlayer}</div>
            <div id='name'>
              <b>Name: </b>{name}</div>
            <div id='sprint'>
              <b>Sprint: </b>
              {stringBoolean(sprintEnabled)}
            </div>
            <div id='assassinations'>
              <b>Assassinations: </b>
              {stringBoolean(assassinationEnabled)}
            </div>
            <div id='status'>
              <b>Status: </b>
              {status}
            </div>
            <div id='version'>
              <b>Version: </b>{eldewritoVersion}
            </div>
            <div id='ip'>
              <b>IP: </b>{ip}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
