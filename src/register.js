/*global chrome*/

import React, { useState, useEffect, useMemo } from 'react'
import bcrypt from 'bcryptjs'
import { withRouter, useHistory } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import AccountCircle from '@material-ui/icons/AccountCircle'
import theme from './component/theme'
import Typography from '@material-ui/core/Typography'
// import Image from './asset/b.png'
import { makeStyles } from '@material-ui/core/styles'
import CoverPage from './component/cover'

const useStyles = makeStyles({
  // root: {
  //   backgroundColor: '#18202c',
  //   backgroundImage: `url(${Image})`,
  //   width: 357,
  //   height: 600,
  // },
  // box: {
  //   width: 320,
  //   height: 260,
  //   textColor: '#F8EDEB',
  //   boxShadow: '0 4px 6px #3434AA, 0 1px 3px #9381FF',
  // },
  title: {
    textColor: '#F8EDEB',
    fontSize: 15,
    paddingTop: 15,
    paddingLeft: 120
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
},
paper: {
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
},
  tips: {
    textColor: '#FFFFFF',
    fontSize: 10,
    paddingTop: 20,
    paddingLeft: 20
  }
})


function RegPage () {

  const [pass1, setPass1] = useState("")
  const [pass2, setPass2] = useState("")
  const [passErr1, setErr1] = useState(false)
  const [passErr2, setErr2] = useState(false)
  let history = useHistory()
  const classes = useStyles()

  const handleInputChange1 = (e) => {
    var pass = e.target.value
    var reg = /^[A-Za-z0-9]+$/
    var test = reg.test(pass)
    if (test || pass.length !== 0) {
      setPass1(pass)
    }else{
      // alert('only alphanumeric')
      setErr1(true)
    }    
  }

  const handleInputChange2 = (e) => {
    var pass = e.target.value
    var reg = /^[A-Za-z0-9]+$/
    var test = reg.test(pass)
    if (test || pass.length !== 0) {
      setPass2(pass)
    }else{
      // alert('only alphanumeric')
      setErr2(true)
    }    
  }

  const reg = () => {
    if(pass1.length < 6) {
      // alert('must >6')
      setErr1(true)
      return
    } else  {
      if ( pass1 === pass2 ){
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(pass1, salt);
        chrome.storage.local.set({'userPass': hash})
        chrome.storage.local.set({'History': []})
        chrome.storage.local.set({'CurrentAddress': ""})
        history.push('/import')      
      }else{
        // alert("再次输入的密码不一致")   
        setErr2(true)
        return
      }
    }
  }

const formFields = useMemo(
  () =>
  <div style={{ paddingTop: 5, paddingLeft: 20}}>
  <Grid item >
  <div style={{ paddingTop: 25, paddingLeft: 30}}>
    <TextField
    type="password"
    error = { passErr1 }
    id="input-with-icon-textfield"
    label={<FormattedMessage id='password' />} 
    helperText={ passErr1 ?  <FormattedMessage id='more_than_5' /> : " "}
    onChange = {(e)=> handleInputChange1(e)}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <AccountCircle />
        </InputAdornment>
      ),
    }}
  />
  </div>
  </Grid>
    <Grid item >
    <div style={{ paddingTop: 15, paddingLeft: 30}}>
      <TextField
      type="password"
      error = { passErr2 }
      id="input-with-icon-textfield"
      label={<FormattedMessage id='pass_twice' />} 
      helperText={ passErr2 ? <FormattedMessage id='inconsistency' /> : " "}
      onChange = {(e)=> handleInputChange2(e)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <AccountCircle />
          </InputAdornment>
        ),
      }}
    />
    </div>
    </Grid>
    </div>,[passErr1, passErr2]
  )

    return (
      <CoverPage>
        <div style={{ paddingTop: 160, paddingLeft: 20, paddingRight: 10}}>
          {/* <Grid container > */}
            {/* <Grid item >  */}
              {/* <Box
                boxShadow={3}
                m={1}
                p={1}
                className = {classes.box}
              > */}
                <Typography className = {classes.title}><FormattedMessage id='create_wallet' /></Typography>
                <Grid container spacing={2} direction="column">
                  <Grid item >                    
                    {formFields}
                  </Grid>
                  <Grid item >
                  <div style={{ paddingTop: 5, paddingLeft: 80}}>
                    <Button variant="contained" color="secondary" onClick={()=> reg()} style={{ width: 180}}>
                      <FormattedMessage id='create' />
                    </Button>
                  </div>  
                  </Grid>
                </Grid>
              {/* </Box> */}
            {/* </Grid> */}
          {/* </Grid> */}
        </div>  
      </CoverPage>
    )
}

export default withRouter(RegPage)



