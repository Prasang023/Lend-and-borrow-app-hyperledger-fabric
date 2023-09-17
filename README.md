# Lend-and-borrow-app-hyperledger-fabric

## To test the app on fabric-test-network:

### Step 1: Install Fabric and Fabric Samples

To get the install script:
```
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
```

To pull the Docker containers and clone the samples repo, run one of these commands for example:
```
./install-fabric.sh --fabric-version 2.5.0 docker samples binary
```

If facing any issues, refer to official documentation at:\
`https://hyperledger-fabric.readthedocs.io/en/latest/install.html`

### Step 2: Seting up project:

Download zip file of this repository.

Add the three folders, `client`, `backend` and `fabric_network` inside the `fabric_samples` directory cloned in the previous step.

### Step 3: Start Fabric Network:

Move to `fabric_samples` directory.

Run following commands:
```
cd ./fabric_network/chaincode/contract/javascript
npm install
cd ../../../sdk/javascript
npm install
cd ..
```

To start the Fabric Network:
```
./startFabric.sh javascript
```

### Step 4: Start Backend Server:

Move to `fabric_samples` directory.

Run following commands:
```
cd ./backend
npm install
nodemon server.js
```

### Step 5: Start Frontend:

Move to `fabric_samples` directory.

Run following commands:
```
cd ./frontend
npm install
npm start
```

### Now you are good to go.
