export const fetchHistory = (address) => {
  return new Promise(function(resolve, reject) {
    const status = "https://status.rchain.coop/api/transfer/" + address
    const result = fetch(status, { method:'get' })
      .then((str)  => str.json())
      .then(temp =>{
        return(temp)               
      })
      resolve(result)
    })  
// [{timestamp: timestamp, fromAddr: xxx,toAddr: xxx , amount: xxx, success: xxx, reason: xxx },]
}
