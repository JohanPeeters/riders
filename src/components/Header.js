import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import axios from 'axios'
import {withStyles} from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuIcon from '@material-ui/icons/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import {showAll, showMine, notify, add} from '../actions'
import AuthenticatedUserContext from '../AuthenticatedUserContext'
import EditRideDialog from './EditRideDialog'

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
}

class Header extends Component {

  static contextType = AuthenticatedUserContext

  constructor(props) {
    super(props)
    this.state = {
      showMenu: false,
      addingRide: false
    }
  }

  openAddRideDialog = event => {
    this.setState({
      addingRide: true
    })
    this.hideMenu()
  }

  closeAddRideDialog = event => {
    this.setState({
      addingRide: false
    })
  }

  addRide = ride => {
    const config = {
      baseURL: `https://${process.env.REACT_APP_API_HOST}`,
      url: `${process.env.REACT_APP_API_STAGE}/rides`,
      method: 'post',
      headers: {
        'x-api-key': process.env.REACT_APP_API_KEY,
        'Authorization': `Bearer ${this.context.access_token}`
      },
      data: ride
    }
    axios(config)
      .then(
        res => {
          console.log(`received id ${res.data} for ride`)
          ride.sub = this.context.profile.sub
          ride.id = res.data
          this.props.add(ride)
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
    this.props.showMine(this.context.profile.sub)
    this.hideMenu()
  }

  allRides = event => {
    this.props.showAll()
    this.hideMenu()
  }

  isLoggedIn = () => (
    Boolean(this.context && this.context.profile)
  )

  render() {
    const {classes} = this.props
    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" onClick={this.showMenu}>
              <MenuIcon />
            </IconButton>
            <Menu open={this.state.showMenu} anchorEl={this.state.anchorEl} onClose={this.hideMenu}>
              <MenuItem onClick={this.openAddRideDialog} disabled={!this.isLoggedIn()}>Add ride</MenuItem>
              <MenuItem onClick={this.allRides}>All rides</MenuItem>
              <MenuItem onClick={this.myRides} disabled={!this.isLoggedIn()}>My rides</MenuItem>
            </Menu>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              Ride Sharing
            </Typography>
            <Button color='inherit' onClick={this.isLoggedIn()?this.props.logout:this.props.login}>
              {this.isLoggedIn()?'Logout':'Login'}
            </Button>
          </Toolbar>
        </AppBar>
        <EditRideDialog
          open={this.state.addingRide}
          operation='Add'
          handleClose={this.closeAddRideDialog}
          submitRide={this.addRide}
        />
      </div>
    )
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  showAll: PropTypes.func.isRequired,
  showMine: PropTypes.func.isRequired,
}

const mapDispatchToProps = {
  showAll,
  showMine,
  notify,
  add
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(Header))
