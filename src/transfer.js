import React, {useState, useEffect, useContext, useMemo} from 'react'
import { withRouter, useHistory } from 'react-router-dom'
import {FormattedMessage} from 'react-intl'
import { rnode, apiDeploy, checkBalance, generateCode, decryptSK, storeHistory } from './helper/deploy'
import ContentPage from './component/content'
import Button from '@material-ui/core/Button'
import AddressMenu from './component/addressMenu'
import Grid from '@material-ui/core/Grid'
import Alert from '@material-ui/lab/Alert'
import Collapse from '@material-ui/core/Collapse'
import {usePasswordChange, useInputChange} from './helper/handleInput'
import {addressContext} from './helper/addressContext'
import TextField from '@material-ui/core/TextField'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import InputAdornment from '@material-ui/core/InputAdornment'

function TransferPage () {

  const [amount, setAmount] = useState("")
  const [toAddr, setToAddr] = useState("")
  const [price, setPrice] = useState(0)
  const [deployId, setDeployId] = useState(null)
  const [PKpass, setPKPass] = useState(null)
  const [showM2,setShowM2] =useState(false)
  const [showSucess,setShowSucess] =useState(false)
  const [toAddressErr,setToAddressErr] =useState(false)
  const [amountErr,setAmountErr] =useState(false)
  const [pkPassErr,setPkPassErr] =useState(false)
  const [revAddress, setRevAddress] = useState(null)
  const [revBalance, setRevBalance] = useState(null)
  const [showWrongOperation,setShowWrongOperation] =useState(false)
  const [showSpinner,setShowSpinner] =useState(false)

  const value = useMemo(() => ({ revAddress, setRevAddress, revBalance, setRevBalance }), [revAddress, setRevAddress, revBalance, setRevBalance ]);
  // const [input, showM, handlePasswordChange] = usePasswordChange()
  const [input, handleInputChange] = useInputChange()

  useEffect( () => {
    async function fetchPrice() {
      await fetch("http://207.180.230.84:5000/api/get/revprice", { 
        method:'get' 
      })
      .then((str)  => str.json())
      .then(p =>{
        setPrice(p[0].price)
        console.log("price: ", p[0].price)
      })  
    }
    fetchPrice()
  },[])

  useEffect( () => {
    if (deployId!==null) {
      storeHistory(revAddress, deployId, amount, toAddr)
    }
  },[deployId])

  const handleClose = () => {
    setShowM2(false)
  }

  const  finalDeploy = async () => { 
    console.log("[revAddress, PKpass] : ",[revAddress, PKpass])
    const [s,sk] = await decryptSK(revAddress, PKpass) 
    if (s===false) {
      setPkPassErr(true)
    }else{
      setShowSpinner(true)
      const code = generateCode(revAddress, amount, toAddr) 
      try {
        // sendDeploy(http, code, this.state.sk).then( (response) => {    
        apiDeploy(code, sk).then( async (response) => {
          // console.log("Response: ", response)
          try {
            if (response.substring(0,8) ==="Success!") {
              // this.setState({deployId: response.substring(22,164), showModal4: true, showSpinner: false})
              setDeployId(response.substring(22,164))
              setShowM2(false)
              // storeHistory(revAddress, deployId, amount, toAddr)
              setShowSucess(true)
              await new Promise(r => setTimeout(r, 5000))   
              setShowSucess(false)
            }else{
              // alert("操作失败 The operation failed")
              // this.setState({showModal6: true, showSpinner: false})
              // return  <Alert severity="error">操作失败 The operation failed</Alert>
              setShowWrongOperation(true)
              await new Promise(r => setTimeout(r, 10000))   
              setShowWrongOperation(false)
            }  
          }
          catch(err) {
            // alert("操作失败 The operation failed")
            // this.setState({showModal6: true, showSpinner: false})
            // return  <Alert severity="error">操作失败 The operation failed</Alert>
            setShowWrongOperation(true)
            await new Promise(r => setTimeout(r, 10000))   
            setShowWrongOperation(false)
          }  
        })
      }
      catch(err) {
        // alert("操作失败 The operation failed")
        // this.setState({showModal6: true, showSpinner: false})
        // return  <Alert severity="error">操作失败 The operation failed</Alert>
        setShowWrongOperation(true)
        await new Promise(r => setTimeout(r, 5000))   
        setShowWrongOperation(false)
      }
    }  
  }

  const  handleToAddress =  (e) => {
    setToAddressErr(false) 
    handleInputChange(e)
    setToAddr(e.target.value)
  }  

  const  handleAmount =  (e) => {  
    setAmountErr(false)
    handleInputChange(e)
    setAmount(e.target.value)
  }   

  const  handlePKpass =  (e) => {  
    setPkPassErr(false)
    handleInputChange(e)
    setPKPass(e.target.value)
  }  

  const  checkToAddress =  () => { 
    if (toAddr.length !== 53 && toAddr.length !== 54){
      setToAddressErr(true)
      return false
    }
    return true
  }  

  const  checkAmount =  () => { 
    var amt 
    if (revBalance - amount * 100000000 < 300000) {
      setAmountErr(true)
      return false
      // amt = (revBalance  - 300000).toFixed(0)   
      // setAmount(((revBalance  - 300000) / 100000000).toFixed(8))
    }else{
      amt = (amount * 100000000).toFixed(0)
      setAmount((amt / 100000000).toFixed(8))  
    }
    if (amt <=0 ) {
      setAmountErr(true)
      return false
    }
    return true
  }

  const beforeTransfer =() => {
    const c = checkToAddress()
    if (c === true) {
      const d = checkAmount()
      if (d === true) {
        setShowM2(true)
      }
    }    
  }

  const useStyles = makeStyles({
    root: {
      backgroundColor: '#f9f4f0',
    },
    rev: {
      fontSize: '32px',
      textColor: '#000000',
      width: 350,
      height:100,
      position:"absolute",
      paddingTop: 70,  
      textAlign: "center",
    },
    fiat: {
      fontSize: '14px',
      textColor: '#F8EDEB', 
      width: 350,
      position:"absolute",
      paddingTop: 100,  
      textAlign: "center",
    },
    box: {
      width: 260,
      height: 160,
      backgroundColor: '#eceff1',
      boxShadow: '0 4px 6px #3434AA, 0 1px 3px #9381FF'
    },
    modal: {
      backgroundColor: '#eceff1',
      top: 120,
      left: 10,
      position: 'absolute',
      width: 340,
    },
  })
  
  const classes = useStyles()

  const addrMenu =  useMemo(()=>{
    return (
      <addressContext.Provider value={value}>
        <AddressMenu/>
      </addressContext.Provider>
    )
  },[value])

  return (
      <ContentPage>
        { addrMenu }
        <Collapse in={showWrongOperation}>
          <Alert variant="filled" severity="error"><FormattedMessage id='wrong_opt' />  </Alert>
        </Collapse>
        <Collapse in={showSucess}>
          <Alert variant="filled" severity="info"><FormattedMessage id='transfer_success' /> {deployId} </Alert>
        </Collapse>
        <Grid container direction="column">
          <Grid item >     
          <div style={{ width: 350,height: 200}}>       
            <div style={{position: 'relative', width: 350}} >
              <div style={{
                position: 'absolute', 
                color: 'black', 
                top: 8, 
                left: '50%', 
                transform: 'translateX(-50%)',
                paddingTop: 15, 
              }} >
                <img src={require('./rev.png')} alt="rev" />
              </div>
              <div style={{ paddingTop: 45}}>
                  <div className= {classes.rev} >
                    <label >
                      <span> {(revBalance/100000000).toFixed(4)} REV</span>
                    </label>
                  </div>
                  <div  className= {classes.fiat} >
                    <label >
                      <span > {(price * revBalance/100000000).toFixed(2)} USDT</span>
                    </label>
                  </div>
              </div>
            </div>  
            </div>              
          </Grid > 
          <Grid item > 
            <div style={{ width: 350,height: 100}}>
              <form  >
                <div  style={{ paddingTop: 30, paddingLeft: 55, paddingRight: 25}}>
                  <TextField 
                    id="to-address" 
                    label={<FormattedMessage id='to_address' />}
                    type="text" 
                    fullWidth ={true}
                    onChange = {handleToAddress} 
                    error = { toAddressErr }
                    value={toAddr}
                    helperText={ toAddressErr ? <FormattedMessage id='wrong_address' /> : " "}
                  />
                </div>  
                <div  style={{ paddingTop: 20, paddingLeft: 55, paddingRight: 25}}>
                  <TextField 
                    id="Amount" 
                    label={<FormattedMessage id='amount' />}
                    type="number" 
                    fullWidth ={true}
                    onChange = {handleAmount}  
                    error = { amountErr }
                    value={amount}
                    helperText={ amountErr ? <FormattedMessage id='incorrect_amount' /> : " "}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button color="primary" style={{ fontSize: 9}} onClick={() => {setAmount(((revBalance - 310000)/100000000).toFixed(8))}}>Max</Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </form>

              <p></p>
              <div  style={{ paddingTop: 10, paddingLeft: 80}}>
                <Button variant="outlined" color="secondary" style={{ width: 200}} size="lg" onClick={beforeTransfer}><FormattedMessage id='transfer' /></Button>
              </div>
            </div>
          </Grid > 
        </Grid> 
        <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={showM2}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
            timeout: 500,
        }}
      >
        <Fade in={showM2}>
          <div className= {classes.modal}>
            <div style={{ paddingTop: 20, paddingLeft: 70}}>
              <p>
                <FormattedMessage id='keystore_password' />
              </p>
            </div>  
            <div style={{ paddingTop: 10, paddingLeft: 70}}>
              <TextField
                type="password"
                error = { pkPassErr }
                id="password"
                label={<FormattedMessage id='password' />}
                helperText={ pkPassErr ? <FormattedMessage id='incorrect_password' /> : " "}
                onChange = {(e)=> handlePKpass(e)}
              />
            </div>  
            <div style={{ paddingTop: 20, paddingLeft: 110, paddingBottom: 30}}>
              { !showSpinner 
                ? <Button variant="outlined" color="secondary" onClick={finalDeploy} style={{ width: 200}} ><FormattedMessage id='transfer' /></Button>
                : <Button variant="outlined" color="secondary" disabled style={{ width: 200}} >
                    <CircularProgress color="secondary" size={24}/>
                    <FormattedMessage id='transfer' />
                  </Button>
                } 
            </div>
          </div>  
        </Fade>
      </Modal>
      </ContentPage>
  )
}

export default withRouter(TransferPage)

