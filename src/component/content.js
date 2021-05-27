/*global chrome*/

import React from 'react'
import { withRouter } from 'react-router-dom'

import { ThemeProvider } from '@material-ui/core/styles';

import theme from './theme';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline'

function ContentPage (props) {

  const useStyles = makeStyles({
    root: {
      width: 357,
      height: 600,
    },
  })

  const classes = useStyles()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <div className={classes.root}>
            {props.children}
        </div>
    </ThemeProvider>
  )

}

export default withRouter(ContentPage)



