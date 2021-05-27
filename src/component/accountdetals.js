/*global chrome*/
import React, {useState, useEffect, useContext, useMemo}from 'react'
import Button from '@material-ui/core/Button'
import {FormattedMessage} from 'react-intl'
import Jazzicon from 'react-jazzicon'
import Typography from '@material-ui/core/Typography'
import qrCode from 'qrcode-generator'
import { makeStyles } from '@material-ui/core/styles'
import CreateTwoToneIcon from '@material-ui/icons/CreateTwoTone'
import DoneTwoToneIcon from '@material-ui/icons/DoneTwoTone'
import CloseTwoToneIcon from '@material-ui/icons/CloseTwoTone'
import Divider from '@material-ui/core/Divider'

export default function AccountDetails(props) {
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(props.item.name)
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
    },
  
    accountDetailsModalDivider: {
      width: '100%',
      height: 1,
      margin: '19px 0 8px 0',
      backgroundColor: '$alto',
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

  const qrImage = qrCode(4, 'M')
  qrImage.addData(props.item.address)
  qrImage.make()

  const saveNewName = () => {
    setIsEditing(false)
    chrome.storage.local.set({[`address${props.item.SN}`]: { "SN":props.item.SN,
      "address": props.item.address,
      "balance": props.item.balance,
      "name": newName
    }})
    chrome.storage.local.get(["CurrentAddress"], function(res) {
      if (res["CurrentAddress"].CurrentAddress=== props.item.address) {
        chrome.storage.local.set({'CurrentAddress': {CurrentAddress: props.item.address, Name: newName}})
      }
    })
  }    

  const renderEditing = () => {

    return [(
      <input
        key={1}
        type="text"
        required
        dir="auto"
        value={newName}
        onChange={(event) => setNewName(event.target.value)}
      />
    ), (
      <div className="editable-label__icon-wrapper" key={2} onClick={() => saveNewName()}>
        <DoneTwoToneIcon />
      </div>
    )]
  }

  const renderReadonly = () => {
    return [(
      <div key={1} className="editable-label__value">{newName}</div>
    ), (
      <div key={2} className="editable-label__icon-wrapper" onClick={() => setIsEditing(true)} >
        <CreateTwoToneIcon />
      </div>
    )]
  }
  
  return (
    // <div className={classes.paper}>
    <div className={classes.modal} >
      {/* <div className={classes.modal__content} > */}
      {/* <div style={{backgroundColor: 'white'}} > */}
        <div className={classes.accountModalContainer}>
          <div className={classes.accountModalIdenticon} >
            <Jazzicon diameter={64} seed={parseInt(props.item.address.slice(22,30), 16)} />
          </div>
          {/* <div className={classes.accountModalClose} onClick={() => {props.hideModals(true)}} > */}
          <div className={classes.accountModalClose} onClick={() => { props.hideModals(true)}} >
            <CloseTwoToneIcon />
          </div>
          <div style={{ display: "flex"}} >
            {
              isEditing
                ? renderEditing()
                : renderReadonly()
            }
          </div>
          <div className={classes.accountDetailsModalQrHeader}>
            <div
              className="accountDetailsModalQrWrapper"
              dangerouslySetInnerHTML={{
                __html: qrImage.createTableTag(4),
              }}
            />
            <input
              wrapperClass="accountDetailsModalEllipAddressWrapper"
              value={props.item.address}
            />
          </div>
          {/* <div className={classes.accountDetailsModalDivider} /> */}
          <Divider />
          <Button
            type="secondary"
            variant="outlined"
            className={classes.accountDetailsModalButton}
            onClick={() => {
              chrome.tabs.create({ url: "https://revdefine.io/#/revaccounts/" + props.item.address })
            }}
          >
            <FormattedMessage id='view_on_revdefine' />
          </Button>

          <Button
            type="primary"
            variant="outlined"
            className={classes.accountDetailsModalButton}
            onClick={() => props.showExportPrivateKeyModal(true)}
          >
            <FormattedMessage id='export_private_key' />
          </Button>

        </div>
    </div>

  )
}    

