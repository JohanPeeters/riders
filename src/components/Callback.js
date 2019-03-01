import React from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'

export class Callback extends React.Component {
  componentDidMount() {
    this.props.exchangeCodeForToken()
    this.stripCode()
  }

  stripCode = () => {
    this.props.history.replace('/')
  }

  render() {
    return (
      <p></p>
    );
  }
}

Callback.propTypes = {
  history: PropTypes.object.isRequired,
  exchangeCodeForToken: PropTypes.func.isRequired
}

export default withRouter(Callback)
