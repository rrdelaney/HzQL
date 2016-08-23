import React, { Component } from 'react'

export class Provider extends Component {
  getChildContext () {
    return {
      horizon: this.props.horizon,
      Fiber: this.props.fiber || false
    }
  }

  render () {
    return React.Children.only(this.props.children)
  }
}

Provider.childContextTypes = {
  horizon: React.PropTypes.any,
  Fiber: React.PropTypes.any
}

let nextVersion = 0

export const connect = (query, shouldWait, isLive) => Consumer => {
  let version = nextVersion++

  class Connection extends Component {
    constructor (props, context) {
      super(props, context)

      this.state = { results: null }
      this.version = version
    }

    componentWillMount () {
      let q = this.context.horizon.model(query(this.context.horizon))(this.props)

      if (isLive) {
        q = q.watch()
      } else {
        q = q.fetch()
      }

      let fiber

      let sub = q.subscribe(results => {
        this.setState({ results })
        if (this.context.Fiber) fiber.run()
      })

      if (this.context.Fiber) {
        fiber = this.context.Fiber.current
        this.context.Fiber.yield()
      }
    }

    render () {
      return shouldWait && !this.state.results
        ? null
        : <Consumer {...this.state.results} {...this.props} horizon={this.context.horizon} />
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    Connection.prototype.componentWillUpdate = function componentWillUpdate () {
      if (this.version == version) { return }

      this.version = version
      let q = this.context.horizon.model(query(this.context.horizon))(this.props)

      if (isLive) {
        q = q.watch()
      } else {
        q = q.fetch()
      }

      q.subscribe(results => this.setState({ results }))
    }
  }

  Connection.contextTypes = {
    horizon: React.PropTypes.any,
    Fiber: React.PropTypes.any
  }

  return Connection
}

connect.live = query => connect(query, false, true)
connect.await = query => connect(query, true, false)
connect.liveAwait = query => connect(query, true, true)
