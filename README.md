# HzQL

> Easy querying for Horizon and React

HzQL with React colocates your data and components. It requires Horizon 2
for its new `hz.model` query.

## Setting up HzQL

HzQL exports a `Provider` component to wrap your app in.
Any component using a query must be a child of `Provider`

__Example__

```js
import React from 'react'
import { Provider } from 'hzql'
import Horizon from '@horizon/client'
import App from './App'

let horizon = new Horizon()

let WrappedApp = () =>
  <Provider horizon={horizon}>
    <App />
  </Provider>
```

## Writing Queries

Queries are a function of the form `hz => props => query`. A query can use the
props from the parent component to write the query. The exported `connect`
function wires up a query to a component. The keys of the query will be passed
as props to the immediate child

__Example__

```js
import React from 'react'
import { connect } from 'hzql'

const App = props =>
  <pre>Users: {this.props.users}</pre>

const query = hz => props => ({
  users: hz('post').order('date')
})

export default connect(query)(App)
```

To run a live query, use `connect.live` instead of `connect`

## Mutations

The horizon instance is passed down to child components, which can perform
mutations.

__Example__

```js
import React, { Component } from 'react'
import { connect } from 'hzql'

class App extends Component {
  constructor (props) {
    super(props)

    this.state = { input: '' }

    this.handleInput = this.handleInput.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleInput (e) {
    this.setState({ input: e.target.value })
  }

  handleSubmit () {
    this.props.horizon('posts').store({ message: this.state.input })
  }

  render () {
    return <div>
      <input onChange={this.handleInput} value={this.state.input} />
      <button onClick={this.handleSubmit}>Submit</button>
    </div>
  }
}

export default connect(App)(hz => props => ({}))
```

## Server side rendering
