/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { eventNames } = require('process');


async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('stake');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        
        // const result = await contract.evaluateTransaction('ClientAccountID');



        // const result = await contract.evaluateTransaction('getAllowance', 'x509::/OU=org1/OU=client/OU=department1/CN=appUser::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com', 'ADD1');
        // const result = await contract.evaluateTransaction('showBorrowRequests');
        // const result = await contract.evaluateTransaction('balanceOf', 'ADD2');
        const result = await contract.evaluateTransaction('getMyAccountDetails');
        // const result = await contract.evaluateTransaction('getTotalSupply');
        // const result = await contract.submitTransaction('register', 'prasang');
        // const result = await contract.submitTransaction('createBorrowRequest', '2', '1', '5', new Date(Date.now()*1000));
        // const result = await contract.submitTransaction('transferFrom', '0x0', 'x509::/OU=org1/OU=client/OU=department1/CN=appUser::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com', '30', 'ADD1');
        // const result = await contract.submitTransaction('approve', 'ADD1', '10');
        // const result = await contract.submitTransaction('repayLoan', new Date(Date.now()*1000));
        // const result = await contract.submitTransaction('payInterest', new Date(Date.now()*1000));
        // const result = await contract.submitTransaction('mint', '10');
        // const result = await contract.submitTransaction('_transfer', 'x509::/OU=org1/OU=client/OU=department1/CN=appUser::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com', 'friend', '2');
        
        // const data = result.value.data;
        // const jsonString = String.fromCharCode(result);

        // Parse the string as JSON
        // const jsonObject = JSON.parse(jsonString);

        // console.log(jsonString);
        // const retdata = JSON.parse(result);
        // const bufDataArray = retdata.data;
        // const jsonString = String.fromCharCode(...bufDataArray);
        // const jsonObject = JSON.parse(jsonString);
        console.log(JSON.parse(result.toString()));
        // console.log(result.toString());
        // console.log(`Transaction has been evaluated, result is: ${retdata.data}`);
        // console.log(retdata)
        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
