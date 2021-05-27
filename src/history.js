/*global chrome*/

import React, {useState, useEffect, useMemo} from 'react'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import {FormattedMessage} from 'react-intl'
import {fetchHistory} from './helper/fetchHistory'
import RchainLogo from './asset/icon/rchainlogo.js'
import ContentPage from './component/content'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import { FixedSizeList } from 'react-window'
import AutoSizer from "react-virtualized-auto-sizer"
import Divider from '@material-ui/core/Divider'
import AddressMenu from './component/addressMenu'
import { addressContext } from './helper/addressContext'

function History () {
  const [hList,setHList] = useState([])
  const [loading, setLoading] = useState(true)
  const [revAddress, setRevAddress] = useState(null)
  const [revBalance, setRevBalance] = useState(null)
  const value = useMemo(() => ({ revAddress, setRevAddress, revBalance, setRevBalance }), [revAddress, setRevAddress, revBalance, setRevBalance ]);

  const useStyles = makeStyles({
    out: {
      color: "#b47d00",
      backgroundColor: "rgba(219,154,4,.2)",
      fontSize: ".60938rem",
      borderRadius: "35rem!important",
      boxSizing: "border-box",
      width: 40,
      textAlign: "center"
    },
    in: {
      color: "#02977e",
      backgroundColor: 'rgba(0,201,167,.2)',
      fontSize: ".60938rem",
      borderRadius: "35rem!important",
      boxSizing: "border-box",
      width: 40,
      textAlign: "center"
    },
  })

  const classes = useStyles()

  useEffect( () => {
    setLoading(true)
    async function fetchData() {
      var trans = []
      chrome.storage.local.get(['History'], async function(result) { 
        trans= await result.History
      })
      const his = await fetchHistory(revAddress)
      console.log("his : ", his)
      var sigList = []
      his.forEach(e =>{
        sigList.push(e.deploy.sig)
      })
      // console.log("sigList : ", sigList)
      console.log("trans : ", trans)
      var newList = []
      trans.forEach(element => {
        if (!sigList.includes(element.deploy.sig)) {
          his.unshift(element)
          newList.unshift(element)
        } 
      })
      setHList(his)
      console.log("newList : ", newList)
      chrome.storage.local.set({'History': newList}, function() {return})
      setLoading(false)
    }
    fetchData()
  },[revAddress])

const Row = ({index, style}) => (
  <div style={style}  >
  <Container style={{ paddingTop: '4px', paddingLeft: '1px' }}>
    <div>
      <div style={{ color: '#5e6064', fontSize: '12px', paddingTop: '8px', textAlign: 'left'  }} >
        {new Date(hList[index].deploy.timestamp).toLocaleString()}
      </div>
      <Grid container >
          <Grid item xs={1} ><RchainLogo/></Grid>
          <Grid item xs={4} style={{ color: '#24272A', fontSize: '14px', paddingTop: '4px', textAlign: 'left'  }}>{toStatus(hList[index].success)}</Grid>
          <Grid item xs={2} style={{ color: '#c3326d', paddingTop: '4px' }}>{revAddress ===hList[index].fromAddr ? <div className= {classes.out}>OUT</div> : <div className= {classes.in}>IN</div>}</Grid>
          <Grid item xs={5} style={{ color: '#24272A', fontSize: '14px', paddingTop: '4px', textAlign: "right"  }}>{(hList[index].amount/100000000).toFixed(2)} REV</Grid>
      </Grid>
      <Grid container >
          <Grid item xs={4} style={{ color: '#5e6064', fontSize: '12px', paddingTop: '8px', textAlign: 'left'  }}>{hList[index].toAddr.substring(0,10)+"......"}</Grid>
          <Grid item xs={2} style={{  paddingTop: '8px' }}></Grid>
          <Grid item xs={6} style={{ color: '#5e6064', ontSize: '12px', paddingTop: '8px' }}>{"DeployID:" +  hList[index].deploy.sig.substring(0,10)+"..."}
            <CopyToClipboard text={hList[index].deploy.sig}
              onCopy={() => this.setState({copied: true})}>
              <FileCopyIcon  cursor="pointer" color='#5e6064'  style={{ fontSize: 10 }} />
            </CopyToClipboard>
          </Grid>
      </Grid>
    </div>   
    <Divider />
  </Container>
</div>
)
 
const Example = () => (
  <AutoSizer>
    {({ height, width }) => (
      <FixedSizeList
        className="List"
        height={height}
        itemCount={hList.length}
        itemSize={105}
        width={width}
      >
 { Row }
      </FixedSizeList>
    )}
  </AutoSizer>
)

const toStatus = (x) =>{
  switch (x) {
    case true:
      return "Confirmed"
    case false:
      return "Failed"
    default:
      return "Pending"
  }
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

  return (
    <ContentPage>
      <addressContext.Provider value={value}>
        <AddressMenu/>
      </addressContext.Provider>
      <div  style={{ paddingTop: 1,  paddingLeft: 120}}>
        <h4>
          <FormattedMessage id='history' />
        </h4>  
      </div>  

      { loading ? <div>Loading</div> : <Example/> }
    </ContentPage>
  )
}

export default withRouter(History)



