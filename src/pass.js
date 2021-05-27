/*global chrome*/

import React, {useState, useEffect, useMemo} from 'react'
import { withRouter, useHistory } from 'react-router-dom'
import bcrypt from 'bcryptjs'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { FormattedMessage } from 'react-intl'
import { usePasswordChange } from './helper/handleInput'
import Alert from '@material-ui/lab/Alert'
import Menu from './component/menu'
import ContentPage from './component/content'
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'

const passworder = require('browser-passworder')

function PassPage () {
  const [oldP,setOldP] = useState("")
  const [p1, setP1] =useState("")
  const [p2, setP2] =useState("")
  const [passErr0, setPassErr0] = useState(false)
  const [passErr1, setPassErr1] = useState(false)
  const [passErr2, setPassErr2] = useState(false)
  const [showModal, setShowModal] = useState(false)


  const [input, showM, handlePasswordChange] = usePasswordChange()
  const handleInputChange = (e) => {
    setPassErr0(false)
    handlePasswordChange(e)
    setOldP(e.target.value)
  }

  const handleInputChange1 = (e) => {
    setPassErr1(false)
    handlePasswordChange(e)
    setP1(e.target.value)
  }

  const handleInputChange2 = (e) => {
    setPassErr2(false)
    handlePasswordChange(e)
    setP2(e.target.value)
  }

  let history = useHistory()

  const changeStore = async () => {
    for( let j=1;j<21;j++){
      await chrome.storage.local.get(["address" + j], function(result) {
        if (result.hasOwnProperty("address" + j) === true) {
          chrome.storage.local.get([result["address" + j].address + "_keyfile"], function(res) {
            console.log("_keyfile: ", res)
            passworder.decrypt(oldP, res[result["address" + j].address + "_keyfile"])
              .then(function(blob) {
                passworder.encrypt(p1, blob)
                  .then(function(blob2) {
                    chrome.storage.local.set({[result["address" + j].address + "_keyfile"]: blob2}, function() {})
                  })
              })
          })
        }
      })
    }
  }              

  const newPass = async () => {
    await chrome.storage.local.get(['userPass'], function(result) {
      if (oldP ==="") {
        // alert("请输入旧密码Input old password")
        setPassErr0(true)
        // return  <Alert severity="error">请输入旧密码Input old password</Alert>
      }
      else{
        bcrypt.compare(oldP, result.userPass, function(err, res) {
          if (res === true){
            if (p1.length < 6 ) {
              setPassErr1(true)
            }
            else{   
              if ( p1 === p2 ){
                var salt = bcrypt.genSaltSync(10)
                var hash = bcrypt.hashSync(p1, salt)
                chrome.storage.local.set({'userPass': hash}, function() {})
                changeStore()
                // basicKey.hash =  this.state.p1
                chrome.runtime.sendMessage({ cmd: 'SET_BASICKEY', basicKey: p1 }, response => {
                  // alert("密码修改成功Succeed")
                  console.log("response: ",response)
                  setShowModal(true)
                })
              }else{
                // alert("两次输入的密码不一致Not identical")
                setPassErr2(true)
              }
            }
          }    
          else{
            // alert("旧密码输入错误The old password is wrong")
            setPassErr0(true)
          }
        })
      }  
    })
  }    

  const succeed = () =>{
    history.push('/transfer')
  }


  const oldPassFields = useMemo(
    () =>
            <TextField
            type="password"
            error = { passErr0 }
            id="input-with-icon-textfield"
            label={<FormattedMessage id='old_pass' />}
            helperText={ passErr0 ? <FormattedMessage id='wrong_old' /> : " "}
            onChange = {(e)=> handleInputChange(e)}
          />,[passErr0]
    )

  const newPassFields1 = useMemo(
    () =>
            <TextField
            type="password"
            error = { passErr1 }
            id="input-with-icon-textfield"
            label={<FormattedMessage id='new_pass' />}
            helperText={ passErr1 ?  <FormattedMessage id='more_than_5' />  : " "}
            onChange = {(e)=> handleInputChange1(e)}
          />,[passErr1]
    )

  const newPassFields2 = useMemo(
    () =>
            <TextField
            type="password"
            error = { passErr2 }
            id="input-with-icon-textfield"
            label={<FormattedMessage id='pass_twice' />}
            helperText={ passErr2 ? <FormattedMessage id='inconsistency' /> : " "}
            onChange = {(e)=> handleInputChange2(e)}
          />,[passErr2]
    )

  const useStyles = makeStyles(theme => ({
    modal: {
      zIndex: 1050,
      position: 'fixed',
      borderRadius: '4px',
      width: 330,
      height: 180,
      transform: 'translate3d(-50%, -50%, 0)',
      top: '50%',
      left: '50%',
      backgroundColor: 'white'
    }, 
    modalButton: {
      marginTop: 30,
      padding: '10px 22px',
      width: 120,
      marginLeft:90,
      marginBottom:20
    },
  }))
  const classes = useStyles()

  return (
    <ContentPage>
      <div style={{ paddingTop: 10 }}>
        <Menu />
      </div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={showModal}
      >
        <div className={classes.modal}>
          <div  style={{paddingTop: 60, paddingLeft: 60}} >
            <Typography variant="body1" gutterBottom>
              <FormattedMessage id='pass_success' />
            </Typography>
          </div>
          <Button className={classes.modalButton} variant="outlined" color="secondary" size="lg" onClick={() => succeed()} ><FormattedMessage id='confirm' /></Button>
        </div>
      </Modal>  
      <div style={{
        paddingTop: 15, 
        paddingLeft: 120, 
      }} >
        <img src={require('./pass4.png')} alt="password" />
      </div>
      <div  style={{ paddingTop: 1,  paddingLeft: 80}}>
        <h2>
          <FormattedMessage id='change_pass' />  
        </h2>
      </div>  
      <div  style={{ paddingTop: 1,  paddingLeft: 30}}>
        <label>
          <FormattedMessage id='change_password_hint' /> 
        </label>
      </div>    
      <div >      
        <form>
        <Grid container >
        <Grid item > 
          <Grid container spacing={2} direction="column">
            <Grid item >
            <div  style={{ paddingTop: 40, paddingLeft: 90}}>
            { oldPassFields }
            </div>
            </Grid>
            <Grid item >
            <div  style={{ paddingTop: 1, paddingLeft: 90}}>
            { newPassFields1 }
            </div>
            </Grid>
            <Grid item >
            <div  style={{ paddingTop: 1, paddingLeft: 90}}>
            { newPassFields2 }
            </div>
            </Grid>
            <Grid item >
            <div style={{ paddingTop: 15, paddingLeft: 120}}>
            <Button variant="outlined" color="secondary" size="lg" onClick={() => newPass()} ><FormattedMessage id='confirm' /></Button>
            </div>  
            </Grid>
          </Grid>
        </Grid>
      </Grid>
        </form>                 
      </div>
    </ContentPage>
  )
}

export default withRouter(PassPage)