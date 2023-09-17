import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Home = ({ org, user, setUser }) => {
  const navigate = useNavigate()
  const [name, setName] = useState('')

  const handleRegister = async () => {
    console.log(name)
    const response = await axios.post(`http://localhost:8000/registeruser/${org}`, { name })
    console.log(response.data)
    setUser(response.data)
  }

  return (
    <div>
        {user ? <div style = {{ textAlign: "left" }}>
        <button className='btn' onClick={() => navigate('/borrowform')}>Create Borrow Request</button><br />
        <button className='btn' onClick={() => navigate('/borrowlist')}>View Borrow Requests</button><br />
        <button className='btn' onClick={() => navigate('/mint-tokens')}>Mint Tokens</button><br />
        <button className='btn' onClick={() => navigate('/my-loans')}>My Loans</button>
        </div> :
        <>
        <div className='inputDiv'>
        <label for="name">Name:</label><br/>
        <input className='inputField' type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} /><br/>
        <button className='btn' onClick={() => handleRegister()}>Register</button>
        </div>
        </>
        }
    </div>
  )
}

export default Home