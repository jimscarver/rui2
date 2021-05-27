/*global chrome*/

import ReactDom from "react-dom"
import React, { useEffect } from 'react'
import { HashRouter, Switch, Route, Redirect, useHistory} from 'react-router-dom'
import LoginPage from './login'
import ConnectPage from './connect'
import RegPage from './register'
import ImportPage from './import'
import TransferPage from './transfer'
import PassPage from './pass'
import AddressPage from './address'
import AboutPage from './about'
import HistoryPage from './history'
import KeytoolsPage from './keyTools'
import Auth from './helper/auth'
import {IntlProvider} from "react-intl"
import CN from './lang/CN'
import EN from './lang/EN'  

const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    Auth.authenticated ===true
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
)

const chooseLocale = () => {
  switch(navigator.language.split('-')[0]){
    case 'en':
      return EN
    case 'zh':
      return CN
    default:
      return EN
  }
}

function App () {

  let history = useHistory()
  useEffect( () => {
    async function isNewUser(){
      await chrome.storage.local.get(['userPass'], function(result) {
        if(result.userPass === undefined ){
          history.push('/register') 
        } else{
          history.push('/login') 
        } 
      })
    }  
    isNewUser()
  },[history])  

  return(
    <div >
      <Switch>
        <Route  path="/login" component={ LoginPage } />
        <Route  path="/register" component={ RegPage } />          
        <ProtectedRoute  path="/import" component={ ImportPage } />
        <ProtectedRoute  path="/transfer" component={ TransferPage } />
        <ProtectedRoute  path="/pass" component={ PassPage } />
        <ProtectedRoute  path="/address" component={ AddressPage } />          
        <ProtectedRoute  path="/about" component={ AboutPage } />    
        <ProtectedRoute  path="/history" component={ HistoryPage } />   
        <ProtectedRoute  path="/keytools" component={ KeytoolsPage } />   
        <ProtectedRoute  path="/connect" component={ ConnectPage } />   
      </Switch>
    </div >   
  )
}

ReactDom.render(<HashRouter><IntlProvider locale={navigator.language} messages={chooseLocale()}><App /></IntlProvider></HashRouter> , document.getElementById("root"))

