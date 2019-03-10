export const notify = text => ({
  type: 'NOTIFY_ERROR',
  errorMessage: text
})
export const clear = () => ({
  type: 'CLEAR_ERROR'
})
export const resetRides = rides => ({
  type: 'SET',
  rides: rides
})
export const removeRide = ride => ({
  type: 'REMOVE',
  ride: ride
})
export const addRide = ride => ({
  type: 'ADD',
  ride: ride
})
export const updateRide = ride => ({
  type: 'UPDATE',
  ride: ride
})
export const showAll = () => ({
  type: 'ALL'
})
export const showMine = sub => ({
  type: 'MINE',
  sub: sub
})
export const login = user => ({
  type: 'LOG_IN',
  user: user
})
export const logout = () => ({
  type: 'LOG_OUT'
})
