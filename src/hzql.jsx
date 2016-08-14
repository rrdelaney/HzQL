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

export const connect = query => Consumer => {
  class Connection extends Component {
    componentDidMount () {
      this.queries = []

      Object.keys(query).forEach(queryName => {
        let results = query[queryName](this.context.horizon)
        if (results.fetch) results = results.fetch()

        if (results.subscribe) {
          this.queries.push(results.subscribe(
            data => this.setState({ [queryName]: data, [queryName + '__loaded']: true }),
            error => this.setState({ [queryName + '__error']: error })
          ))
        } else {
          this.setState({ [queryName]: results })
        }
      })
    }

    componentWillUnmount () {
      this.queries.forEach(q => q.unsubscribe())
    }

    render () {
      return <Consumer {...this.state} />
    }
  }

  Connection.contextTypes = { horizon: React.PropTypes.any }

  return Connection
}

export const live = query => hz => query(hz).watch()
