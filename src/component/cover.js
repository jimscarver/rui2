import React, { useState }  from 'react'
import { withRouter } from 'react-router-dom'
import Link from '@material-ui/core/Link'
import { ThemeProvider } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import theme from './theme'
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import SafetyTipsPage from './safetytips'
import Background from '../asset/rui003.png'
import {FormattedMessage} from 'react-intl'

function CoverPage (props) {

  const useStyles = makeStyles({
    root: {
      // backgroundColor: '#1f212c',
      backgroundImage: `url(${Background})`,
      width: 357,
      height: 580,
    },
    tips: {
      color: '#888888',
      fontSize: 10,
      paddingTop: 30,
      paddingLeft: 20
    }
  })

  const [open, setOpen] = useState(false)
  const classes = useStyles()

  const preventDefault = (e) => {
    e.preventDefault()
    setOpen(true)
  }  

  const showD = e => {
    e.preventDefault()
    setOpen(!open)
  };

  return (
    // <ThemeProvider theme={theme}>
    //   <CssBaseline />
      // <Box  width={357} height={600}>
        <div className={classes.root}>
          <div style={{ paddingTop: 100 }}>
            <div style={{ paddingLeft: 50, paddingRight: 60 }}>
              <Grid container >
                <Grid item >
                  {/* <img src={require('../asset/ruiblue.png')} alt="zi" /> */}
                </Grid>
              </Grid> 
            </div>
            {props.children}
          </div>
          <div>
            <Typography className = {classes.tips}>
              <Link href="#" onClick={preventDefault} >
                <FormattedMessage id='safety_tips' />
              </Link>
            </Typography>  
          </div>   
          <SafetyTipsPage open = {open} onClose={showD} />  
        </div>

      // </Box>

    // </ThemeProvider>
  )
}

export default withRouter(CoverPage)



