/*global chrome*/
import React, {useState, useEffect, useMemo}  from 'react'
import { withRouter, useHistory } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Collapse from '@material-ui/core/Collapse'
import Alert from '@material-ui/lab/Alert'
import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'
import { getAddrFromEth } from './helper/getAddress.js'
import {FormattedMessage} from 'react-intl'
import Menu from './component/menu'
import ContentPage from './component/content'
import { makeStyles } from '@material-ui/core/styles'
import {fetchAddress, fetchKeyfile } from './helper/fetchAddress'


function ImportPage () {
  const [pass, setPass] = useState("")
  const [fileContents, setFileContents] = useState("")
  const [addrList, setAddrList] = useState([])
  const [tempI, setTempI] = useState("")
  const [showM, setShowM] = useState(false)
  const [passErr, setPassErr] = useState("")
  const [selectFile,setSelectFile] = useState(false)
  const [discription,setDiscription] = useState(true)
  const [wrongPassword,setWrongPassword] = useState(false)
  const [alreadyIn,setAlreadyIn] = useState(false)
  const [fullList,setFullList] = useState(false)
  const [wrongKeystore,setWrongKeystore] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)

  const useStyles = makeStyles({
    tips: {
      textColor: '#FFFFFF',
      fontSize: 10,
      paddingTop: 20,
      paddingLeft: 20
    },
  })
  const classes = useStyles()

  let history = useHistory()

  useEffect( () => {
    var tempAddr = []

    const t = async () => {
      for( var j=20; j>0; j--){
        var jj= await fetchAddress(j)
        if (jj === undefined) {
          console.log("jj: ", jj)
          setTempI(j)
        }else{
          tempAddr.push(jj.address)
          console.log("tempAddr: ", jj)
        }   
      }
    }
    t()
    setAddrList(tempAddr)
  },[])

  const handleInputChange = (e) =>{
    const target = e.target
    const value = target.value
    setPass(value)
  }

  const upload = async () =>{
    const Wallet = require('ethereumjs-wallet')
    const passworder = require('browser-passworder')
    if ( addrList.length ===20) {
      console.log("addrList is full")
      setDiscription(false)
      setFullList(true)
      await new Promise(r => setTimeout(r, 5000))   
      setDiscription(true)
      setFullList(false)
      return
    }
    setShowSpinner(true)
    await new Promise(r => setTimeout(r, 200)) 
    try {
      var temp = Wallet.fromV3(fileContents, pass, true)
    }
    catch(err) {
      // alert("密码输入有误，操作失败Password is wrong")
      console.log("password is wrong")
      setShowSpinner(false)
      setDiscription(false)
      setWrongPassword(true)
      await new Promise(r => setTimeout(r, 5000))   
      setDiscription(true)
      setWrongPassword(false)
      return
    }

    for (const i of addrList) {
      if (getAddrFromEth(temp.getAddress().toString('hex')) === i) {
        setShowSpinner(false)
        setDiscription(false)
        setAlreadyIn(true)
        await new Promise(r => setTimeout(r, 5000))   
        setDiscription(true)
        setAlreadyIn(false)
        return
      }
    }

    await chrome.runtime.sendMessage({ cmd: 'GET_BASICKEY' }, response => { 
      passworder.encrypt(response.basicKey, fileContents)
      .then(function(blob) {      
        chrome.storage.local.set({[ getAddrFromEth(temp.getAddress().toString('hex')) + "_keyfile"]: blob}, function() {})
      })
    })

    const newAddress = getAddrFromEth(temp.getAddress().toString('hex'))
    chrome.storage.local.set({["address" + tempI]: {"SN": tempI,"address": newAddress, "name":"address" + tempI, "balance": 0}}, function() {})
    // alert("导入成功Import Succeed")
    console.log("Import Succeed.")
    chrome.storage.local.get(["CurrentAddress"], function(res) {
      if (res["CurrentAddress"].CurrentAddress=== "") {
          chrome.storage.local.set({'CurrentAddress': {CurrentAddress: newAddress, Name: "address" + tempI}}, function() {
            history.push('/transfer')
          })
      }else{
        history.push('/transfer')
      }
    })  

  }

  const onLoad = async (e) =>{
    var reader = new FileReader()
    reader.readAsBinaryString(e.target.files[0])
    reader.onload = async (x) =>{setFileContents( x.target.result)
      if (x.target.result.includes("\"version\":3")) {
        setSelectFile(true)
      } else{
        console.log("alert")
        setDiscription(false)
        setWrongKeystore(true)
        await new Promise(r => setTimeout(r, 5000))        
        setDiscription(true)
        setWrongKeystore(false)

      }
    }    
  }

  const handleClose = () => {
    setShowM(false)
  }

  return (

      <ContentPage>
        <div style={{ paddingTop: 10 }}>
          <Menu />
        </div>  
        <div  style={{ paddingLeft: 85}}>
          <h2>
            <FormattedMessage id='import' />
          </h2>
        </div>  
        <Divider />
        <Collapse in={discription}>
          <Alert severity="info"><FormattedMessage id='why_keystore' /> </Alert>
        </Collapse>
        <Collapse in={wrongPassword}>
          <Alert variant="filled" severity="error"><FormattedMessage id='wrong_key_pass' /> </Alert>
        </Collapse>
        <Collapse in={alreadyIn}>
          <Alert variant="filled" severity="error"><FormattedMessage id='already_imported' /> </Alert>
        </Collapse>
        <Collapse in={fullList}>
          <Alert variant="filled" severity="error"><FormattedMessage id='list_is_full' /> </Alert>
        </Collapse>
        <Collapse in={wrongKeystore} >
          <Alert variant="filled" severity="error"><FormattedMessage id='wrong_format' /> </Alert>
        </Collapse>

        <Grid container spacing={2} direction="column">
          <Grid item > 
            <div className={classes.root} style={{ paddingTop: 50, paddingLeft: 60}}>
              <Button
                variant="contained"
                component="label"
              >
                <FormattedMessage id='choose_file' />
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={onLoad}
                />
              </Button>
              <div>
                <label>{selectFile ?  <FormattedMessage id='keystore_file_selected'/> : <FormattedMessage id='no_file_chosen' /> } </label>
              </div>
            </div>
          </Grid>
          <Grid item >
          <div  style={{ paddingTop: 30, paddingLeft: 85}}>
            <form>
              {/* <label>
                <FormattedMessage id='key_pass' />
              </label> */}
              {/* <input type="password" name="pass" value={pass} onChange={handleInputChange} className="Rui_input form-control form-control-lg" /> */}
              <TextField
              type="password"
              error = { passErr }
              id="input-with-icon-textfield"
              label={<FormattedMessage id='keystore_password' />}
              helperText={ passErr ? <FormattedMessage id='wrong_key_pass' /> : " "}
              onChange = {handleInputChange}
            />
              <p></p>
              <p></p>
            </form>
            </div>
          </Grid>
          <Grid item >
          <div className={classes.root} style={{ paddingTop: 1, paddingLeft: 80}}>
            { !showSpinner 
          ? <Button variant="outlined" color="secondary" onClick={upload}><FormattedMessage id='import' /></Button>
          : <Button variant="outlined" color="secondary" disabled>
              <CircularProgress color="secondary" size={24}/>
              <FormattedMessage id='importing' />
            </Button>
          }  
          </div>
          </Grid>
        </Grid>
      </ContentPage>
    )
}

export default withRouter(ImportPage)




