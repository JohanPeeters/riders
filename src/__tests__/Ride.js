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
const ride1 = {from: "Antwerp", to: "Leuven", id: "aaaaaa"}
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
  it('by default is not expanded', () => {
    expect(wrapper.dive()).toHaveState({expanded: false})
  })
  it('expands when the more button is clicked', () => {
    wrapper = wrapper.dive()
    wrapper.find('#more').simulate('click')
    expect(wrapper).toHaveState({expanded: true})
  })
})

describe('ConnectedRide', () => {

  const store = createStore(reducers)

  beforeEach(async () => {
    store.dispatch(login({
      access_token: 'udsbfuebd',
      profile: {}
    }))
    wrapper = await mount(
      <Provider store={store}>
        <ConnectedRide ride={ride1}/>
      </Provider>
    )
  })

  afterEach(() => {
    // Clear all instances and calls to constructor and all methods:
    axios.mockClear()
  })

  it('calls the API when the delete button is pressed', () => {
    wrapper.setProps({disabled: false})
    wrapper.find('#delete').filter('IconButton').simulate('click')
    expect(axios).toHaveBeenCalled()
  })

  it('notifies the store if a delete action returns an error', async () => {
    wrapper.setProps({disabled: false})
    await wrapper.find(`#delete`).filter('IconButton').simulate('click')
    expect(store.getState().errorMessage).toEqual(`cannot delete - ${errorMsg}`)
  })
})
