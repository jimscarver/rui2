/*global chrome*/
import React, {useState, useEffect, useContext, useMemo}from 'react'
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import B1 from '../asset/icon/b1'
import {FormattedMessage} from 'react-intl'
import FileCopyIcon from '@material-ui/icons/FileCopy';
import {fetchAddress, concealAddress, fetchKeyfile } from '../helper/fetchAddress'
import {addressContext} from '../helper/addressContext'
import { checkBalance } from '../helper/deploy'
import Jazzicon from 'react-jazzicon'
import Typography from '@material-ui/core/Typography'
import MyMenu from './menu'

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
    width: '100%',

  },
})((props) => (
  <Menu
    // elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    PaperProps={{
      style: {
        marginTop: "20px",
      }
    }}
    {...props}
  />
))

const StyledMenuItem = withStyles((theme) => ({
  root: {
    // '&:focus': {
    //   // backgroundColor: theme.palette.primary.main,
    //   backgroundColor: "white",
    //   '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
    //     // color: theme.palette.common.white,
    //     color: "#d3d4d5"
    //   },
    // },
  },
}))(MenuItem)

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function AddressMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [addressList, setAddressList] = useState([])  
  const [revAddress2, setRevAddress2] = useState([])
  const [currentAddress, setCurrentAddress] = useState({CurrentAddress:"", Name:""})  //{currentAddress:"address4", name:"my address"}
  const { revAddress, setRevAddress, revBalance, setRevBalance } = useContext(addressContext)
  const [loading, setLoading] = useState(true)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const selectAddr = async (e) =>{
    console.log("e : ", e)
    setRevAddress(e.address)
    setRevAddress2(concealAddress(e.address))
    checkBalance(e.address).then( v => {
      setRevBalance(v)
      chrome.storage.local.set({[`address${e.SN}`] : {"SN": e.SN, "address": e.address, "name":e.name, "balance":v}}, function() {return})
    })
    chrome.storage.local.set({'CurrentAddress': {CurrentAddress: e.address, Name: e.name}}, function() {return})
    handleClose()
    setCurrentAddress({CurrentAddress: e.address, Name: e.name})
  }

  const renderTooltip = props => (
    <div
      {...props}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: '2px 10px',
        color: 'white',
        borderRadius: 3,
        ...props.style,
      }}
    >
      <FormattedMessage id='copy' />
    </div>
  )

  useEffect( () => {
    // setLoading(true)
    async function t () {
      for( var j=1;j<21;j++){
        fetchAddress(j).then((res) => {
          console.log("async return: ", res)
          if (res === undefined) {
          }else{
            setAddressList(a => [...a, res])
          } 
        })   
      }
    }
    t() 
    console.log("AddressList: ", addressList)
    chrome.storage.local.get(['CurrentAddress'], function(e) {
      console.log("e.CurrentAddress: ",e.CurrentAddress)
      // chrome.storage.local.get([e.CurrentAddress], function(f) {
        // console.log("f[e.CurrentAddress] ",f[e.CurrentAddress])
        setCurrentAddress(e.CurrentAddress)
        // setRevBalance(f[e.CurrentAddress].balance)
        checkBalance(e.CurrentAddress.CurrentAddress).then (v =>{
          setRevBalance(v)
        })        
        setRevAddress(e.CurrentAddress.CurrentAddress)
      // })  
    })
    // sleep(200).then(() => setLoading(false))
    // setLoading(false)
  },[])

  return (
    <div style={{ display: "flex", height: 50, backgroundColor: "#f2f3f4" }}>
      <div style={{ paddingTop: 10 }}>
        <MyMenu />
      </div>  
      <div style={{ paddingTop: 10 }}>
        <Button
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="outlined"
          color="#f2f3f4"
          onClick={handleClick}
          fullWidth={true}
          endIcon={<ExpandMoreIcon/>}
          style={{ borderRadius: 24, width: 270, fontSize: 10 }}
        >
          {/* { loading ? "Loading..." : currentAddress.name } */}
          { currentAddress.Name ? currentAddress.Name : <FormattedMessage id='init_import' />}
          {/* <CopyToClipboard text={revAddress}
            onCopy={() => {}}>
            <FileCopyIcon width="20px" height="20px" cursor="pointer" />
          </CopyToClipboard> */}
        </Button>
        <StyledMenu
          id="customized-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          { addressList.map((i) => {
            return  <StyledMenuItem>
                      <ListItem button key={i.address} onClick={()=>selectAddr(i)} >
                        <ListItemIcon>
                          <Jazzicon diameter={40} seed={parseInt(i.address.slice(22,30), 16)} />
                        </ListItemIcon>                       
                        <ListItemText 
                          primary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="subtitle2"
                                style={{display: 'inline'}}
                                color="textPrimary"
                              >
                                {i.name}
                              </Typography>
                              <Typography
                                component="span"
                                variant="body1"
                                color="secondary"
                                style={{display: 'inline', paddingLeft:30}}
                              >
                                {(i.balance/100000000).toFixed(2) + " REV"}
                              </Typography>
                            </React.Fragment> }
                          secondary={ concealAddress(i.address) }/>
                      </ListItem>
                    </StyledMenuItem>
            })
          }  
        </StyledMenu>

      </div>
    </div>
  )
}