import React from 'react'
import PropTypes from 'prop-types'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import {connect} from 'react-redux'
import {clear} from '../actions'

export class ErrorMessage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      open: Boolean(props.errorMessage)?true:false,
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.open && this.props.errorMessage) {
      this.setState({
        open: true
      })
      return
    }
    if (prevState.open && !this.props.errorMessage) {
      this.setState({
        open: false
      })
      return
    }
  }

  handleClose = (event, reason) => {
    this.props.dispatch(clear())
  }

  render() {
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={this.state.open}
        onClose={this.handleClose}
        message={this.props.errorMessage}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="primary"
            onClick={this.handleClose}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    )
  }
}

const mapStateToProps = state => ({
  errorMessage: state.error
})

ErrorMessage.propTypes = {
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(ErrorMessage)
