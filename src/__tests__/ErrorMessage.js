import React from 'react'
import {shallow, mount} from 'enzyme'
import {createStore} from 'redux'
import {Provider} from 'react-redux'
import uuid from 'uuid/v1'
import ConnectedErrorMessage, {ErrorMessage} from '../components/ErrorMessage'
import reducers from '../reducers'
import {notify} from '../actions'

let errorMsg

beforeEach(() => {
  errorMsg = uuid()
})

describe('ErrorMessage component', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallow(<ErrorMessage errorMessage={errorMsg} dispatch={() => {}}/>)
  })
  it('shows the error message', () => {
    expect(wrapper).toHaveProp('message', errorMsg)
    expect(wrapper).toHaveProp('open', true)
  })
  it('remains hidden if there is no error message', () => {
    wrapper = shallow(<ErrorMessage dispatch={() => {}}/>)
    expect(wrapper).toHaveProp('open', false)
  })
})

describe('ErrorMessage container', () => {
  let wrapper
  const store = createStore(reducers)
  beforeEach(() => {
    wrapper = mount(
      <Provider store={store}>
        <ConnectedErrorMessage/>
      </Provider>
    )
  })
  it('wraps an ErrorMessage component', () => {
    expect(wrapper).toContainMatchingElement(ErrorMessage)
  })
  describe('when there is an error notification', () => {
    beforeEach(() => {
      store.dispatch(notify(errorMsg))
    })
    xit('propagates the error message as props', () => {
      expect(wrapper.find(ErrorMessage)).toHaveProp('errorMessage', errorMsg)
    })
    describe('when the close button is pressed', () => {
      beforeEach(async () => {
        wrapper.find('Snackbar').prop('onClose')()
        await wrapper.update()
      })
      it('hides again',() => {
        expect(wrapper.find('Snackbar')).toHaveProp('open', false)
      })
      it('wipes the error message', () => {
        expect(wrapper.find(ErrorMessage)).toHaveProp('errorMessage', '')
      })
    })
  })
})
