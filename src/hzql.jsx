import React, { Component } from 'react'

export class Provider extends Component {
  getChildContext () {
    return {
      horizon: this.props.horizon
    }
  }

  render () {
    return React.Children.only(this.props.children)
  }
}

Provider.childContextTypes = { horizon: React.PropTypes.any }

let nextVersion = 0

export const connect = (query, isLive) => Consumer => {
  let version = nextVersion++

  class Connection extends Component {
    constructor (props, context) {
      super(props, context)

      this.state = { results: null }
      this.version = version

      let q = this.context.horizon.model(query(this.context.horizon))(this.props)

      if (isLive) {
        q = q.watch()
      } else {
        q = q.fetch()
      }

      q.subscribe(results => this.setState({ results }))
    }

    render () {
      return <Consumer {...this.state.results} {...this.props} />
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    Connection.prototype.componentWillUpdate = function componentWillUpdate () {
      if (this.version == version) { return }

      this.version = version
      this.context.horizon.model(query(this.context.horizon))(this.props)
        .fetch()
        .subscribe(results => this.setState({ results }))
    }
  }

  Connection.contextTypes = { horizon: React.PropTypes.any }

  return Connection
}

connect.live = query => connect(query, true)
