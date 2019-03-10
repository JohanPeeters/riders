import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withStyles} from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuIcon from '@material-ui/icons/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import EditRideDialog from './EditRideDialog'
import {showAll, showMine, notify, addRide} from '../actions'
import axios from 'axios'

const styles = {
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
}

class RideSharingMenu extends Component {

  constructor(props) {
    super(props)
    this.state = {
      showMenu: false,
      addingRide: false
    }
  }

  addRide = ride => {
    const config = {
      baseURL: `https://${process.env.REACT_APP_API_HOST}`,
      url: `${process.env.REACT_APP_API_STAGE}/rides`,
      method: 'post',
      headers: {
        'x-api-key': process.env.REACT_APP_API_KEY,
        'Authorization': `Bearer ${this.props.user.access_token}`
      },
      data: ride
    }
    axios(config)
      .then(
        res => {
          console.log(`received id ${res.data} for ride`)
          ride.sub = this.props.user.profile.sub
          ride.id = res.data
          this.props.addRide(ride)
      })
      .catch(
        error => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            this.props.notify(`cannot share ride - ${error.response.data.message}`)
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            this.props.notify(`no response to share request`)
          } else {
            // Something happened in setting up the request that triggered an Error
            this.props.notify(`cannot share ride - ${error.message}`)
          }
      })
      this.closeAddRideDialog()
  }

  closeAddRideDialog = event => {
    this.setState({
      addingRide: false
    })
  }

  showMenu = event => {
    this.setState({
      anchorEl: event.currentTarget,
      showMenu: true
    })
  }

  hideMenu = event => {
    this.setState({
      anchorEl: null,
      showMenu: false
    })
  }

  myRides = event => {
    this.props.showMine(this.props.user.profile.sub)
    this.hideMenu()
  }

  allRides = event => {
    this.props.showAll()
    this.hideMenu()
  }

  openAddRideDialog = event => {
    this.setState({
      addingRide: true
    })
    this.hideMenu()
  }

  isLoggedIn = () => {
    return Boolean(this.props.user)
  }

  render() {
    const {classes} = this.props
    return(
      <div>
        <IconButton className={classes.menuButton} color="inherit" onClick={this.showMenu}>
          <MenuIcon />
        </IconButton>
        <Menu open={this.state.showMenu} anchorEl={this.state.anchorEl} onClose={this.hideMenu}>
          <MenuItem onClick={this.openAddRideDialog} disabled={!this.isLoggedIn()}>Add ride</MenuItem>
          <MenuItem onClick={this.allRides}>All rides</MenuItem>
          <MenuItem onClick={this.myRides} disabled={!this.isLoggedIn()}>My rides</MenuItem>
        </Menu>
        <EditRideDialog
          open={this.state.addingRide}
          operation='Add'
          handleClose={this.closeAddRideDialog}
          submitRide={this.addRide}
        />
      </div>
    )}
  }

  const mapStateToProps = state => ({
    user: state.user
  })

  const mapDispatchToProps = {
    showAll,
    showMine,
    notify,
    addRide
  }

  export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RideSharingMenu))
