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

  login = () => {
    this.props.userManager.signinRedirect()
  }

  logout = () => {
    // the most logical implementation would be
    // this.props.userManager.signoutRedirect()
    // unfortunately this does not work because the query parameters Cognito
    // expects are not sent by oidc-client.
    // Without arguments, as it is being called here, oidc-client sends the
    // id_token in a parameter named id_token_hint.
    // By judiciously adding parameters, it can be arranged to also send state and post_logout_redirect_uri.
    // The latter could have been useful since Cognito expects a parameter `logout_uri` with the same semantics.
    // It also expects the client_id. These will be supplied in the redirect below.
    // But first, we remove the user from the store. If we do not do this, the app will continue
    // to use stored tokens. Since we are self-contained tokens, these are not validated
    // with the issuer and will continue to afford access.
    this.props.userManager.removeUser()
    // redirect the browser to the Cognito logout page. This will cause flicker.
    // Using an iframe is a technique to avoid that, but this is not possible unfortunately
    // since Cognito serves all its responses with X-Frame-Option DENY.
    // In the response to the request below Cognito effectively cancels the browser session
    // by setting the session cookie (cognito) to expire immediately.
    window.location.href = `${process.env.REACT_APP_AS_ENDPOINTS}/logout?client_id=${process.env.REACT_APP_CLIENT_ID}&logout_uri=${window.origin}`
  }

  showMenu = event => {
    this.setState({
      anchorEl: event.currentTarget,
      showMenu: true
    })
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
              <MenuItem onClick={this.openAddRideDialog} disabled={!Boolean(this.context)}>Add ride</MenuItem>
              <MenuItem onClick={this.allRides}>All rides</MenuItem>
              <MenuItem onClick={this.myRides} disabled={!Boolean(this.context)}>My rides</MenuItem>
            </Menu>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              Ride Sharing
            </Typography>
            <Button color='inherit' onClick={Boolean(this.context)?this.logout:this.login}>
              {Boolean(this.context)?'Logout':'Login'}
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
  userManager: PropTypes.object.isRequired,
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
