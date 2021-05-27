/*global chrome*/

import React , {useState, useEffect}from 'react'
import { withRouter, useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {FormattedMessage} from 'react-intl'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Menu from './component/menu'
import ContentPage from './component/content'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import IconButton from '@material-ui/core/IconButton'
import {fetchAddress, concealAddress } from './helper/fetchAddress'
import AccountDetails from './component/accountdetals'
import RevealPrivateKey from './component/revealprivatekey'
import Modal from '@material-ui/core/Modal'
import PageviewOutlinedIcon from '@material-ui/icons/PageviewOutlined'
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined'
import Jazzicon from 'react-jazzicon'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import Tooltip from '@material-ui/core/Tooltip'


function AddressPage () {
  const [addressList, setAddressList] = useState([])
  const [showAccountDetailsModal, setShowAccountDetailsModal] = useState(false)
  const [showRevealPrivateKeyModal, setShowRevealPrivateKeyModal] = useState(false)
  const [currentItem, setCurrentItem] = useState({})
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [removedItemSN, setRemovedItemSN] = useState("")
  

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
      marginTop: 17,
      padding: '10px 22px',
      width: 120,
      marginLeft:20,
      marginBottom:20
    },
  }))    
  const classes = useStyles()

  let history = useHistory()

  useEffect( () => {
    setAddressList([])
    async function t () {
      for( var j=1;j<21;j++){
        fetchAddress(j).then((res) => {
          if (res === undefined) {
          }else{
            setAddressList(a => [...a, res])
          } 
        })   
      }
    }
    t()  
  },[showAccountDetailsModal])

  const confirmRemove = () => {
    const t = addressList.filter((i) => i.SN!==removedItemSN)
    setAddressList(t)
    chrome.storage.local.get(["address"+removedItemSN], function(result) {
      chrome.storage.local.remove([result["address"+removedItemSN].address + "_keyfile"], function() {}) 
      chrome.storage.local.get(["CurrentAddress"], function(res) {
        if (res["CurrentAddress"].CurrentAddress=== result["address"+removedItemSN].address) {
          if (t.length>0) {
            chrome.storage.local.set({'CurrentAddress': {CurrentAddress: t[0].address, Name: t[0].name}})
          } else{
            chrome.storage.local.set({'CurrentAddress': {CurrentAddress: "", Name: ""}})
          }
        }   
      })  
    })  
    chrome.storage.local.remove(["address"+removedItemSN], function() {}) 
    setShowRemoveModal(false)
  }  

  const remove = (SN) => {
    setShowRemoveModal(true)
    setRemovedItemSN(SN)
  }

  const toUpload =() => {
    history.push('/import')
  }

  const getDetail = (item) =>{
    setShowAccountDetailsModal(true)
    setCurrentItem(item)
  }

  const showEPK = (v) =>{
    setShowRevealPrivateKeyModal(v)
    setShowAccountDetailsModal(!v)
  }

  const hideModals = (v) =>{
    setShowRevealPrivateKeyModal(!v)
    setShowAccountDetailsModal(!v)
  }

  return (  
    <ContentPage>
      <div style={{ paddingTop: 10 }}>
        <Menu />
      </div>  
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={showAccountDetailsModal}
        // onClose={handleClose}
        // closeAfterTransition
        // BackdropComponent={Backdrop}
        // BackdropProps={{
        //     timeout: 500,
        // }}
      >
        <AccountDetails item = { currentItem } showExportPrivateKeyModal = { showEPK } hideModals = { hideModals } />
      </Modal>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={showRevealPrivateKeyModal}
      >
        <RevealPrivateKey item = { currentItem } hideModals = { hideModals }/>
      </Modal>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={showRemoveModal}
      >
        <div  className={classes.modal} >
          <div  style={{paddingTop: 30, paddingLeft: 20}} >
            <Typography variant="body1" gutterBottom>
              <FormattedMessage id='delete_keystore' />
            </Typography>
          </div>
        <div style={{ display: "flex", paddingTop: 40, paddingLeft: 15}} >
          <Button
            type="secondary"
            variant="outlined"
            onClick={() => {
              setShowRemoveModal(false)
            }}
            className={classes.modalButton}
          >
            <FormattedMessage id='cancel' />
          </Button>

          <Button
            color="primary"
            variant="outlined"
            onClick={() => confirmRemove()}
            className={classes.modalButton}
          >
            <FormattedMessage id='confirm' />
          </Button>
        </div>  
        </div>
      </Modal>
      <div className="Rui_address_page" >    
        <h4 style={{ paddingLeft: 90}}>
          <FormattedMessage id='addr_list' />
        </h4>  
        <IconButton aria-label="delete" onClick={() =>toUpload()}>
          <AddCircleOutlineIcon />
        </IconButton>
        <List component="nav" aria-label="main mailbox folders">
          { addressList.map((item) => 
            <CopyToClipboard text={item.address}>
              <Tooltip title={<FormattedMessage id='copy_to_clipboard' />}>
                <ListItem button >
                  <ListItemIcon>
                    <Jazzicon diameter={32} seed={parseInt(item.address.slice(22,30), 16)} />
                  </ListItemIcon>
                  <ListItemText primary={item.name } secondary={ concealAddress(item.address) }/>
                  <PageviewOutlinedIcon size="sm" onClick={() =>getDetail(item)}/>
                  <DeleteForeverOutlinedIcon size="sm" onClick={() =>remove(item.SN)}/>
                </ListItem>
              </Tooltip>
            </CopyToClipboard>
          )}
        </List>
      </div>
    </ContentPage>
  )
}

export default withRouter(AddressPage)



