import React from 'react'
import { withRouter } from 'react-router-dom'
import Menu from './component/menu'
import ContentPage from './component/content'
import TextField from '@material-ui/core/TextField'

function AboutPage () {    
  return (
    <ContentPage>
      <div style={{ paddingTop: 10 }}>
        <Menu />
      </div>  
      <div style={{ marginTop: 25, padding: 10, backgroundColor: '#F6F6F8', opacity: 0.8 }} >        
          <p> Rui锐 Wallet  </p>
          <p> 版本 Version: 1.0.0  </p>
          <p style={{ fontSize:'12px', textAlign:'left'}}> 免责声明:  本软件永久开源免费，遵守MIT开源协议。用户自行承担使用风险，开发者不负任何责任。</p>
          <p style={{ fontSize:'12px', textAlign:'left'}}> Disclaimer:  Rui is under the MIT open source software license. You agree that your use of the software is at your sole risk. The developer shall not be responsible for any damage or loss caused by the use of this software.</p>
          <TextField 
            id="standard-basic" 
            InputProps={{
              style: {
                fontSize:'10px'
              }
            }}
            fullWidth ={true}
            type="text"               
            name="contact" 
            value="联系方式 Email: support@wenode.io"
            style={{ paddingTop:'40px'}}
          />
      </div>
    </ContentPage>
  )
}

export default withRouter(AboutPage)
