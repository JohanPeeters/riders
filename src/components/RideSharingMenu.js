import React, {useState} from 'react'
import {connect} from 'react-redux'
import {withStyles} from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuIcon from '@material-ui/icons/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import EditRideDialog from './EditRideDialog'
import {showAll, showMine, notify, refresh} from '../actions'
import axios from 'axios'

const styles = {
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
}

const RideSharingMenu = props => {

  const [show, setShow] = useState(false)
  const [addingRide, setAddingRide] = useState(false)
  const [anchorEl, setAnchorEl] = useState(undefined)

  const addRide = ride => {
    const config = {
      baseURL: `https://${process.env.REACT_APP_API_HOST}`,
      url: `${process.env.REACT_APP_API_STAGE}/rides`,
      method: 'post',
      headers: {
        'x-api-key': process.env.REACT_APP_API_KEY,
        'Authorization': `Bearer ${props.user.unseal(props.accessTokenKey)}`
      },
      data: ride
    }
    axios(config)
      .then(
        res => {
          ride.sub = props.user.unseal(props.profileKey).sub
          ride.id = res.data
          props.refresh()
      })
      .catch(
        error => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            props.notify(`cannot share ride - ${error.response.data.message}`)
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            props.notify(`no response to share request`)
          } else {
            // Something happened in setting up the request that triggered an Error
            props.notify(`cannot share ride - ${error.message}`)
          }
      })
      closeAddRideDialog()
  }

  const closeAddRideDialog = event => {
    setAddingRide(false)
  }

  const showMenu = event => {
    setAnchorEl(event.currentTarget)
    setShow(true)
  }

  const hideMenu = event => {
    setAnchorEl(undefined)
    setShow(false)
  }

  const myRides = event => {
    props.showMine(props.user.unseal(props.profileKey).sub)
    hideMenu()
  }

  const allRides = event => {
    props.showAll()
    hideMenu()
  }

  const openAddRideDialog = event => {
    setAddingRide(true)
    hideMenu()
  }

  const isLoggedIn = () => {
    return Boolean(props.user)
  }

  const {classes} = props
  return(
    <div>
      <IconButton className={classes.menuButton} color="inherit" onClick={showMenu}>
        <MenuIcon />
      </IconButton>
      <Menu open={show} anchorEl={anchorEl} onClose={hideMenu}>
        <MenuItem onClick={openAddRideDialog} disabled={!isLoggedIn()}>Add ride</MenuItem>
        <MenuItem onClick={allRides}>All rides</MenuItem>
        <MenuItem onClick={myRides} disabled={!isLoggedIn()}>My rides</MenuItem>
      </Menu>
      <EditRideDialog
        open={addingRide}
        operation='Add'
        handleClose={closeAddRideDialog}
        submitRide={addRide}
      />
    </div>
  )
}

  const mapStateToProps = state => ({
    user: state.user
  })

  const mapDispatchToProps = {
    showAll,
    showMine,
    notify,
    refresh
  }

  export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RideSharingMenu))
