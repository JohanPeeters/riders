import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {DialogTitle, DialogContent, DialogActions, Dialog, TextField, Button} from '@material-ui/core'
import {safeContact} from '../helpers/sanitize'

const EditRideDialog = props => {

  const ensure2Digits = number => {
    return ('0' + number).slice(-2)
  }
  const now = new Date(Date.now())
  const tomorrow = `${1900 + now.getYear()}-${ensure2Digits(now.getMonth() + 1)}-${ensure2Digits(now.getDate() + 1)}T12:00`

  const [values, setValues] = useState({when: tomorrow})

  const handleChange = ({target: {name, value}}) => {
    setValues(values => ({...values, [name]: value}))
  }

  const submitRide = event => {
    props.submitRide({
      from: values.from,
      to: values.to,
      when: values.when,
      contact: safeContact(values.contact)
    })
    props.handleClose()
  }

  return (
    <Dialog open={props.open} onClose={props.handleClose}>
      <DialogTitle>{props.operation} Ride</DialogTitle>
      <DialogContent>
        <TextField
          name='from'
          onChange={handleChange}
          label="From"
          defaultValue={props.ride?props.ride.from:''}/>
        <TextField
          name='to'
          onChange={handleChange}
          defaultValue={props.ride?props.ride.to:''}
          label="To"/>
        <TextField
          name='when'
          onChange={handleChange}
          type='datetime-local'
          defaultValue={props.ride?props.ride.when:tomorrow}
          label="When"/>
        <TextField
          name='contact'
          onChange={handleChange}
          type='url'
          defaultValue={props.ride?props.ride.contact:''}
          label="Contact"/>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={submitRide} color="primary">
          {props.operation}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

EditRideDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  operation: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  submitRide: PropTypes.func.isRequired,
  ride: PropTypes.shape({
    id: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired
  })
}

export default EditRideDialog
