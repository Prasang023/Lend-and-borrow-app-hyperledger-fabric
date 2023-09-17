const express = require('express');
const enrollAdmin = require('../fabric_network/sdk/javascript/enrollAdmin')
const enrollAdminOrg2 = require('../fabric_network/sdk/javascript/enrollAdminOrg2')
const registerUser = require('../fabric_network/sdk/javascript/registerUser')
const checkUser = require('../fabric_network/sdk/javascript/checkUser')
const registerUserOrg2 = require('../fabric_network/sdk/javascript/registerUserOrg2')
const register = require('../fabric_network/sdk/javascript/serverQueryRegister')
const getdetails = require('../fabric_network/sdk/javascript/serverQueryGetDetails')
const createBorrowRequest = require('../fabric_network/sdk/javascript/serverCreateBorrowRequest')
const getBorrowRequests = require('../fabric_network/sdk/javascript/serverGetBorrowRequests')
const approveBorrowRequest = require('../fabric_network/sdk/javascript/serverApproveRequest')
const mintTokens = require('../fabric_network/sdk/javascript/serverMint')
const payInterest = require('../fabric_network/sdk/javascript/serverPayInterest')
const repayLoan = require('../fabric_network/sdk/javascript/serverRepayLoan')
const serverGetTransaction = require('../fabric_network/sdk/javascript/serverGetTransaction')
const cors = require('cors');
const port = 8000;
const app = express();

app.use(express.json());
app.use(cors({
  origin: '*'
}))

app.get('/enrollall', async (req, res) => {
  console.log("enrollall hello");
  await enrollAdmin();
  await enrollAdminOrg2();
  await registerUser();
  await registerUserOrg2();
  res.send(true);
});

app.get('/checkuser', async (req, res) => {
  console.log("checkuser");
  const ret = await checkUser();
  res.send(ret)
})

app.get('/getmytransaction/:org', async (req, res) => {
  console.log("getmytransaction");
  const {org} = req.params;
  const ret = await serverGetTransaction(org, "name");
  res.send(ret)
})

app.post('/registeruser/:org', async (req, res) => {
  console.log("registeruser");
  console.log(req.body.name);
  const {name} = req.body;
  const {org} = req.params;
  console.log(org, name);
  const ret = await register(org, name);
  res.send(ret)
});

app.post('/createborrowrequest/:org', async (req, res) => {
  const {amount, months, interest} = req.body;
  const {org} = req.params;
  console.log(org);
  const ret = await createBorrowRequest(org, amount, months, interest);
  res.send(ret)
});

app.post('/approveborrowrequest/:org', async (req, res) => {
  const {borrower} = req.body;
  const {org} = req.params;
  console.log(org);
  const ret = await approveBorrowRequest(org, borrower);
  res.send(ret)
});

app.post('/mint/:org', async (req, res) => {
  const {amount} = req.body;
  const {org} = req.params;
  console.log(org);
  const ret = await mintTokens(org, amount);
  res.send(ret)
});

app.get('/getdetails/:org', async (req, res) => {
  console.log("getdetails");
  const {org} = req.params;
  console.log(org);
  const ret = await getdetails(org);
  res.send(ret)
});

app.get('/getborrowrequests/:org', async (req, res) => {
  const {org} = req.params;
  console.log(org);
  const ret = await getBorrowRequests(org);
  res.send(ret)
});

app.get('/payinterest/:org', async (req, res) => {
  const {org} = req.params;
  console.log(org);
  const ret = await payInterest(org);
  res.send(ret)
});

app.get('/repayloan/:org', async (req, res) => {
  const {org} = req.params;
  console.log(org);
  const ret = await repayLoan(org);
  res.send(ret)
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});