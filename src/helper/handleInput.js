import { useState } from 'react'

export const usePasswordChange = () => {
  const [input, setInput] = useState({})
  const [showM, setShowM] = useState(false)

  const handlePasswordChange = (event) => {
    var pass = event.target.value
    var reg = /^[A-Za-z0-9.]+$/
    var test = reg.test(pass)
    // const name = event.target.name
    if (test || pass.length === 0) {
      // this.setState({[name]: event.target.value})
      setInput({
        ...input,
        [event.currentTarget.name]: event.currentTarget.value
      })
      
    }else{
      // alert('only alphanumeric')
      // this.setState({showModal8: true})
      setShowM(true)
    }  
  }
  return [input, showM, handlePasswordChange]
}

export const useInputChange = () => {
  const [input, setInput] = useState({})
  
  const handleInputChange = (e) => setInput({
    ...input,
    [e.currentTarget.name]: e.currentTarget.value
  })

  return [input, handleInputChange]
}

