import {createStore} from 'redux'
import reducers from '../reducers'
import {login} from '../actions'

describe('actions', () => {

  let store

  it('should create a user on login', () => {
      store = createStore(reducers)
      const james = {unseal: key => ({sub: '007'})}
      store.dispatch(login(james))
      expect(store.getState().user).toEqual(james)
      expect(store.getState().user.unseal({}).sub).toEqual('007')
  })
})
