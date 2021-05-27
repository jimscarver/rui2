/*global chrome*/

let timerTime
let basicKey

const getCurrentAddress =  ()=>{
  // chrome.storage.local.get(["CurrentAddress"], function(res) {
  //   console.log("res.CurrentAddress :", res.CurrentAddress.CurrentAddress)
  //   return(res.CurrentAddress.CurrentAddress)
  // })
  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(["CurrentAddress"], function(res) {
      resolve(res.CurrentAddress.CurrentAddress)
    })
  })  
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.cmd === 'START_TIMER') {
//     timerTime = new Date(request.when)
//   } else if (request.cmd === 'GET_TIME') {
//     sendResponse({ time: timerTime })
//   }else if (request.cmd === 'SET_BASICKEY') {
// 	basicKey = request.basicKey
// 	// console.log("background:basicKey: ",basicKey)
//   }else if (request.cmd === 'GET_BASICKEY') {
//     sendResponse({ basicKey: basicKey })
//   }
// })

  switch (request.cmd) {
    case 'START_TIMER':
      timerTime = new Date(request.when)
      break
    case 'GET_TIME':
      sendResponse({ time: timerTime })
      break
    case 'SET_BASICKEY':
      basicKey = request.basicKey
      break
    case 'GET_BASICKEY':
      sendResponse({ basicKey: basicKey })
      break
    case 'GET_CURRENT_ADDRESS':
      console.log("background.js works")
      sendResponse({ currentAddress: getCurrentAddress() })
      // getCurrentAddress().then((r)=>{
      //   console.log("r:", r)
      //   // sendResponse({ currentAddress: r })
      //   sendResponse({ currentAddress: "rrrrrrr" })

      //   return true
      // })

      break
    default:
      break
  }   
})   



// chrome.browserAction.onClicked.addListener(function (tab) {
// 	// for the current tab, inject the "inject.js" file & execute it
// 	chrome.tabs.executeScript(tab.id, {
// 		file: 'inject.js'
// 	})
// })

// webpage ask for user name,
// webpage <=> inject.js via window.postMessage()
// inject.js <=> background.js via chrome.runtime.sendMessage()
// background.js <=> new connect.js via sendResponse