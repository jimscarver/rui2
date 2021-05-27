/*global chrome*/

export const fetchAddress = (number) => {
  return new Promise(function(resolve, reject) {
    // "{\"address\":\"1111kwFVksomdFsTXuExGm9CbwKRn2ZK2SQvwKM7SvZCPxX8fT9gb\",\"name\":\"eric\",\"balance\":\"22\"}"
    chrome.storage.local.get(["address"+number], function(result) {
      if (result.hasOwnProperty("address"+number) === true) {
        // var tempC= result["address"+addr].substring(0,8) +"........"+ result["address"+addr].substring(result["address"+addr].length-7,result["address"+addr].length+1)
        const temp = result["address"+number]
        console.log("fetchAddress.js temp : ", temp)
        // var temp1 = JSON.parse(temp)
        // console.log("fetchAddress.js temp1 : ", temp1)
        resolve({SN:number, address:temp.address, name:temp.name, balance:temp.balance})
      } else{
        resolve(undefined)
      } 
    })
  })  
}

export const concealAddress = (address) =>{
    return address.substring(0,8) +"........"+ address.substring(address.length-7,address.length+1)
}

export const fetchKeyfile = (number) => {
  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(["address"+number], function(result) {
      if (result.hasOwnProperty("address"+number) === true) {
        chrome.storage.local.get(result["address"+number]+"_keyfile", function(res) {
          resolve({addr:result["address"+number], keyfile:res})
        })
      }  
    })
  })
}