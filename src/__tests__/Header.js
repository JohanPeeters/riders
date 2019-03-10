import React from 'react'
import {mount} from 'enzyme'
// import configureStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {createStore} from 'redux'
import Header from '../components/Header'
import reducers from '../reducers'
import {login} from '../actions'

describe('Header', () => {
  let wrapper
  const store = createStore(reducers)
  it('shows login button if there is no user in the store', () => {
    wrapper = mount(
      <Provider store={store}>
        <Header login={e => {}} logout={e => {}} menu={React.createElement('div')}/>
      </Provider>
    )
    expect(wrapper.find('WithStyles(Button)')).toExist()
    expect(wrapper.find('WithStyles(Button)').children()).toHaveText('Login')
    expect(wrapper.find('WithStyles(Button)').children()).not.toHaveText('Logout')
  })
  it('shows logout button if there is a user in the store', () => {
    store.dispatch(login({
      access_token: 'udsbfuebd',
      profile: {}
    }))
    wrapper = mount(
      <Provider store={store}>
        <Header login={e => {}} logout={e => {}} menu={React.createElement('div')}/>
      </Provider>
    )
    expect(wrapper.find('WithStyles(Button)')).toExist()
    expect(wrapper.find('WithStyles(Button)').children()).not.toHaveText('Login')
    expect(wrapper.find('WithStyles(Button)').children()).toHaveText('Logout')
  })
})
