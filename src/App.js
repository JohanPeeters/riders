import React, {useState, useEffect, useCallback} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import {WebStorageStateStore, Log, UserManager} from 'oidc-client'
import {connect} from 'react-redux'
import {Route} from 'react-router-dom'
import {Grid} from '@material-ui/core'
import Rides from './components/Rides'
import Ride from './components/Ride'
import Header from './components/Header'
import ErrorMessage from './components/ErrorMessage'
import Callback from './components/Callback'
import {notify, resetRides, login, logout, refreshing} from './actions'
import RideSharingStore from './helpers/RideSharingStore'
import RideSharingMenu from './components/RideSharingMenu'
import makeVault from './helpers/vault'

export const App = props => {
  const [accessTokenKey, setAccessTokenKey] = useState(undefined)
  const [profileKey, setProfileKey] = useState(undefined)
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
    // automaticSilentRenew: true,
    // The above option should trigger the usermanager to send a request to
    // the token endpoint for new tokens when the old ones are about to expire.
    // The request sends form data with:
    // refresh_token: ...
    // grant_type: refresh_token
    // client_id: ...
    // Cognito responds with a new access and ID token. No new refresh token is issued,
    // in spite of advice in the BCP.
    // It is also flaky, so we are making an explicit call on token expiry.
    //
    // Store tokens in memory to mitigate XSS attacks
    userStore: new WebStorageStateStore({store: new RideSharingStore()}),
  }
  const [userManager] = useState(new UserManager(config))

  const {login, logout, notify, filter, resetRides, refreshing} = props

  const propagateUser = useCallback(
    user => {
      const vault = makeVault()
      // `user` contains all the tokens returned from the AS.
      // It also contains a `profile` field which is the parsed ID token.
      // We only need the access token and profile.
      setAccessTokenKey(vault.seal(user.access_token))
      setProfileKey(vault.seal(user.profile))
      login(vault)
    },
    [login]
  )

  useEffect(
    () => {
      if (!props.user) {
        userManager.getUser()
          .then(user => {
            // If no user is found, oidc-client returns null
            // Rejecting the promise would have been more elegant
            if (user && !user.expired) propagateUser(user)
          })
          .catch(err => {
            console.log(`no user: ${JSON.stringify(err)}`)
          })
      }
    }
  )

  useEffect(
    () => {
        const refreshTokens = () => {
          // send refresh token to obtain new access and id tokens. Cognito does *not*
          // issue a new refresh token.
          userManager.signinSilent()
          .then(user => {
            // No need to do anything since userLoaded will be fired
          })
          .catch(err => {
            // remove the user
            userManager.removeUser()
            logout()
          })
        }
        // Events raised by the user manager:
        // userLoaded: Raised when a user session has been established (or re-established).
        // userUnloaded: Raised when a user session has been terminated.
        // accessTokenExpiring: Raised prior to the access token expiring.
        // accessTokenExpired: Raised after the access token has expired.
        // silentRenewError: Raised when the automatic silent renew has failed.
        // userSignedOut [1.1.0]: Raised when the user's sign-in status at the OP has changed.
        //
        // Register for events.
        userManager.events.addAccessTokenExpiring(event => {
          Log.debug('access token is expiring - doing a silent signin')
          refreshTokens()
        })
        userManager.events.addAccessTokenExpired(event => {
          Log.debug('access token expired - trying to refresh by doing a silent signin')
          refreshTokens()
        })
        userManager.events.addUserLoaded(event => {
          propagateUser(event)
        })
        userManager.events.addUserUnloaded(event => {
          logout()
        })
    },
    [userManager, logout, propagateUser]
  )

  const signin = () => {
    // I would like to first try whether the user still has a session with the AS with
    // userManager.querySessionStatus()
    // However, this is pointless as it does not retrieve the access token, only the id token:
    // scope parameter is hard-coded to `openid`.
    // This could be changed.
    userManager.signinRedirect()
  }
  const signout = () => {
    // the most logical implementation would be
    // userManager.signoutRedirect({post_logout_redirect_uri: window.origin})
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
    userManager.removeUser()
    // redirecting the browser to the logout page will cause flicker.
    // Using an iframe avoids this flicker, but is not possible
    // with Cognito since it serves all its responses with X-Frame-Option DENY.
    // Auth0 does not. Therefore an iframe is an option with Auth0. A simpler approach is
    // to query the logout page with XHR. However, the AS only cancels its session if cookies are sent with the request.
    // Simply adding `withCredentials: true` to the XHR request does not cut it:
    // the browser does not send the cookies (credentials) as it has not been given assurance by the server that it can do so.
    // Back to iframes. No support for that from oidc-client. Not going to implement this for now.

    window.location.href = `${process.env.REACT_APP_AS_ENDPOINTS}/logout?client_id=${process.env.REACT_APP_CLIENT_ID}&logout_uri=${window.origin}`
  }

  useEffect(
    () => {
      if (!props.fresh && window.location.pathname !== '/callback') {
        refreshing()
        const listRidesConfig = {
          baseURL: `https://${process.env.REACT_APP_API_HOST}/${process.env.REACT_APP_API_STAGE}`,
          url: 'rides',
          method: 'get',
          headers: {
            'x-api-key': process.env.REACT_APP_API_KEY
          }
        }
        const listRides = () =>
          axios(listRidesConfig)
            .then(
              (res) => {
                resetRides(res.data)
            })
            .catch(
              (err) => {
                props.notify(`cannot retrieve rides - ${err}`)
            })
        listRides()
      }
    }
  )

  const exchangeCodeForToken = useCallback(
    () => {
      userManager.signinRedirectCallback()
        .then(user => {
        })
        .catch(error => {
          notify(`Login failed - ${error}`)
        })
    },
    [notify, userManager]
  )

  const menu = (
      <RideSharingMenu
        accessTokenKey={accessTokenKey}
        profileKey={profileKey}
      />)

  const rides = props.rides?
                  props.rides.filter(filter)
                    .map(ride =>
                          <Ride
                            ride={ride}
                            disabled={false}
                            accessTokenKey={accessTokenKey}
                            profileKey={profileKey}
                          />)
                  :undefined
  return (
    <div>
      <Header
        login={signin}
        logout={signout}
        menu={menu}
      />
      <Route path='/' render={() =>
          <Grid container justify='center'>
            <Rides rides={rides}/>
          </Grid>
      }/>
      <Route path='/callback' render={props => (
        <Callback exchangeCodeForToken={exchangeCodeForToken}/>
      )}/>
      <ErrorMessage/>
    </div>
  )
}

App.propTypes = {
  notify: PropTypes.func.isRequired,
  resetRides: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  rides: PropTypes.array.isRequired,
  filter: PropTypes.func.isRequired,
  fresh: PropTypes.bool.isRequired
}

const mapStateToProps = state => ({
  fresh: state.fresh,
  rides: state.rides,
  filter: state.filter,
  user: state.user
})

const mapDispatchToProps = {
  notify,
  resetRides,
  login,
  logout,
  refreshing
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
