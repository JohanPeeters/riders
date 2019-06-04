export const notify = text => {
  return {
    type: 'NOTIFY_ERROR',
    errorMessage: text
}}
export const clear = () => ({
  type: 'CLEAR_ERROR'
})
export const resetRides = rides => ({
  type: 'SET',
  rides: rides
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
export const refresh = () => ({
  type: 'REFRESH'
})
export const refreshing = () => ({
  type: 'REFRESHING'
})
