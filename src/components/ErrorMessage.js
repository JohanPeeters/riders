import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import {connect} from 'react-redux'
import {clear} from '../actions'

export const ErrorMessage = props => {

  const [open, setOpen] = useState(Boolean(props.errorMessage)?true:false)

  useEffect(() => {
    if (props.errorMessage) {
      setOpen(true)
    }
  }, [props.errorMessage])

  const handleClose = (event, reason) => {
    props.dispatch(clear())
    setOpen(false)
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={open}
      onClose={handleClose}
      message={props.errorMessage}
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="primary"
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>,
      ]}
    />
  )
}

const mapStateToProps = state => ({
  errorMessage: state.error
})

ErrorMessage.propTypes = {
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(ErrorMessage)
