/*global chrome*/
import React from 'react'
import Alert from '@material-ui/lab/Alert';

import { readonly, validator, nodeHash } from './rnode'

const { rnodeDeploy, rnodePropose, signDeploy } = require('@tgrospic/rnode-grpc-js')
require('./rnode-grpc-gen/js/DeployServiceV1_pb')
require('./rnode-grpc-gen/js/ProposeServiceV1_pb')
// Generated files with rnode-grpc-js tool
// const protoSchema = require('../rnode-grpc-gen/js/pbjs_generated.json')
// Import generated protobuf types (in global scope)
// require('../rnode-grpc-gen/js/DeployServiceV1_pb')
// require('../rnode-grpc-gen/js/ProposeServiceV1_pb')

// export const rnode = (rnodeUrl) => {
//   const options = { grpcLib: grpcWeb, host: rnodeUrl, protoSchema }
//   const {
//     getBlocks,
//     getBlock,
//     listenForDataAtName,
//     doDeploy
//   } = rnodeDeploy(options)

//   const { propose } = rnodePropose(options)
//   return { DoDeploy: doDeploy, propose, listenForDataAtName, getBlocks, getBlock}
// }

const plusOne = (n) => {
  const m = n.replace("node","")
  const mm = (Number( m ) + 1) % 20
  return "node" + mm
}

const nextNode = async () => {
  const next = await fetch( "https://status.rchain.coop/api/validators", { method:'get' })
    .then((str) => str.json())
    .then( x => { return x.nextToPropose.host})
  console.log("next: ", next)
  const domain = next.split(".")
  const next1 = plusOne(domain[0]) + "." + domain[1] + "." + domain[2] + "." + domain[3] + "." + domain[4]
  const next2 = plusOne(plusOne(domain[0])) + "." + domain[1] + "." + domain[2] + "." + domain[3] + "." + domain[4]
  console.log("next[,,]: ", [next, next1, next2])
  return [next, next1, next2]
}

const num = async ()=> {
  let y
  try {
    y = await fetch(readonly[0] + `/api/last-finalized-block`, { method:'get' })
      .then((str) => str.json()).then( x => {const z= {height: x.blockInfo.blockNumber, node: x.blockInfo.sender}; return z })
  } catch(err) {
    try {
      y = await fetch(readonly[1] + `/api/last-finalized-block`, { method:'get' })
        .then((str) => str.json()).then( x => {const z= {height: x.blockInfo.blockNumber, node: x.blockInfo.sender}; return z } )
    } catch(err) {
      y = await fetch(readonly[2] + `/api/last-finalized-block`, { method:'get' })
        .then((str) => str.json()).then( x => {const z= {height: x.blockInfo.blockNumber, node: x.blockInfo.sender}; return z } )
    }
  }
  return y
}

export const apiDeploy = async ( code, privateKey) => {

  const lastBlock = await num()
 
  const deployData = {
    term: code, phlolimit: 300000, phloprice: 1,
    validafterblocknumber: lastBlock.height
  }
  console.log("deployData: ", deployData)
  console.log("privatekey: ",privateKey)
  const deploy = await signDeploy(privateKey, deployData)
  // const isValidDeploy = verifyDeploy(deploy)
  const da = {
    data: {
      term: deploy.term,
      timestamp: deploy.timestamp,
      phloPrice: deploy.phloprice,
      phloLimit: deploy.phlolimit,
      validAfterBlockNumber: deploy.validafterblocknumber
    },
    sigAlgorithm: deploy.sigalgorithm,
    signature: bytesToHex(deploy.sig),
    deployer: bytesToHex(deploy.deployer)
  }
  console.log("da: ", da)
  const req = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(da)
  }


  // const nextNode =  (sender) => {
//   return nodeHash.findIndex(x => x === sender)  
// }
//   const tempB = nextNode(lastBlock.node)
//   try {
//     const b = await fetch(validator[ tempB + 7 > 8 ? tempB + 7 - 9 : tempB + 7 ]+`/api/deploy`, req).then(r => r.json()).then(x =>  x)
//     return b
//   } catch(err) {
//     try {
//       const b = await fetch(validator[ tempB + 8 > 8 ? tempB + 8 - 9 : tempB + 8 ]+`/api/deploy`, req).then(r => r.json()).then(x =>  x)
//       return b
//     } catch(err) {
//       const b = await fetch(validator[ tempB + 0 > 8 ? tempB + 0 - 9 : tempB + 0 ]+`/api/deploy`, req).then(r => r.json()).then(x =>  x)
//       return b
//     }
//   }
// }




  const tempB = await nextNode()
  console.log("tempB: ", tempB)
  try {
    const b = await fetch( "https://" + tempB[0] +`/api/deploy`, req).then(r => r.json()).then(x =>  x)
    return b
  } catch(err) {
    try {
      const b = await fetch("https://" + tempB[1]+`/api/deploy`, req).then(r => r.json()).then(x =>  x)
      return b
    } catch(err) {
      const b = await fetch("https://" + tempB[2]+`/api/deploy`, req).then(r => r.json()).then(x =>  x)
      return b
    }
  }
}

const bytesToHex = (bytes) => {
  const hex = []
  for (let i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xf).toString(16));
  }
  return hex.join('')
}

export const checkBalance = async (revAddress) => {
  const req = {
    method: 'POST',
    body: `
            new return, rl(\`rho:registry:lookup\`), RevVaultCh, vaultCh in {
              rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
              for (@(_, RevVault) <- RevVaultCh) {
                @RevVault!("findOrCreate", "${revAddress}", *vaultCh) |
                for (@maybeVault <- vaultCh) {
                  match maybeVault {
                    (true, vault) => @vault!("balance", *return)
                    (false, err)  => return!(err)
                  }
                }
              }
            }
          `
  }
  let b
  try {
    b= await fetch(readonly[0]+`/api/explore-deploy`, req).then(r => r.json()).then(x =>  x.expr[0].ExprInt.data)
  } catch(err) {
    try {
      b=  await fetch(readonly[1]+`/api/explore-deploy`, req).then(r => r.json()).then(x =>  x.expr[0].ExprInt.data)
    } catch(err) {
      b=  await fetch(readonly[2]+`/api/explore-deploy`, req).then(r => r.json()).then(x =>  x.expr[0].ExprInt.data)
    }
  }
  return b
}

export const  storeHistory = (revAddress, deployId, amount, toAddr) => { 
  // const d = Date.now()
  chrome.storage.local.get(["History"], function(result) {
    var newOne = result.History
    // amount, deploy, fromAddr, reason, retUnforeable, success, toAddr
    // newOne.push({time: d, address: revAddress, deployId: deployId, amount: amount, to: toAddr, status: "Pending"})
    newOne.push({fromAddr: revAddress, deploy: {timestamp: +new Date, sig: deployId}, amount: (amount * 100000000).toFixed(0), toAddr: toAddr, success: "", reason: "", retUnforeable: ""})

    chrome.storage.local.set({'History': newOne}, function() {return})
  })
}  

export const generateCode = (revAddress, amount, toAddr) => {
  // var amt 
  // if (revBalance - amount * 100000000 < 300000) {
  //   amt = (revBalance  - 300000).toFixed(0)   
  //   amount = ((revBalance  - 300000) / 100000000).toFixed(8)
  // }else{
  //   amt = (amount * 100000000).toFixed(0)
  //   amount = (amt / 100000000).toFixed(8) 
  // }
  // // console.log("amt: ",amt)
  // // console.log("amount: ",this.state.amount)
  // if (amt <=0) {
  //     // this.setState({showModal9: true, showModal2: false})
  //     return <Alert severity="error">balance is not enough</Alert>
  // }

  // if (toAddr.length !== 53 && toAddr.length !== 54){
  //   // this.setState({showModal10: true, showModal2: false})
  //   return <Alert severity="error">The address is wrong</Alert>
  // }

  const code =`
    new rl(\`rho:registry:lookup\`), RevVaultCh in {
      rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
      for (@(_, RevVault) <- RevVaultCh) {
        new vaultCh, vaultTo, revVaultkeyCh,
          deployerId(\`rho:rchain:deployerId\`),
          deployId(\`rho:rchain:deployId\`)
        in {
          match ("${revAddress}", "${toAddr}", ${(amount * 100000000).toFixed(0)}) {
            (revAddrFrom, revAddrTo, amount) => {
              @RevVault!("findOrCreate", revAddrFrom, *vaultCh) |
              @RevVault!("findOrCreate", revAddrTo, *vaultTo) |
              @RevVault!("deployerAuthKey", *deployerId, *revVaultkeyCh) |
              for (@vault <- vaultCh; key <- revVaultkeyCh; _ <- vaultTo) {
                match vault {
                  (true, vault) => {
                    new resultCh in {
                      @vault!("transfer", revAddrTo, amount, *key, *resultCh) |
                      for (@result <- resultCh) {
                        match result {
                          (true , _  ) => deployId!((true, "Transfer successful (not yet finalized)."))
                          (false, err) => deployId!((false, err))
                        }
                      }
                    }
                  }
                  err => {
                    deployId!((false, "REV vault cannot be found or created."))
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  // this.setState({showModal2: false, showSpinner: true})
  return code
}

export const  decryptSK = async (revAddress, PKpass) => { 
  var Wallet = require('ethereumjs-wallet')
  var passworder = require('browser-passworder')
  const c_key = revAddress + "_keyfile"
  var tempP
  return new Promise(function(resolve, reject) {
    chrome.runtime.sendMessage({ cmd: 'GET_BASICKEY' }, response => {
      // this.setState({basicKey: response.basicKey}, ()=>{console.log("response.basicKey: ",response.basicKey)})})
      chrome.storage.local.get([c_key], function(result) {
        try {
          passworder.decrypt(response.basicKey, result[c_key])
          .then(async function(blob) {
            // setFileContents(blob)
            try {
              tempP = Wallet.fromV3(blob, PKpass, true).getPrivateKeyString().slice(2) 
            }
            catch(err) {
              // alert("Keystore密码错Wrong Password")
              // this.setState({showModal3: true, showSpinner: false })
              // setShowM3(true)
              // return  <Alert severity="error">Keystore密码错Wrong Password</Alert>
              resolve([false,false])
            }  
            // setSk(tempP)
            resolve([true,tempP])

          })
        }
        catch(err) {
          // alert("密码输入有误，操作失败")
          // this.setState({showModal7: true})
          // setShowM7(true)
          // return <Alert severity="error">密码输入有误，操作失败</Alert>
          return
        }
      })
    })
  })  
}

// const  finalDeploy = async (sk, code) => { 
//   try {
//     // sendDeploy(http, code, this.state.sk).then( (response) => {

//     apiDeploy(code, sk).then( (response) => {
//       // console.log("Response: ", response)
//       try {
//         if (response.substring(0,8) ==="Success!") {
//           // this.setState({deployId: response.substring(22,164), showModal4: true, showSpinner: false})
//           // setDeployId(response.substring(22,164))
//           // setShowM4(true)

//           storeHistory(revAddress, response.substring(22,164), amount, toAddr)
//         }else{
//           // alert("操作失败 The operation failed")
//           // this.setState({showModal6: true, showSpinner: false})
//           // setShowM6(true)
//           return
//         }  
//       }
//       catch(err) {
//         // alert("操作失败 The operation failed")
//         // this.setState({showModal6: true, showSpinner: false})
//         // setShowM6(true)
//         return
//       }  
//     })
//   }
//   catch(err) {
//     // alert("操作失败 The operation failed")
//     // this.setState({showModal6: true, showSpinner: false})
//     // setShowM6(true)
//     return
//   }
// }  