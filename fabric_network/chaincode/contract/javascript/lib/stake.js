/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');

// Define objectType names for prefix
const userPrefix = 'user';
const borrowPrefix = 'borrow';
const loanPrefix = 'loan';

// Define key names for options
const nameValue = 'MyTokens';
const symbolValue = 'MTY';
const totalSupplyValue = '0';

class Stake extends Contract {

    // Initialize Contract
    async initLedger(ctx) {
        console.log('---------- START : Initialize Ledger --------------');
        await ctx.stub.putState('name', Buffer.from(nameValue));
        await ctx.stub.putState('symbol', Buffer.from(symbolValue));
        await ctx.stub.putState('totalSupply', Buffer.from(totalSupplyValue));
        console.info('============= END : Initialize Ledger ===========');
    }

    // For restricting access bsed on roles
    async checkAccess(ctx) {
        let cid = new ClientIdentity(ctx.stub);
        console.log("cid: ", cid);
        if (!cid.assertAttributeValue('role', 'minter')) { 
            throw new Error('Not a valid user');
        }
        return true;
    }

    async isRegistered (ctx) {
        const userId = ctx.clientIdentity.getID();
        const userKey = ctx.stub.createCompositeKey(userPrefix, [userId]);
        const userBytes = await ctx.stub.getState(userKey);
        if (!userBytes || userBytes.length === 0) {
            return false;
        } else {
            return true;
        }
    }

    // getter functions
    async getTokenName(ctx) {

        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);

        const nameBytes = await ctx.stub.getState("name");

        return nameBytes.toString();
    }

    async getSymbol(ctx) {

        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);

        const symbolBytes = await ctx.stub.getState("symbol");
        return symbolBytes.toString();
    }

    async getTotalSupply(ctx) {

        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);

        const totalSupplyBytes = await ctx.stub.getState('totalSupply');
        const totalSupply = parseInt(totalSupplyBytes.toString());
        return totalSupply;
    }

    async getMyAccountDetails(ctx) {
        const userId = ctx.clientIdentity.getID();
        const userKey = ctx.stub.createCompositeKey(userPrefix, [userId]);
        const userBytes = await ctx.stub.getState(userKey);
        if (!userBytes || userBytes.length === 0) {
            return false;
        }
        const userData = JSON.parse(userBytes.toString());
        return userData;
    }

    async getAccountDetails(ctx, account) {
        const userKey = ctx.stub.createCompositeKey(userPrefix, [account]);
        const userBytes = await ctx.stub.getState(userKey);
        if (!userBytes || userBytes.length === 0) {
            throw new Error(`User not registered.`);
        }
        const userData = JSON.parse(userBytes.toString());
        return userData;
    }

    // create account for user
    async register(ctx, _name) {
        const checkUser = await this.isRegistered(ctx);
        if(checkUser){
            throw new Error(`User already registered.`);
        }

        const userId = ctx.clientIdentity.getID();
        const userData = {
            "wallet": userId,
            "balance": 0,
            "name": _name,
            "loan_amount": 0,
            "loan_from": "",
            "lent_amount": 0,
            "lent_to": ""
        }
        const userKey = ctx.stub.createCompositeKey(userPrefix, [userId]);
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(userData)));
        return userData;
    }

    async createBorrowRequest(ctx, amount, _period_in_months, _interest_rate, timestamp) {
        const checkUser = await this.isRegistered(ctx);
        if(!checkUser){
            throw new Error(`User not registered.`);
        }
        const userId = ctx.clientIdentity.getID();
        const userKey = ctx.stub.createCompositeKey(userPrefix, [userId]);
        const userBytes = await ctx.stub.getState(userKey);
        
        const userData = JSON.parse(userBytes.toString());
        console.log(userData);
        console.log(userData['lent_amount']);
        if(userData.loan_amount > 0){
            throw new Error(`User already has a pending loan.`);
        }
        const borrowKey = ctx.stub.createCompositeKey(borrowPrefix, ["borrow", userId]);
        const borrowRequestBytes = await ctx.stub.getState(borrowKey);
        if(borrowRequestBytes && borrowRequestBytes.length > 0){
            throw new Error(`User already has an open borrow request.`);
        }
        const borrowData = {
            "name": userData['name'],
            "amount": parseInt(amount),
            "borrower": userId,
            "period_in_months": parseInt(_period_in_months),
            "interest_rate": parseInt(_interest_rate)
        }
        await ctx.stub.putState(borrowKey, Buffer.from(JSON.stringify(borrowData)));
        return borrowData;
    }

    async showBorrowRequests(ctx) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey(borrowPrefix, ["borrow"]);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            console.log(res.value);
            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                await iterator.close();
                return allResults;
            }
        }
    }

    async approveBorrowRequest(ctx, borrower, timestamp) {
        let checkUser = await this.isRegistered(ctx);
        if(!checkUser){
            throw new Error(`User not registered.`);
        }

        let userId = ctx.clientIdentity.getID();
        let userKey = ctx.stub.createCompositeKey(userPrefix, [userId]);
        let userBytes = await ctx.stub.getState(userKey);
        let userData = JSON.parse(userBytes.toString());
        console.log(borrower);
        
        let borrowKey = ctx.stub.createCompositeKey(borrowPrefix, ["borrow", borrower]);
        let borrowRequestBytes = await ctx.stub.getState(borrowKey);
        console.log(borrowRequestBytes);
        if(!borrowRequestBytes || borrowRequestBytes.length === 0){
            throw new Error(`Borrow request does not exist.`);
        }
        let borrowData = JSON.parse(borrowRequestBytes.toString());
        if(borrowData.borrower !== borrower){
            throw new Error(`Borrow request does not exist.`);
        }
        borrowData = {
            ...borrowData,
            "start_time": timestamp,
        }

        let amount = borrowData.amount;

        let borrowerKey = ctx.stub.createCompositeKey(userPrefix, [borrower]);
        let borrowerBytes = await ctx.stub.getState(borrowerKey);
        let borrowerData = JSON.parse(borrowerBytes.toString());
        
        let lenderKey = ctx.stub.createCompositeKey(userPrefix, [userId]);
        let lenderBytes = await ctx.stub.getState(lenderKey);
        let lenderData = JSON.parse(lenderBytes.toString());
        if(lenderData.balance < amount){
            throw new Error(`Insufficient balance.`);
        }
        lenderData.balance = parseInt(lenderData.balance) - amount;
        borrowerData.balance = parseInt(borrowerData.balance) + amount;
        lenderData.lent_amount = parseInt(amount);
        lenderData.lent_to = borrower;
        lenderData = {
            ...lenderData,
            "transaction_key": borrower
        }
        borrowerData.loan_amount = parseInt(amount);
        borrowerData.loan_from = userId;
        borrowerData = {
            ...borrowerData,
            "transaction_key": borrower
        }
        // lenderData = {
        //     ...lenderData,
        //     lendData: borrowData,
        //     start_time: timestamp
        // }
        // borrowerData = {
        //     ...borrowerData,
        //     borrowData,
        //     start_time: timestamp
        // }

        let loanData = {
            ...borrowData,
            "lender": userId,
            "last_payment_time": timestamp
        }

        let loanKey = ctx.stub.createCompositeKey(loanPrefix, ["loan", borrower]);

        await ctx.stub.putState(loanKey, Buffer.from(JSON.stringify(loanData)));
        await ctx.stub.deleteState(borrowKey);
        await ctx.stub.putState(lenderKey, Buffer.from(JSON.stringify(lenderData)));
        await ctx.stub.putState(borrowerKey, Buffer.from(JSON.stringify(borrowerData)));
        return borrowerData;
    }

    async getMyTransaction (ctx, key) {
        const userId = ctx.clientIdentity.getID();
        const userKey = ctx.stub.createCompositeKey(userPrefix, [userId]);
        const userBytes = await ctx.stub.getState(userKey);
        if (!userBytes || userBytes.length === 0) {
            throw new Error(`User not registered.`);
        }
        const userData = JSON.parse(userBytes.toString());
        if(!userData['transaction_key']){
            throw new Error(`No transaction found.`);
        }
        const transactionKey = userData['transaction_key'];
        let keyKakey = ctx.stub.createCompositeKey(loanPrefix, ["loan", transactionKey]);
        const transactionBytes = await ctx.stub.getState(keyKakey);
        if (!transactionBytes || transactionBytes.length === 0) {
            throw new Error(`No transaction found.`);
        }
        const transactionData = JSON.parse(transactionBytes.toString());
        return transactionData;
    }

    async getAllLoanDetails(ctx) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey(loanPrefix, ["loan"]);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            console.log(res.value);
            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                await iterator.close();
                return allResults;
            }
        }
    }

    async mint(ctx, amount) {

        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);
        const checkUser = await this.isRegistered(ctx);
        if(!checkUser){
            throw new Error(`User not registered.`);
        }
        // Check minter authorization - this sample assumes Org1 is the central banker with privilege to mint new tokens
        // const clientMSPID = ctx.clientIdentity.getMSPID();
        // if (clientMSPID !== 'Org1MSP') {
        //     throw new Error('client is not authorized to mint new tokens');
        // }

        // Get ID of submitting client identity
        const minter = ctx.clientIdentity.getID();

        const amountInt = parseFloat(amount);
        if (amountInt <= 0) {
            throw new Error('mint amount must be a positive integer');
        }

        const userKey = ctx.stub.createCompositeKey(userPrefix, [minter]);
        const userBytes = await ctx.stub.getState(userKey);
        let userData = JSON.parse(userBytes.toString());
        let tmpbalance = parseFloat(userData.balance);
        userData.balance = tmpbalance + amountInt;
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(userData)));

        // Increase totalSupply
        const totalSupplyBytes = await ctx.stub.getState('totalSupply');
        let totalSupply;
        if (!totalSupplyBytes || totalSupplyBytes.length === 0) {
            console.log('Initialize the tokenSupply');
            totalSupply = 0;
        } else {
            totalSupply = parseFloat(totalSupplyBytes.toString());
        }
        totalSupply = this.add(totalSupply, amountInt);
        await ctx.stub.putState('totalSupply', Buffer.from(totalSupply.toString()));

        console.log(`minter account ${minter} balance updated`);
        return userData;
    }

    async repayLoan(ctx, timestamp) {
        let checkUser = await this.isRegistered(ctx);
        if(!checkUser){
            throw new Error(`User not registered.`);
        }
        let userId = ctx.clientIdentity.getID();
        let userKey = ctx.stub.createCompositeKey(userPrefix, [userId]);
        let userBytes = await ctx.stub.getState(userKey);
        let userData = JSON.parse(userBytes.toString());
        if(userData.loan_amount === 0){
            throw new Error(`User does not have any pending loan.`);
        }

        let loanKey = ctx.stub.createCompositeKey(loanPrefix, ["loan", userId]);
        let loanBytes = await ctx.stub.getState(loanKey);
        let loanData = JSON.parse(loanBytes.toString());

        let loan_amount = parseFloat(loanData.amount);
        let months = ((new Date(timestamp).getTime()/1000) - (new Date(loanData.last_payment_time).getTime()/1000)) / 2592000;
        let interest = loan_amount * (parseInt(loanData.interest_rate) / 100) * (months / 12);
        let total_repayment = loan_amount + interest;
        if(parseFloat(userData.balance) < total_repayment){
            return false;
        }

        let lenderKey = ctx.stub.createCompositeKey(userPrefix, [loanData.lender]);
        let lenderBytes = await ctx.stub.getState(lenderKey);
        let lenderData = JSON.parse(lenderBytes.toString());
        
        userData.balance = parseFloat(userData.balance) - total_repayment;
        lenderData.balance = parseFloat(lenderData.balance) + total_repayment;
        userData.loan_amount = 0;
        userData.loan_from = "";
        userData.transaction_key = ""
        
        lenderData.lent_amount = 0;
        lenderData.lent_to = "";
        lenderData.transaction_key = ""
        
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(userData)));
        await ctx.stub.putState(lenderKey, Buffer.from(JSON.stringify(lenderData)));
        await ctx.stub.deleteState(loanKey);
        return true;
    }

    async payInterest(ctx, timestamp) {
        let checkUser = await this.isRegistered(ctx);
        if(!checkUser){
            throw new Error(`User not registered.`);
        }

        let userId = ctx.clientIdentity.getID();
        let userKey = ctx.stub.createCompositeKey(userPrefix, [userId]);
        let userBytes = await ctx.stub.getState(userKey);
        let userData = JSON.parse(userBytes.toString());
        console.log("userData", userData);
        if(userData.loan_amount === 0){
            throw new Error(`User does not have any pending loan.`);
        }

        let loanKey = ctx.stub.createCompositeKey(loanPrefix, ["loan", userId]);
        let loanBytes = await ctx.stub.getState(loanKey);
        let loanData = JSON.parse(loanBytes.toString());
        console.log("loanData", loanData);
        let loan_amount = parseFloat(loanData.amount);
        let curr_date = (new Date(timestamp).getTime()/1000);
        let curr_date_obj = new Date(timestamp);
        console.log(typeof(timestamp));
        console.log("curr_date", curr_date);
        console.log("curr_date_obj", curr_date_obj);
        let last_payment_time = (new Date(loanData.last_payment_time).getTime()/1000);
        let months = (curr_date - last_payment_time) / 2592000;
        console.log("months: ", months);
        let interest = loan_amount * (parseInt(loanData.interest_rate) / 100) * (months / 12);
        let total_repayment = interest;
        console.log("total_repayment: ", total_repayment);
        if(parseFloat(userData.balance) < total_repayment){
            throw new Error(`Insufficient balance.`);
        }

        loanData.last_payment_time = timestamp;

        let lenderKey = ctx.stub.createCompositeKey(userPrefix, [loanData.lender]);
        let lenderBytes = await ctx.stub.getState(lenderKey);
        let lenderData = JSON.parse(lenderBytes.toString());
        console.log('lenderData:', lenderData);
        
        userData.balance = parseFloat(userData.balance) - total_repayment;

        console.log(userData.balance);
        lenderData.balance = parseFloat(lenderData.balance) + total_repayment;
        console.log(lenderData.balance);
        // lenderData.lent_amount = parseInt(lenderData.lent_amount) - total_repayment;
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(userData)));
        await ctx.stub.putState(lenderKey, Buffer.from(JSON.stringify(lenderData)));
        await ctx.stub.putState(loanKey, Buffer.from(JSON.stringify(loanData)));
        return true;
    }

    async ClientAccountID(ctx) {

        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);

        // Get ID of submitting client identity
        const clientAccountID = ctx.clientIdentity.getID();
        return clientAccountID;
    }

    // Checks that contract options have been already initialized
    async CheckInitialized(ctx){
        const nameBytes = await ctx.stub.getState('name');
        if (!nameBytes || nameBytes.length === 0) {
            throw new Error('contract options need to be set before calling any function, call Initialize() to initialize contract');
        }
    }

    add(a, b) {
        let c = a + b;
        if (a !== c - b || b !== c - a){
            throw new Error(`Math: addition overflow occurred ${a} + ${b}`);
        }
        return c;
    }

    sub(a, b) {
        let c = a - b;
        if (a !== c + b || b !== a - c){
            throw new Error(`Math: subtraction overflow occurred ${a} - ${b}`);
        }
        return c;
    }
}

module.exports = Stake;