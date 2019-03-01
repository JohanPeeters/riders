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

  login = () => {
    this.userManager.signinRedirect()
  }

  logout = () => {
    // the most logical implementation would be
    // this.props.userManager.signoutRedirect()
    // unfortunately this does not work because the query parameters Cognito
    // expects are not sent by oidc-client.
    // Without arguments, as it is being called here, oidc-client sends the
    // id_token in a parameter named id_token_hint.
    // By judiciously adding parameters, it can be arranged to also send state and
    // post_logout_redirect_uri. The latter could have been useful since Cognito
    // expects a parameter `logout_uri` with the same semantics.
    // It also expects the client_id. The logout URI and client ID will be supplied
    // in the redirect below. But first, we remove the user from the store. If we
    // do not do this, the app will continue to use stored tokens. Since these are
    // self-contained tokens, they are not validated with the issuer and will
    // continue to afford access.
    this.userManager.removeUser()
    // redirect the browser to the Cognito logout page. This will cause flicker.
    // Using an iframe is a technique to avoid that, but this is not possible unfortunately
    // since Cognito serves all its responses with X-Frame-Option DENY.
    // In the response to the request below Cognito effectively cancels the browser session
    // by setting the session cookie (cognito) to expire immediately.
    window.location.href = `${process.env.REACT_APP_AS_ENDPOINTS}/logout?client_id=${process.env.REACT_APP_CLIENT_ID}&logout_uri=${window.origin}`
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
              login={this.login}
              logout={this.logout}
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
