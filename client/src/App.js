import { useState, useEffect } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

//screens import
import Home from './screens/Home';
import Initial from './screens/Initial';
import BorrowForm from './screens/BorrowForm';
import BorrowList from './screens/BorrowList';

import axios from 'axios';
import MintToken from './screens/MintToken';
import Loans from './screens/Loans';

// const orgLocalStorage = localStorage.getItem('organisation');

function App() {
  const [status, setStatus] = useState(false)
  const [org, setOrg] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const checkStatus = async () => {
      const res = await axios.get('http://localhost:8000/checkuser')
      setStatus(res.data)
      if(res.data){
        // localStorage.setItem('organisation', "1");
        setOrg("1")
      }
    }
    if(!org)
      checkStatus()
  },[status])

  useEffect(() => {
    const getContractUser = async () => {
      const res = await axios.get(`http://localhost:8000/getdetails/${org}`)
      console.log(res)
      setUserDetails(res.data)
    }
    if(org)
      getContractUser()
  },[org])

  const enrollandregister = async () => {
    const res = await axios.get('http://localhost:8000/enrollall')
    console.log(res)
    setStatus(true)
  }

  const updateUserDetails = async () => {
    const res = await axios.get(`http://localhost:8000/getdetails/${org}`)
    console.log(res)
    setUserDetails(res.data)
  }

  const handleChange = (value) => {
    console.log(value)
    setOrg(value)
    // localStorage.setItem('organisation', value);
  }

  return (
    <div className="App">
      {org?<div>
        <button className='btn' style={{ position: "absolute", top: "10px", left: "335px" }} onClick={() => navigate('/')}>Home</button>
        <select id="organisation" name="organisation" onChange={(e) => handleChange(e.target.value)} className='inputField' style = {{ marginTop: "15px" }}>
          <option value="1">Org 1</option>
          <option value="2">Org 2</option>
        </select>
      </div>:null}
      <div className='main-screen'>
      <Routes>
        <Route path="/" element={status? <Home org={org} user={userDetails} setUser={setUserDetails} /> : <Initial enrollandregister={enrollandregister} />} />
        <Route path="/borrowform" element={status? <BorrowForm org={org} updateUserDetails={updateUserDetails} /> : <Initial enrollandregister={enrollandregister} />} />
        <Route path="/borrowlist" element={status? <BorrowList org={org} updateUserDetails={updateUserDetails} /> : <Initial enrollandregister={enrollandregister} />} />
        <Route path="/mint-tokens" element={status? <MintToken org={org} updateUserDetails={updateUserDetails} /> : <Initial enrollandregister={enrollandregister} />} />
        <Route path="/my-loans" element={status? <Loans org={org} user={userDetails} updateUserDetails={updateUserDetails} /> : <Initial enrollandregister={enrollandregister} />} />
      </Routes>
      {status?userDetails?<div className='detailsDiv'>
          <h3>
            User details
          </h3>
          <p><b>Name: </b> {userDetails.name}</p>
          <p><b>Balance: </b> {userDetails.balance}</p>
          <p><b>Wallet Address: </b>{userDetails.wallet.substring(0, 18) + "..."} <p onClick={() => {navigator.clipboard.writeText(userDetails.wallet)}}>Copy Address</p></p> 
          <p><b>Tokens Lent: </b>{userDetails.lent_amount}</p>
          {userDetails.lent_amount>0 && <div style={{ display: "flex", margin: "-7px 0px" }}>
            <p>
              <b>Lent to: </b>
              {userDetails.lent_to.substring(0, 18) + "..."}
              </p>
              <p onClick={() => {navigator.clipboard.writeText(userDetails.wallet)}} style={{ cursor: "pointer" }}>
                Copy Address
              </p>
            </div>
            }
          <p><b>Tokens Borrowed: </b>{userDetails.loan_amount}</p>
          {userDetails.loan_amount>0 && <p><b>Loan from: </b>{userDetails.loan_from.substring(0, 18) + "..."} <p onClick={() => {navigator.clipboard.writeText(userDetails.wallet)}}>Copy Address</p></p>}
        </div> : <div>No user found</div> : null}
        </div>
    </div>
  );
}

export default App;
