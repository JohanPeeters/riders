import React, {Component} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import {UserManager} from 'oidc-client'
import {connect} from 'react-redux'
import {Route} from 'react-router-dom'
import {Grid} from '@material-ui/core'
import Rides from './components/Rides'
import Header from './components/Header'
import ErrorMessage from './components/ErrorMessage'
import Callback from './components/Callback'
import {notify, resetRides} from './actions'
import AuthenticatedUserContext from './AuthenticatedUserContext'

const config = {
  authority: process.env.REACT_APP_ISSUER,
  client_id: process.env.REACT_APP_CLIENT_ID,
  redirect_uri: `${window.origin}/callback`,
  response_type: 'code',
  // ideally, we would like to get access tokens with only the scopes needed for a specific request.
  // Our client library scuppers that plan.
  // The oidc-client's UserManager takes a one-shot scope configuration.
  scope: 'openid rides/create rides/delete rides/update',
  loadUserInfo: false,
  // triggers usermanager to send a request to the token endpoint for new tokens.
  // The request sends form data with:
  // refresh_token: ...
  // grant_type: refresh_token
  // client_id: ...
  // Cognito responds with a new access and ID token. No new refresh token is issued,
  // in spite of advice in the BCP.
  automaticSilentRenew: true,
//  userStore: new WebStorageStateStore({store: new RideSharingStore()})
}

const listRidesConfig = {
  baseURL: `https://${process.env.REACT_APP_API_HOST}/${process.env.REACT_APP_API_STAGE}`,
  url: 'rides',
  method: 'get',
  headers: {
    'x-api-key': process.env.REACT_APP_API_KEY
  }
}

export class App extends Component {

  constructor(props) {
      super(props)
      this.userManager =  new UserManager(config)
      this.userManager.getUser()
        .then(user => {
          // if no user is found, oidc-client returns null
          // Rejecting the promise would have been more elegant
          if (user && !user.expired) {
            // missing check: has token expired?
            this.setState({
              user: user
            })
          } else {
            // here we want to check whether there is a session with the OP.
            // UserManager has a method for this: querySessionStatus.
            // This method sends an authorization request with prompt=none.
            // AWS does not have a problem with prompt=none, but does not support response_type=id_token.
            // It also seems to set the X-Frame-Options header to DENY, although
            // I have not tested sending the Cognito cookie with the request.
            // If X-Frame-Options is always DENY, the usual silent authentication tricks do not work.
          }
        })
        .catch(err => {
          console.log(`no user: ${JSON.stringify(err)}`)
        })
      // Events raised by the user manager:
      // userLoaded: Raised when a user session has been established (or re-established).
      // userUnloaded: Raised when a user session has been terminated.
      // accessTokenExpiring: Raised prior to the access token expiring.
      // accessTokenExpired: Raised after the access token has expired.
      // silentRenewError: Raised when the automatic silent renew has failed.
      // userSignedOut [1.1.0]: Raised when the user's sign-in status at the OP has changed.
      //
      // Register for events.
      this.userManager.events.addSilentRenewError((event) => {
        this.props.notify(`cannot silently renew login - ${JSON.stringify(event)}`)
      })
      this.userManager.events.addUserLoaded((event) => {
        this.setState({
          user: event
        })
      })
      this.userManager.events.addUserUnloaded((event) => {
        this.setState({
          user: undefined
        })
      })
      this.state = {
        rides: []
      }
  }

  listRides = () =>
    axios(listRidesConfig)
      .then(
        (res) => {
          this.props.resetRides(res.data)
      })
      .catch(
        (err) => {
          this.props.notify(`cannot retrieve rides - ${err}`)
      })

  componentDidMount() {
    this.listRides()
  }

  render() {
    return (
      <div>
        <Route path='/' render={() =>
          <AuthenticatedUserContext.Provider value={this.state.user}>
            <Header
              userManager={this.userManager}
              addRide={this.openAddRideDialog}
            />
            <Grid container justify='center'>
              <Rides rides={this.props.rides.filter(this.props.filter)}/>
            </Grid>
          </AuthenticatedUserContext.Provider>
        }/>
        <Route path='/callback' render={props => (
          <Callback {...props} userManager={this.userManager}/>
        )}/>
        <ErrorMessage/>
      </div>
    )}
}

App.propTypes = {
  notify: PropTypes.func.isRequired,
  resetRides: PropTypes.func.isRequired,
  rides: PropTypes.array.isRequired,
  filter: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  rides: state.rides,
  filter: state.filter
})

const mapDispatchToProps = {
  notify,
  resetRides
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
