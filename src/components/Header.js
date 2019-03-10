import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import {} from '../actions'
import AuthenticatedUserContext from '../AuthenticatedUserContext'

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

  isLoggedIn = () => (
    Boolean(this.props.user)
  )

  render() {
    const {classes} = this.props
    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            {this.props.menu}
            <Typography variant="h6" color="inherit" className={classes.grow}>
              Ride Sharing
            </Typography>
            <Button color='inherit' onClick={this.isLoggedIn()?this.props.logout:this.props.login}>
              {this.isLoggedIn()?'Logout':'Login'}
            </Button>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  menu: PropTypes.element.isRequired
}

const mapStateToProps = state => ({
  user: state.user
})

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Header))
