import axios from 'axios'
import React, { useState, useEffect } from 'react'

const BorrowList = ({ org, updateUserDetails }) => {
  const [borrowList, setBorrowList] = useState(null)

  useEffect(() => {
    const getBorrowList = async () => {
      const response = await fetch(`http://localhost:8000/getborrowrequests/${org}`)
      const data = await response.json()
      console.log(data)
      setBorrowList(data)
    }
    if(!borrowList)
      getBorrowList()
  }, [])

  const handleClick = async (borrowRequest) => {
    try{
      const response = await axios.post(`http://localhost:8000/approveborrowrequest/${org}`, { "borrower": borrowRequest.Record.borrower })
      console.log(response.data)
      await updateUserDetails()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <h1>All Borrow Requests</h1>
      {borrowList?borrowList.map((borrowRequest) => 
      <div key={borrowRequest.Key} className='detailsDiv'>
        <p><b>Borrower: </b>{borrowRequest.Record.borrower.substring(0,12) + "..."}</p>
        <p><b>Created By: </b>{borrowRequest.Record.name}</p>
        <p><b>Tokens Requested: </b>{borrowRequest.Record.amount}</p>
        <p><b>Interest Rate: </b>{borrowRequest.Record.interest_rate}</p>
        <p><b>Loan Duration: </b>{borrowRequest.Record.period_in_months}</p>
        {/* <p><b>Created at: </b>{borrowRequest.Record.timestamp.substring(0,25)}</p> */}
        <button className='btn' onClick={() => handleClick(borrowRequest)}>Lend Tokens</button>
      </div>
      ) : <h3>No Borrow Requests</h3>
    }
    </div>
  )
}

export default BorrowList