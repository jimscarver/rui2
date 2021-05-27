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

function ConnectPage () {
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




  // window.addEventListener("message", (event)=>{
  //   // Normally you would check event.origin
  //           // To verify the targetOrigin matches
  //           // this window's domain
  //           let txt=document.querySelector('#txtMsg');
  //           // event.data contains the message sent
  //           txt.value=`Name is ${event.data.pName} Age is  ${event.data.pAge}` ;
          
  //       });























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
        color: '#F8EDEB',
      },      
      '& label.Mui-focused': {
        color: '#F8EDEB',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: '#F8EDEB',
        color: '#F8EDEB',
      },
      '& .MuiInputAdornment-root': {
        borderBottomColor: '#F8EDEB',
        color: '#F8EDEB',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'red',
          color: '#F8EDEB',
        },
        '&:hover fieldset': {
          borderColor: 'yellow',
          color: '#F8EDEB',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#F8EDEB',
          color: '#F8EDEB',
        },
      },
    },
  })(TextField);



  const useStyles = makeStyles(theme => ({
    root: {
      color: '#F8EDEB',
      '& label.Mui-focused': {
        color: '#F8EDEB',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: '#F8EDEB',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'red',
        },
        '&:hover fieldset': {
          borderColor: 'yellow',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#F8EDEB',
        },
      },
    },
    box: {
      width: 320,
      height: 200,
      textColor: '#F8EDEB',
      boxShadow: '0 4px 6px #3434AA, 0 1px 3px #9381FF',
    },
    button: {
      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    }
  }))

  const classes = useStyles()



  const formFields = useMemo( () =>
    <div className={classes.root}>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item>
          <LockOpenTwoToneIcon className={classes.root} />
        </Grid>
        <Grid item>
          <TextField 
          error = { passErr }
          className={classes.root} 
          type="password" 
          id="input-with-icon-grid" 
          label="Password" 
          fullWidth ={true}
          onChange = {(e)=> handleInputChange(e)} 
          helperText={ passErr ? "Incorrect Password" : " "}
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
                <div style={{ paddingTop: 20, paddingLeft: 60}}>
                  <Button variant="outlined" className={classes.button} fullWidth size="large" onClick={()=> checkPass()} >
                    Enter
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

export default withRouter(ConnectPage)



