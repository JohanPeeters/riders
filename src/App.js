import React, {Component} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import {Log, UserManager} from 'oidc-client'
import {connect} from 'react-redux'
import {Route} from 'react-router-dom'
import {Grid} from '@material-ui/core'
import Rides from './components/Rides'
import Header from './components/Header'
import ErrorMessage from './components/ErrorMessage'
import Callback from './components/Callback'
import {notify, resetRides} from './actions'
import AuthenticatedUserContext from './AuthenticatedUserContext'

// Log.level = Log.DEBUG
// Log.logger = console

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
//  userStore: new WebStorageStateStore({store: new RideSharingStore()}),
  // metadata: {
  //   issuer: process.env.REACT_APP_ISSUER,
  //   end_session_endpoint: 'https://ride-sharing.eu.auth0.com/v2/logout',
  //   authorization_endpoint: 'https://ride-sharing.eu.auth0.com/authorize',
  //   jwks_uri: 'https://ride-sharing.eu.auth0.com/.well-known/jwks.json',
  //   token_endpoint: 'https://ride-sharing.eu.auth0.com/oauth/token',
  //   post_logout_redirect_uri: window.origin
  // }
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
            this.setState({
              user: user
            })
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
    // It is tempting to first try whether the user still has a session with the AS with
    // this.userManager.querySessionStatus()
    // However, this does not retrieve the access token, only the id token:
    // scope parameter is hard-coded to `openid`.
    this.userManager.signinRedirect()
  }

  logout = () => {
    // the most logical implementation would be
    // this.userManager.signoutRedirect({post_logout_redirect_uri: window.origin})
    // unfortunately this does not work because the query parameters Cognito and Auth0
    // expect are not sent by oidc-client.
    // Without arguments, oidc-client sends the
    // id_token in a parameter named id_token_hint.
    // By adding parameters, it can be arranged to also send state and
    // post_logout_redirect_uri. The latter could have been useful since Cognito
    // expects a parameter `logout_uri` and Auth0 expects a parameter `returnTo`
    // with the same semantics.
    // Both Cognito and Auth0 also expects the client_id. The logout URI and client ID will be supplied
    // in the redirect below. But first, we remove the user from the store. If we
    // do not do this, the app will continue to use stored tokens. Since these are
    // self-contained tokens, they are not validated with the issuer and will
    // continue to afford access.
    this.userManager.removeUser()
    // redirecting the browser to the logout page will cause flicker.
    // Using an iframe avoids this flicker, but is not possible
    // with Cognito since it serves all its responses with X-Frame-Option DENY.
    // Auth0 does not. Therefore an iframe is an option. A simpler approach is
    // to query the logout page with XHR. However, the AS only cancels its session if cookies are sent with the request.
    // Simply adding `withCredentials: true` to the XHR request does not cut it:
    // the browser does not send the cookies (credentials) as it has not been given assurance from the server that it can do so.
    // A way to circumvent this is to coax the browser into sending a pre-flight request that hopefully returns CORS headers that allow sending credentials.
    // One way to do so is by adding one of the headers that would trigger a pre-flight.
    // Unfortunately, this does not work either since Auth0 does not return a `Access-Control-Allow-Origin` header,
    // so the browser refuses to send the request after it receives the pre-flight response.
    // Back to iframes. No support for that from oidc-client. Not going to implement this for now.
    // TODO
    // axios({
    //   baseURL: process.env.REACT_APP_AS_ENDPOINTS,
    //   url: 'logout',
    //   params: {
    //     client_id: process.env.REACT_APP_CLIENT_ID,
    //   }
    // })
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

  exchangeCodeForToken = () => {
    this.userManager.signinRedirectCallback(window.location)
      .then(user => {
      })
      .catch(error => {
        this.props.notify(`Login failed - ${error}`)
      })
      // I would have liked to use `finally` here, but some mainstream
      // browsers do not support it yet. Neither does Node 8.12.
      this.userManager.clearStaleState()
  }

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
          <Callback {...props} exchangeCodeForToken={this.exchangeCodeForToken}/>
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
