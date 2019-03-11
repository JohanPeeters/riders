import React from 'react'
import {Grid} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import PropTypes from 'prop-types'

const styles = {
}

const Rides = props => (
    props.rides && props.rides.map((ride, idx) =>
      <Grid item xs={4} key={idx}>
        {ride}
      </Grid>
    )
)

Rides.propTypes = {
  rides: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Rides)
