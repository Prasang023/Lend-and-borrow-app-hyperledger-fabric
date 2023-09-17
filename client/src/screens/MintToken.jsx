import React from 'react'
import axios from 'axios'

const MintToken = ({ org, updateUserDetails }) => {

    const handleClick = async (amount) => {
        try{
          const response = await axios.post(`http://localhost:8000/mint/${org}`, { "amount": amount })
          console.log(response.data)
          await updateUserDetails()
        } catch (error) {
          console.log(error)
        }
    }

  return (
    <div className='inputDiv'>
        <label for="amount">Amount:</label><br />
        <input className='inputField' type="text" id="amount" name="amount" /><br/>
        <button className='btn' onClick={() => handleClick(document.getElementById("amount").value)}>Mint</button>
    </div>
  )
}

export default MintToken