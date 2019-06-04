import React from 'react'
import axios from 'axios'
import {shallow, mount} from 'enzyme'
import {createStore} from 'redux'
import {Provider} from 'react-redux'
import ConnectedRide, {Ride} from '../components/Ride'
import reducers from '../reducers'
import {login} from '../actions'


jest.mock('axios')

let wrapper
const errorMsg = 'access denied'
const ride1 = {from: "Antwerp", to: "Leuven", id: "aaaaaa", sub: '007'}
const ride2 = {from: 'a', to: 'b', id: "bbbbbbb"}

axios.mockRejectedValue({response: {data: {message: errorMsg}}})

describe('Ride', () => {

  beforeEach(async () => {
    wrapper = await shallow(
        <Ride ride={ride1} notify={e => {}} removeRide={e => {}} updateRide={e => {}}/>
    )
  })

  it('start and endpoint can be set via props', () => {
    expect(wrapper.dive()).toContainExactlyOneMatchingElement('WithStyles(CardHeader)')
    expect(wrapper.dive().find({title: 'Antwerp to Leuven'})).toExist()
    expect(wrapper.dive().find({title: 'a to b'})).not.toExist()
    wrapper.setProps({ride: ride2})
    expect(wrapper.dive().find({title: 'Antwerp to Leuven'})).not.toExist()
    expect(wrapper.dive().find({title: 'a to b'})).toExist()
  })
})

describe('ConnectedRide', () => {

  const store = createStore(reducers)

  beforeEach(async () => {
    store.dispatch(login({unseal: key => ({sub: '007'})}))
    wrapper = await mount(
      <Provider store={store}>
        <ConnectedRide ride={ride1} profileKey={{}}/>
      </Provider>
    )
  })

  afterEach(() => {
    // Clear all instances and calls to constructor and all methods:
    axios.mockClear()
  })

  it('calls the API when the delete button is pressed', () => {
    wrapper.find('#delete').filter('IconButton').simulate('click')
    expect(axios).toHaveBeenCalled()
  })
})
