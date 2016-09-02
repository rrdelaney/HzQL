# HzQL

> Data Fetching for React Using Horizon 2

```
npm install --save hzql
```

- Easy bindings from Horizon into React
- Support for Horizon 2
- Support for server side rendering

HzQL with React colocates your data and components. It requires Horizon 2
for its new `hz.model` query.

## Example

```js
import React, { Component } from 'react'
import { render } from 'react-dom'
import Horizon from '@horizon/client'
import { Provider, connect } from 'hzql'

const horizon = new Horizon

@connect(hz => props => ({
  users: hz('users'),
  posts: hz('posts').order('date')
}))
class UserPosts extends Component {
  render () {
    if (!this.props.users || !this.props.posts) return <span>Loading...</span>
    
    return <div>
      <h1>Users:</h1>
      {this.props.users.map(u => <li key={u.id}>u.name</li>)}
      <h1>Posts:</h1>
      {this.props.posts.map(p => <li key={p.id}>p.title</li>)}
    </div>
  }
}

render(<Provider horizon={horizon}>
  <UserPosts />
</Provider>, document.getElementById('root'))
```

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
  <pre>Users: {<pre>Users: {props.users}</pre>props.users}</pre>

const query = hz => props => ({
  users: hz('post').order('date')
})

export default connect(query)(App)
```

To run a live query, use `connect.live` instead of `connect`
Using the new decorator syntax:

```js
import React from 'react'
import { connect } from 'hzql'

@connect.live(hz => props => ({
  users: hz('post').order('date')
}))
export default class App {
  render () {
    return <pre>Users: {this.props.users}</pre>
  }
}
```

## Waiting for Results

If you would prefer for the component to not render at all until the results
of the query arrive, you can use `connect.await`. This will cause your
component to always return `null` from `render` until the query is finished.

The watching equivalent of this is `connect.liveAwait`

__Example__

```js
import React from 'react'
import { connect } from 'hzql'

const App = props =>
  <pre>Users: {this.props.users}</pre>

const query = hz => props => ({
  users: hz('post').order('date')
})

// This will render to `null` until `hz('posts').order('date')` is retrieved
export default connect.await(query)(App)
```

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

To render on the server, install `node-fibers` using

```
npm i -S node-fibers
```

In your server code, your call to `renderToString` should look something like

```js
import React from 'react'
import { renderToString } from 'react-dom/server'
import Fiber from 'fibers'
import ws from 'ws'
import Horizon from '@horizon/client'
import { Provider } from 'hzql'
import App from './App'

// Give Horizon a websocket library to use
global.WebSocket = ws

let hz = new Horizon({ host: 'localhost:8181' })

// Wrap your call to `renderToString` with a Fiber
Fiber(() => {

  // Pass the horizon instance into provider like normal
  // Make sure to pass the `Fiber` library into `Provider` so it
  // knows to use it
  let html = renderToString(<Provider horizon={hz} fiber={Fiber}>
    <App />
  </Provider>)

  // Do something with `html`, e.x. `ctx.body = html`

  // Make sure to disconnect or the server won't stop
  hz.disconnect()
}).run()

// Run the Fiber
```
