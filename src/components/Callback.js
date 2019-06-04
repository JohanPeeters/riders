import React from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'

const Callback = props => {
  props.exchangeCodeForToken()
  props.history.replace('/')
  return (
    <p></p>
  )
}

Callback.propTypes = {
  history: PropTypes.object.isRequired,
  exchangeCodeForToken: PropTypes.func.isRequired
}

export default withRouter(Callback)
