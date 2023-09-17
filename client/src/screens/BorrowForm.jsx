import React, { useState } from 'react'
import axios from 'axios'

const BorrowForm = ({ org, updateUserDetails }) => {
    const [borrowRequest, setBorrowRequest] = useState({
        "amount": 0,
        "months": 0,
        "interest": 0
    })

    const handleChange = (e) => {
        setBorrowRequest({
            ...borrowRequest,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async () => {
        console.log(borrowRequest)
        try {
            const response = await axios.post(`http://localhost:8000/createborrowrequest/${org}`, {
                ...borrowRequest
              })
            console.log(response.data)
            await updateUserDetails()
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div className='detailsDiv'>
        <div className='inputDiv'>
            <label for="amount">Amount Required:</label><br />
            <input className='inputField' type="number" id="amount" name="amount" value={borrowRequest.amount} onChange={(e) => handleChange(e)} /><br/>
        </div>
        <div className='inputDiv'>
            <label for="months">Duration (number of months):</label><br />
            <input className='inputField' type="number" id="months" name="months" value={borrowRequest.months} onChange={(e) => handleChange(e)} /><br/>
        </div>
        <div className='inputDiv'>
            <label for="interest">Interest Rate (%):</label><br />
            <input className='inputField' type="number" id="interest" name="interest" value={borrowRequest.interest} onChange={(e) => handleChange(e)} /><br/>
        </div>
        <button className='btn' onClick={handleSubmit}>Submit</button>
    </div>
  )
}

export default BorrowForm