import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Loans = ({ org, user, updateUserDetails }) => {
    const [loanData, setLoanData] = useState(null)

    const payInterest = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/payinterest/${org}`)
            console.log(response.data)
            await updateUserDetails()
        } catch (error) {
            console.log(error)
        }

    }

    const payLoan = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/repayloan/${org}`)
            console.log(response.data)
            await updateUserDetails()
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        try {
            const getLoanData = async () => {
                const response = await axios.get(`http://localhost:8000/getmytransaction/${org}`)
                setLoanData(response.data)
            }
            getLoanData()
        } catch (error) {
            console.log(error)
        }
    }, [user])

  return (
    <div>
        {loanData? <div className='detailsDiv'>
            <p><b>Outstanding loan: </b>{loanData.amount}</p>
            <p><b>Interest rate: </b>{loanData.interest_rate}</p>
            <p><b>Last payment time: </b>{loanData.last_payment_time.substring(0,25)}</p>
            <p><b>Loan start time: </b>{loanData.start_time?.substring(0,25)}</p>
            { user.wallet === loanData.borrower ?
            <>
            <p><b>Tokens lent from: </b>{loanData.lender.substring(0,12)}</p>
            <button className='btn' onClick={() => payInterest()}>Pay Interest</button><br />
            <button className='btn' onClick={() => payLoan()}>Settle Loan</button>
            </> : <>
            <p><b>Tokens lent to: </b>{loanData.borrower.substring(0,12)}</p>
            </>
            }
        </div> : <div>No loans</div>}
    </div>
  )
}

export default Loans