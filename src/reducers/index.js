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
    case 'REMOVE':
      return state.filter(ride => ride.id !== action.ride.id)
    case 'ADD':
      return [
        action.ride,
        ...state,
      ]
    case 'UPDATE':
      return state.map(ride => (ride.id === action.ride.id?{
        from: action.ride.from,
        to: action.ride.to,
        when: action.ride.when,
        contact: action.ride.contact,
        id: ride.id,
        sub: ride.sub
      }:ride))
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

export default combineReducers({
  error,
  rides,
  filter,
  user
})
