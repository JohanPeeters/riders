import React from 'react';
import ReactDOM from 'react-dom'
import {createStore} from 'redux'
import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router-dom'
import reducers from './reducers'
import App from './App'
import * as serviceWorker from './serviceWorker'
const store = createStore(reducers)

ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <App/>
    </Provider>
  </BrowserRouter>
  , document.getElementById('root'))

serviceWorker.register()
