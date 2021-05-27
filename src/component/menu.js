/*global chrome*/
import React, { useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Auth from '../helper/auth'
import SendTwoToneIcon from '@material-ui/icons/SendTwoTone'
import HistoryTwoToneIcon from '@material-ui/icons/HistoryTwoTone'
import AssignmentReturnedTwoToneIcon from '@material-ui/icons/AssignmentReturnedTwoTone'
import BuildTwoToneIcon from '@material-ui/icons/BuildTwoTone'
import LibraryBooksTwoToneIcon from '@material-ui/icons/LibraryBooksTwoTone'
import VpnKeyTwoToneIcon from '@material-ui/icons/VpnKeyTwoTone'
import InfoTwoToneIcon from '@material-ui/icons/InfoTwoTone'
import ExitToAppTwoToneIcon from '@material-ui/icons/ExitToAppTwoTone'
import MenuRoundedIcon from '@material-ui/icons/MenuRounded'
import CloseRoundedIcon from '@material-ui/icons/CloseRounded'
import IconButton from '@material-ui/core/IconButton'
import {FormattedMessage} from 'react-intl'

export default function Menu() {

  const [state, setState] = useState(false)
  let history = useHistory()

  const useStyles = makeStyles({
    list: {
      width: 250,
    },
    fullList: {
      width: 'auto',
    },
  })
  const classes = useStyles()

  useEffect( () => {
    //reset the timer
    chrome.runtime.sendMessage({ cmd: 'START_TIMER', when: Date.now()+ 30*60 * 1000 })

  },[])

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' )) {
      return
    }
    setState(open)
  }

  const toLogout = (e) => {
    e.preventDefault()
    Auth.logout()
    chrome.runtime.sendMessage({ cmd: 'SET_BASICKEY', basicKey: '' }, response => { })
    chrome.runtime.sendMessage({ cmd: 'START_TIMER', when: Date.now()- 30*60 * 1000 })
    history.push('/login')
  } 

  const list = () => (
    <div
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer( false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button key="Transfer" component={Link} to="/transfer">
          <ListItemIcon> <SendTwoToneIcon /> </ListItemIcon>
          <ListItemText primary={<FormattedMessage id='transfer' />} />
        </ListItem>
        <ListItem button key="History" component={Link} to="/history">
          <ListItemIcon> < HistoryTwoToneIcon /></ListItemIcon>
          <ListItemText primary={<FormattedMessage id='history' />} />
        </ListItem>
        <ListItem button key="Import" component={Link} to="/import">
          <ListItemIcon> <AssignmentReturnedTwoToneIcon /></ListItemIcon>
          <ListItemText primary={<FormattedMessage id='import' />} />
        </ListItem>
        <ListItem button key="KeyTools" component={Link} to="/keyTools">
          <ListItemIcon> <BuildTwoToneIcon /></ListItemIcon>
          <ListItemText primary={<FormattedMessage id='key_tools' />} />
        </ListItem>
      </List>
      <Divider />
      <List>
          <ListItem button key="Addresses" component={Link} to="/address">
            <ListItemIcon> <LibraryBooksTwoToneIcon /></ListItemIcon>
            <ListItemText primary={<FormattedMessage id='address_man' />} />
          </ListItem>
          <ListItem button key="changePassword" component={Link} to="/pass">
            <ListItemIcon> <VpnKeyTwoToneIcon /></ListItemIcon>
            <ListItemText primary={<FormattedMessage id='change_pass' />} />
          </ListItem>
          <ListItem button key="About" component={Link} to="/about">
            <ListItemIcon> <InfoTwoToneIcon /></ListItemIcon>
            <ListItemText primary={<FormattedMessage id='about' />} />
          </ListItem>
          <ListItem button key="Exit" onClick={(e) => toLogout(e)}>
            <ListItemIcon> <ExitToAppTwoToneIcon /></ListItemIcon>
            <ListItemText primary={<FormattedMessage id='exit' />} />
          </ListItem>
      </List>
      <div style={{ paddingTop: 20, paddingLeft: 80}}>
        <IconButton aria-label="close" onClick={toggleDrawer(false)} ><CloseRoundedIcon fontSize="large" /></IconButton>
      </div>
    </div>
  )

  return (
    <div>
        <React.Fragment key={'left'}>
          <Button onClick={toggleDrawer( true)}><MenuRoundedIcon/></Button>
          <Drawer anchor={'left'} open={state} onClose={toggleDrawer(false)}>
            {list()}
          </Drawer>
        </React.Fragment>
    </div>
  )
}