/*global chrome*/

import React, {useState, useEffect, useMemo} from 'react'
import bcrypt from 'bcryptjs'
import { withRouter, useHistory } from 'react-router-dom'
import Auth from './helper/auth'
import {FormattedMessage} from 'react-intl'
import theme from './component/theme';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import AccountCircle from '@material-ui/icons/AccountCircle'
import CoverPage from './component/cover'
import LockOpenTwoToneIcon from '@material-ui/icons/LockOpenTwoTone';
// import Image from './asset/b.png'

function LoginPage () {
  const [pass, setPass] = useState("")
  const [isReged,setReg] = useState(false)
  const [passErr, setPassErr] = useState(false)

  let history = useHistory()

  useEffect( () => {
    async function tempF(){
      await chrome.storage.local.get(['userPass'], function(result) {
        if(result.userPass.length >0){
          setReg(true)
        } 
      })
    }  
    tempF()
    renderRedirect()
  })  

  useEffect( () => {
    async function upgradeStorage(){
      for( let j=1;j<6;j++){
        const temp = "address" +j
        chrome.storage.local.get([temp], function(result) {
          console.log("vvvvvvvvvvvvvvvvvvvvvvvv : ", result.temp)
          if (result.hasOwnProperty(temp) === true) {
            const address = result[temp]
            console.log(".............. address : ", address)

            if (address.includes("1111")) {
              chrome.storage.local.set({[temp] : {"SN": j, "address": address, "name":temp, "balance":0}})
            }
          }   
        })
      }
      await chrome.storage.local.get(["CurrentAddress"], function(result) {
        if (result.hasOwnProperty("CurrentAddress") === false) {
          chrome.storage.local.set({"CurrentAddress" : {"CurrentAddress": "", "name":""}})
        }
      })
      await chrome.storage.local.get(["History"], function(result) {
        if (result["History"][0].fromAddr === undefined) {
          chrome.storage.local.set({"History" : []})
        }
      })
    }  
    upgradeStorage()
  })  

  const handleInputChange = (e) => {
    const target = e.target
    const value = target.value
    setPassErr(false)
    setPass(value)
  }

  const checkPass = async () => {

    await chrome.storage.local.get(['userPass'], function(result) {
      bcrypt.compare(pass, result.userPass, function(err, res) {
        if (res === true){
          Auth.login()   
          chrome.runtime.sendMessage({ cmd: 'SET_BASICKEY', basicKey: pass })
          history.push('/transfer')   
        }  else{
          // alert("密码错")
          setPassErr(true)
        }
      }) 
    })
  }


  const renderRedirect = () => {
    let jump
    chrome.runtime.sendMessage({ cmd: 'GET_TIME' }, response => {
      if (response.time) {
        const time = new Date(response.time)
        // console.log("time.getTime() - Date.now(): ", time.getTime() - Date.now())
        if ((time.getTime() - Date.now())> 0) {
          jump = 1
        }else{
          jump = 0   
        }
      }
      if (response.time === undefined) {
        jump = 0  
      }
      if (jump ===1) {
        Auth.login()
        history.push('/transfer')
      }
    })
  }

  const CssTextField = withStyles({
    root: {
      color: '#1f212c',
      
      '& .MuiInput-root': {
        color: '#D6AAA2',
      },      
      '& label.Mui-focused': {
        color: '#D6AAA2',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: '#D6AAA2',
        color: '#D6AAA2',
      },
      '& .MuiInputAdornment-root': {
        borderBottomColor: '#D6AAA2',
        color: '#D6AAA2',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'red',
          color: '#D6AAA2',
        },
        '&:hover fieldset': {
          borderColor: 'yellow',
          color: '#D6AAA2',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#D6AAA2',
          color: '#D6AAA2',
        },
      },
    },
  })(TextField);



  const useStyles = makeStyles(theme => ({
    root: {
      color: '#D6AAA2',
      '& label.Mui-focused': {
        color: '#D6AAA2',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: '#D6AAA2',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'red',
        },
        '&:hover fieldset': {
          borderColor: 'yellow',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#D6AAA2',
        },
      },
    },
    box: {
      width: 320,
      height: 200,
      textColor: '#D6AAA2',
      boxShadow: '0 4px 6px #3434AA, 0 1px 3px #9381FF',
    },
    button: {
      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    }
  }))

  const classes = useStyles()

  const formFields = useMemo( () =>
    <div className={classes.root}>
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <LockOpenTwoToneIcon className={classes.root} />
        </Grid>
        <Grid item>
          <TextField 
          error = { passErr }
          className={classes.root} 
          type="password" 
          id="input-with-icon-grid" 
          label={<FormattedMessage id='password' />} 
          fullWidth ={true}
          onChange = {(e)=> handleInputChange(e)} 
          helperText={ passErr ? <FormattedMessage id='incorrect_password' /> : " "}
          InputProps={{
            className: classes.root,
            style: {
              color: "blue",
            },
          }}
          />
        </Grid>
      </Grid>
    </div>,[classes.root])

  return (
    <CoverPage>
      <div style={{ paddingTop: 200, paddingLeft: 20, paddingRight: 10}}>
        <Grid container >
          <Grid item > 
            {/* <Box
              boxShadow={3}
              m={1}
              p={1}
              className = {classes.box}
            > */}
              <Grid container spacing={2} direction="column">
                <Grid item >
                <div className={classes.root} style={{ paddingTop: 50, paddingLeft: 50}}>
                {formFields}
                </div>
                </Grid>
                <Grid item >
                <div style={{ paddingBottom: 50, paddingLeft: 60}}>
                  <Button variant="outlined" className={classes.button} fullWidth size="large" onClick={()=> checkPass()} >
                    <FormattedMessage id='enter' />
                  </Button>
                </div>  
                </Grid>
              </Grid>
            {/* </Box> */}
          </Grid>
        </Grid>
      </div>  
    </CoverPage>
  )
}

export default withRouter(LoginPage)



