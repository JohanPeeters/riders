import {combineReducers} from 'redux'

const error = (state = '', action) => {
  switch (action.type) {
    case 'NOTIFY_ERROR':
      return action.errorMessage
    case 'CLEAR_ERROR':
      return ''
    default:
      return state
  }
}

const rides = (state = [], action) => {
  switch (action.type) {
    case 'SET':
      return action.rides
    default:
      return state
  }
}

const filter = (state = ride => true, action) => {
  switch (action.type) {
    case 'ALL':
      return ride => true
    case 'MINE':
      return ride => ride.sub === action.sub
    default:
      return state
  }
}

const user = (state = null, action) => {
  switch (action.type) {
    case 'LOG_IN':
      return action.user
    case 'LOG_OUT':
      return null
    default:
      return state
  }
}

const fresh = (state = false, action) => {
  switch (action.type) {
    case 'REFRESH':
      return false
    case 'REFRESHING':
      return true
    default:
      return state
  }
}

export default combineReducers({
  error,
  rides,
  filter,
  user,
  fresh
})
