import React, {useEffect} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'

const Callback = props => {

  useEffect(() => {
    props.exchangeCodeForToken()
    return () => props.history.replace('/')
  },
  [props]
)

  return (
    <p></p>
  )
}

Callback.propTypes = {
  history: PropTypes.object.isRequired,
  exchangeCodeForToken: PropTypes.func.isRequired
}

export default withRouter(Callback)
