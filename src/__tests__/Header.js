import React from 'react'
import {mount} from 'enzyme'
import configureStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import Header from '../components/Header'
import AuthenticatedUserContext from '../AuthenticatedUserContext'
import {UserManager} from 'oidc-client'

const mockSigninRedirect = jest.fn()
const mockSignoutRedirect = jest.fn()
const mockAddRide = jest.fn()
jest.mock('oidc-client')
UserManager.mockImplementation(() => {
      return {
        signinRedirect: mockSigninRedirect,
        signoutRedirect: mockSignoutRedirect
      }
    })
const middlewares = []
const store = configureStore(middlewares)()

describe('Header', () => {
  let wrapper
  it('shows login button if there is no context', () => {
    wrapper = mount(
      <Provider store={store}>
        <AuthenticatedUserContext.Provider value={null}>
          <Header userManager={new UserManager()} addRide={mockAddRide}/>
        </AuthenticatedUserContext.Provider>
      </Provider>
    )
    expect(wrapper.find('WithStyles(Button)')).toExist()
    expect(wrapper.find('WithStyles(Button)').children()).toHaveText('Login')
    expect(wrapper.find('WithStyles(Button)').children()).not.toHaveText('Logout')
  })
  it('shows login button if the context is undefined', () => {
    wrapper = mount(
      <Provider store={store}>
        <AuthenticatedUserContext.Provider value={undefined}>
          <Header userManager={new UserManager()} addRide={mockAddRide}/>
        </AuthenticatedUserContext.Provider>
      </Provider>
    )
    expect(wrapper.find('WithStyles(Button)')).toExist()
    expect(wrapper.find('WithStyles(Button)').children()).toHaveText('Login')
    expect(wrapper.find('WithStyles(Button)').children()).not.toHaveText('Logout')
  })
  it('shows logout button if there is a context', () => {
    wrapper = mount(
      <Provider store={store}>
        <AuthenticatedUserContext.Provider value={{profile: {sub: 'aaaaaa'}}}>
          <Header userManager={new UserManager()} addRide={mockAddRide}/>
        </AuthenticatedUserContext.Provider>
      </Provider>
    )
    expect(wrapper.find('WithStyles(Button)')).toExist()
    expect(wrapper.find('WithStyles(Button)').children()).not.toHaveText('Login')
    expect(wrapper.find('WithStyles(Button)').children()).toHaveText('Logout')
  })
})
