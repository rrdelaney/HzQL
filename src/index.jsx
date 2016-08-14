import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { createDevTools } from './devTools'
import { Provider, connect, live } from './hzql'

let root = document.getElementById('root')

let DevTools = createDevTools(horizon)

class RawApp extends Component {
  constructor (props) {
    super(props)

    this.state = { message: '' }
    this.handleInput = this.handleInput.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleInput (e) {
    this.setState({
      message: e.target.value
    })
  }

  handleSubmit () {
    this.props.submitPost(this.state.message)
  }

  render () {
    return <div>
      <h1>Posts</h1>
      {!this.props.posts__loaded
        ? 'Loading...'
        : this.props.posts.map(p => <li key={p.time.toISOString()}>{p.message} - <small>{p.time.toISOString()}</small></li>)}
      <div>
        <h1>Submit Post</h1>
        <input type='text' value={this.state.message} onChange={this.handleInput} />
        <button onClick={this.handleSubmit}>Submit</button>
      </div>
    </div>
  }
}

const App = connect({
  posts: live(_ => _('posts').order('time').limit(5)),
  submitPost: _ => message => _('posts').insert({ message, time: new Date })
})(RawApp)

ReactDOM.render(<div>
  <Provider horizon={horizon}>
    <App />
  </Provider>
  <DevTools />
</div>, root)
