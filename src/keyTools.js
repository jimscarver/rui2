/*global chrome*/

import React, {useState, useEffect, useMemo}  from 'react'
import { withRouter } from 'react-router-dom'
import {FormattedMessage} from 'react-intl'
import { getAddrFromEth } from './helper/getAddress.js'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Alert from '@material-ui/lab/Alert'
import Menu from './component/menu'
import ContentPage from './component/content'
import {fetchAddress, concealAddress } from './helper/fetchAddress'
import {usePasswordChange, useInputChange} from './helper/handleInput'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Collapse from '@material-ui/core/Collapse'
import CircularProgress from '@material-ui/core/CircularProgress'

function KeytoolsPage() {
  const [sk, setSk] =  useState("")
  const [pass1, setPass1] =  useState("")
  const [pass2, setPass2] =  useState("")
  const [blankAddress, setBlankAddress] =  useState("")
  const [addrList, setAddrList] =  useState([])
  const [alreadyIn,setAlreadyIn] = useState(false)
  const [keystore, setKeystore] = useState("")
  const [basicKey, setBasicKey] = useState("")
  const [display1, setDisplay1] = useState('block')
  const [display2, setDisplay2] = useState('none')
  const [passErr1, setPassErr1] = useState("")
  const [passErr2, setPassErr2] = useState("")
  const [skErr, setSkErr] = useState(false)
  const [showM, setShowM] = useState(false)
  const [showPasswordInconsistency,setShowPasswordInconsistency] = useState(false)
  const [showAtLeast6,setShowAtLeast6] = useState(false)
  const [showOnlyAlphabet,setShowOnlyAlpabet] = useState(false)
  const [showListIsFull,setShowListIsFull] = useState(false)
  const [showImportSuccessfully,setShowImportSuccessfully] = useState(false)
  const [showAlreadyImported,setShowAlreadyImported] = useState(false)
  const [showWrongPassword,setShowWrongPassword] = useState(false)
  const [showSpinner,setShowSpinner] = useState(false)
  const [showKeyFormat,setShowKeyFormat] = useState(true)

  const [input, handleInputChange] = useInputChange()

  const useStyles = makeStyles({
    root: {
      backgroundColor: '#f9f4f0',
    },
    modal: {
      backgroundColor: '#eceff1',
      top: 120,
      left: 10,
      position: 'absolute',
      width: 335,
    },
  })

  const classes = useStyles()

  useEffect( () => {
    async function t () {
      for( let j=20;j>0;j--){
        fetchAddress(j).then((res) => {
          if (res === undefined) {
            setBlankAddress(j)
          }else{
            setAddrList(a => [...a, res])
          } 
        })   
      }
    }
    t() 
  },[])

  const handleClose = () => {
    setShowM(false)
  }

  const  handleSk =  (e) => { 
    setSkErr(false)
    handleInputChange(e)
    setSk(e.target.value)
  }  
  const  handlePass1 =  (e) => { 
    setPassErr1(false)
    handleInputChange(e)
    setPass1(e.target.value)
  }  
  const  handlePass2 =  (e) => { 
    setPassErr2(false)
    handleInputChange(e)
    setPass2(e.target.value)
  }  
  const  checkSk =  () => { 

    console.log("sk: ", sk)
    if(sk.length === 64){
      setShowM(true)
    }else{
      setSkErr(true)
    }

  }  

  const toKeystore = async () => {
      try {
        if(pass1.length < 6) {

          setPassErr1(true)
        } else  {
          if ( pass1 === pass2 ){
            setShowSpinner(true)
            setTimeout(()=>{getKeystore()},200)
          }else{
            setPassErr2(true)
          }
        }
      }
      catch(err) {
        // this.setState({showModal1: false})
        return
      } 
  }

  const getKeystore = () => {    
    var Wallet = require('ethereumjs-wallet')
    var key = Buffer.from(sk, 'hex')
    var wallet = Wallet.fromPrivateKey(key)
    const keystore =  wallet.toV3String(pass1).toString()
    // this.setState({keystore: keystore, display1: 'none', display2: 'block', showSpinner: false,showModal1: false}, ()=>{})
    setKeystore(keystore)
    setDisplay1('none')
    setDisplay2('block')
    setShowM(false)
  }
      
  const importKeystore = async () => {
    if (addrList.length === 20) {
      setShowListIsFull(true)
      await new Promise(r => setTimeout(r, 5000))   
      setShowListIsFull(false)
      return
    }      
    var Wallet = require('ethereumjs-wallet')
    var key = Buffer.from(sk, 'hex')
    var wallet = Wallet.fromPrivateKey(key)
    const rAdd = getAddrFromEth(wallet.getAddress().toString('hex'))
    for (const i of addrList) {
      console.log("i: ", i)
      if (rAdd === i.address) {        
        setAlreadyIn(true)
        setShowAlreadyImported(true)
        await new Promise(r => setTimeout(r, 5000))   
        setShowAlreadyImported(false)
        return
      }
    }    
    if(alreadyIn ===false){
      const c_addr = blankAddress
      const passworder = require('browser-passworder')
      chrome.runtime.sendMessage({ cmd: 'GET_BASICKEY' }, response => {setBasicKey(response.basicKey) })
      passworder.encrypt(basicKey, keystore)
      .then(function(blob) {      
        chrome.storage.local.set({[ rAdd + "_keyfile"]: blob}, function() {})
      })
      chrome.storage.local.set({["address" + c_addr]: {"SN":c_addr, "address": rAdd, "name":"address" + c_addr, "balance": 0}}, function() {})
      chrome.storage.local.get(["CurrentAddress"], function(res) {
        if (res["CurrentAddress"].CurrentAddress=== "") {
          chrome.storage.local.set({'CurrentAddress': {CurrentAddress: rAdd, Name: "address" + c_addr}})
        }
      })  

      // alert("导入成功Import Succeed")
      setShowImportSuccessfully(true)
      // await new Promise(r => setTimeout(r, 5000))   
      // setShowImportSuccessfully(false)
    }

  }  

  return (
      <ContentPage>
      <div style={{ paddingTop: 10 }}>
        <Menu />
      </div>  
      <div  style={{ paddingTop: 1,  paddingLeft: 120}}>
        <h4>
          <FormattedMessage id='key_tools' />
        </h4>  
      </div>  

          <div >
            <Collapse in={showAlreadyImported}>
              <Alert variant="filled" severity="error"><FormattedMessage id='already_imported' />  </Alert>
            </Collapse>
            <Collapse in={showListIsFull}>
              <Alert variant="filled" severity="error"><FormattedMessage id='list_is_full' />  </Alert>
            </Collapse>
            <Collapse in={showWrongPassword} >
              <Alert variant="filled" severity="error"><FormattedMessage id='wrong_key_pass' />  </Alert>
            </Collapse>
            <Collapse in={showImportSuccessfully} >
              <Alert variant="filled" severity="info"><FormattedMessage id='import_success' />  </Alert>
            </Collapse>
          </div>
          <div style={{ display: display1}} >
            <Alert severity="info"><FormattedMessage id='paste_key' /> <FormattedMessage id='key_format' /> </Alert>
            <div  style={{ paddingTop: 60, paddingLeft: 85}}>
              <TextField
                type="text"
                error = { skErr }
                id="sk"
                label={<FormattedMessage id='paste_key' />}
                value={sk}
                helperText={ skErr ? <FormattedMessage id='incorrect_key' /> : " "}
                onChange = { handleSk }
              />
            </div>
            <div  style={{ paddingTop: 30, paddingLeft: 115}}>   
              {/* { skFields } */}
              {/* <input type="text" name="sk" value={sk} onChange={handleInputChange} className="Rui_input form-control form-control-lg" /> */}
              <p></p>
              <Button variant="outlined" color="secondary" size="lg" onClick={checkSk} ><FormattedMessage id='confirm' /> </Button>
            </div>
          </div>
          <div style={{ display: display2, paddingTop: '40px' }}>
            <div  style={{ paddingTop: 30, paddingLeft: 25}}>   
              <label><FormattedMessage id='save_text' /></label>
            </div>
            <div  style={{ paddingTop: 30, paddingLeft: 25, paddingRight: 25}}>   
              <TextField
                id="outlined-multiline-static"
                label="Keystore"
                multiline
                rows={10}
                fullWidth
                defaultValue={keystore}
                variant="outlined"
              />
              {/* <textarea style={{resize:'none', color: '#5e6064', fontSize:'12px'}} name="body" rows='12' cols='48' value={keystore}/> */}
            </div>
            <div  style={{ paddingTop: 30, paddingLeft: 95}}>   
              <Button variant="outlined" color="secondary" size="lg" disabled={showImportSuccessfully} onClick={importKeystore} ><FormattedMessage id='import' /> </Button>
            </div>
          </div>

      <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={showM}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
            <div  className= {classes.modal}>
              <div style={{ paddingTop: 20, paddingLeft: 70}}>  
                <TextField
                  type="password"
                  error = { passErr1 }
                  id="password1"
                  label={<FormattedMessage id='password' />}
                  helperText={ passErr1 ? <FormattedMessage id='more_than_5' /> : " "}
                  onChange = {handlePass1}
                />
              </div>  

              <div style={{ paddingTop: 20, paddingLeft: 70}}>  
                <TextField
                  type="password"
                  error = { passErr2 }
                  id="password2"
                  label={<FormattedMessage id='pass_twice' />}
                  helperText={ passErr2 ? <FormattedMessage id='inconsistency' /> : " "}
                  onChange = {handlePass2}
                />
              </div>                 
              <div style={{ paddingTop: 20, paddingLeft: 60, paddingBottom: 30}}>              
                { !showSpinner 
                  ? <Button variant="outlined" color="secondary" onClick={toKeystore} style={{ width: 200}}><FormattedMessage id='confirm' /></Button>
                  : <Button variant="outlined" color="secondary" disabled style={{ width: 200}}>
                      <CircularProgress color="secondary" size={24}/>
                      <FormattedMessage id='encrypting' />
                    </Button>
                }              
              </div >
            </div>
        </Modal>
        </ContentPage>

  )
}

export default withRouter(KeytoolsPage)

