/*global chrome*/
import React, {useState}from 'react'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {FormattedMessage} from 'react-intl'
import Jazzicon from 'react-jazzicon'
import { makeStyles } from '@material-ui/core/styles'
import { decryptSK } from '../helper/deploy'
import TextField from '@material-ui/core/TextField'
import {useInputChange} from '../helper/handleInput'
import CreateTwoToneIcon from '@material-ui/icons/CreateTwoTone'
import DoneTwoToneIcon from '@material-ui/icons/DoneTwoTone'
import CloseTwoToneIcon from '@material-ui/icons/CloseTwoTone'
import Divider from '@material-ui/core/Divider'
import Alert from '@material-ui/lab/Alert'
import Typography from '@material-ui/core/Typography';

export default function RevealPrivateKey(props) {
  const [password, setPassword] = useState("")
  const [showPrivateKeyDiv, setShowPrivateKeyDiv] = useState("none")
  const [privateKey, setPrivateKey] = useState("")
  const [passErr, setPassErr] = useState("")  
  const [input, handleInputChange] = useInputChange()
  const useStyles = makeStyles(theme => ({
    modal: {
      zIndex: 1050,
      position: 'fixed',
      borderRadius: '4px',
      width: '95%',
      transform: 'translate3d(-50%, -50%, 0)',
      top: '50%',
      left: '50%',
      backgroundColor: 'white'
    },      
    modalContent: {
      margin: 0,
      backgroundColor: 'white',
      animationFillMode: 'forwards'
    },    
    modalBackdrop: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 1040,
      backgroundColor: '#373a47',
      animationFillMode: 'forwards',
      animationDuration: '0.3s'
    },
    accountModalContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'relative',
      padding: '5px 0 31px 0',
      border: '1px solid $silver',
      borderRadius: 4,
    },
    accountModalBack: {
      color: '$dusty-gray',
      position: 'absolute',
      top: 13,
      left: 17,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    },
    accountModalbackText: {
      fontSize: 14,
      lineHeight: 18,
      paddingLeft: 3,
    },
    accountModalClose: {
      fontSize: 40,
      backgroundColor: 'transparent',
      color: '$dusty-gray',
      position: 'absolute',
      cursor: 'pointer',
      top: 10,
      right: 12,
  
      // '&::after': {
      //   // content: '\00D7',
      //   content: '×',
      // }
    },
    
    accountModalIdenticon: {
      position: 'relative',
      left: 0,
      right: 0,
      margin: '0 auto',
      top: -32,
      marginBottom: -32,
    },
    accountDetailsModalName: {
      marginTop: 9,
      fontSize: 20,
    },
    accountDetailsModalButton: {
      marginTop: 17,
      padding: '10px 22px',
      width: 286,
      marginLeft:20
    },
    accountDetailsModalQrHeader: {
      marginTop: 9,
      fontSize: 20,
    },
    accountDetailsModalQrWrapper: {
      marginTop: 5,
    },
    accountDetailsModalEllipAddressWrapper: {
      display: 'flex',
      justifyContent: 'center',
      border: '1px solid $alto',
      padding: '5px 10px',
      marginTop: 7,
      width: 286,
    }
    
  }))

  const classes = useStyles()

  const renderReadonly = () => {
    return (
      <div >{props.item.name}</div>
    )
  }

  const  handlePassword =  (e) => {
    setPassErr(false)
    handleInputChange(e)
    setPassword(e.target.value)
  }  

  const reveal = async () =>{
    const [s,sk] = await decryptSK(props.item.address, password) 
    if (s === false) {
      // alert password error
      setPassErr(true)
    } else {
      setShowPrivateKeyDiv("block")
      setPrivateKey(sk)
    }
  }  

  return (
  <div className={classes.modal} >
    <div className={classes.accountModalContainer} >
        <div className={classes.accountModalIdenticon}>
          <Jazzicon diameter={64} seed={parseInt(props.item.address.slice(22,30), 16)} />
        </div>
        <div className={classes.accountModalClose} onClick={() => {props.hideModals(true)}} >
            <CloseTwoToneIcon />
        </div>
        <div className="editable-label__value">{props.item.name}</div>
        <input type="text" value={props.item.address} />
        <p></p>
        <p></p>
        <Divider />
        <div  style={ showPrivateKeyDiv === "block" ? {display:"none"} : {display:"block", width: '95%'}}>
          <Typography variant="subtitle1" gutterBottom style={{ marginLeft:80}} >
            <FormattedMessage id='export_private_key' />
          </Typography>
          <form>
            <TextField
            type="password"
            error = { passErr }
            id="input-with-icon-textfield"
            label={<FormattedMessage id='keystore_password' />}
            helperText={ passErr ? <FormattedMessage id='wrong_pass' /> : " "}
            onChange = {handlePassword}
            style={{ marginLeft:60}} 
          />
            <p></p>
            <p></p>
          </form>
          <Alert severity="error"> <FormattedMessage id='warning_key' />  </Alert>
          <div style={{ display: "flex"}} >
            <Button
              type="secondary"
              variant="outlined"
              className={classes.accountDetailsModalButton}
              onClick={() => {
                props.hideModals(true)
              }}
            >
              <FormattedMessage id='cancel' />
            </Button>

            <Button
              color="primary"
              variant="outlined"
              className={classes.accountDetailsModalButton}
              onClick={() => reveal()}
            >
              <FormattedMessage id='confirm' />
            </Button>
          </div>  
        </div>

        <div  style={{ display: showPrivateKeyDiv, width: '95%'}}>
          <Typography variant="body1" gutterBottom>
            <FormattedMessage id='This_is_your_private_key' />
          </Typography>
          <form>
          <p></p>
          <TextField
            id="outlined-multiline-static"
            label="privateKey"
            multiline
            rows={4}
            fullWidth
            defaultValue={privateKey}
            variant="outlined"
          />
            <p></p>
            <p></p>
          </form>
          <Alert severity="error"> <FormattedMessage id='warning_key' />  </Alert>
          <Button
            color="red"
            variant="outlined"
            className={classes.accountDetailsModalButton}
            onClick={() => props.hideModals(true)}
          >
            <FormattedMessage id='confirm' />
          </Button>
        </div>
      </div>
  </div> 
    )
}    

