# CryptoLand

CryptoLand is a DApp to create a market of virtual property based on Ethereum blockchain and IPFS.

## Installation

Install node.js using the official repository (removing the default installed nodejs in your distro)
See there reference guide on how to install nodejs here: https://nodejs.org/en/download/package-manager/
Clone the GIT repository from GITHUB:

```bash
$ git clone https://github.com/alexroat/CryptoLand.git
```

Install all the dependencies
```bash
$ npm install
```

Run the local testnet (ganache-cli), in a separate shell type:
```bash
$ npm run start-testnet
```

You will get a list of wallet and secrets with a default credit of 100ETH each.
The account will be the same after a restart due to a common seed: ciao (hi in italian).

```
Available Accounts
==================
(0) 0xe7640bd3946d5c77138CBd2EEE79E1Baa1f2B637 (100 ETH)
(1) 0x8B9a520d4862dF6c58eC51A4FAd3951A5Fc73288 (100 ETH)
(2) 0xB5421fC96E0dfE5A952129C62eC99eac8E03b4be (100 ETH)
(3) 0x3677F0132c3dC1bD97196f53E47df65A7D925b70 (100 ETH)
(4) 0xeFD3c38226d8E5D1F5DfDbCd8E7495bd3EBB200F (100 ETH)
(5) 0x7f6E3F0cBEBB5A5492D1Ed9525FBF7B3E2a14193 (100 ETH)
(6) 0x28381C3935b9D206718F99d273AE1C82cD546eC2 (100 ETH)
(7) 0x0004BFD52Bd4ec7743c76d8477Be8B51F736439c (100 ETH)
(8) 0x9719550f3b6c185444C1285BfA3e6c463E44D03B (100 ETH)
(9) 0xFf17Bc65b8A62F017eB9f36ea2f8c0b227E02c19 (100 ETH)

Private Keys
==================
(0) 0x184e06f65eebb4a27024851d1b654743d7846c7a64c7837fd5cb87f69660bb81
(1) 0x09bc6f1cfcd09bd807046dda22f2f0ffda2b4d70659e72d294c5f68a0c56f1c4
(2) 0x00e730b831befa949107215eb8a1fd94a3fb206e9201561e5e1c75e56ffa353e
(3) 0xdc37a27bf951c60c4f5e8353676071df943d991f33321b47c463ed0d66b7c315
(4) 0x573f56e3c5cadba3376ccf03b86380dc7e1318c766eded3618b96ff5f65c4c15
(5) 0x9965a20e44ad19efc0c7b77a90bf73f48b8ed61da8158684ed6a564c0a5b4f23
(6) 0xa9b2c84e41f3827d1d42cab1e87926da5c66bb1241a1400374d910889ee475d2
(7) 0x2795ec96cb1aab1a265d944332d2e3c7f18bdc9cc40337eed47f4972bed9b767
(8) 0x3d6cf4c5ff74d3bb955a9cef41628b75ad7b1605de77bedb44caf464af372f68
(9) 0xc0e4b6ed69a000d918b33a8fe706e6cbc2aba2bf5ecbcfd85600c9fc9ccc700c
```

Important: The local testnet will listen for RPC on port 8545.

Install the Metamask extension: https://metamask.io/ or you can install directly from chrome extension store: https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn

Follow the guide/wizard to create a new Metamask account with secret phrase and password (don't loose them, keep them in a secret place).

Add the local testnet RPC to Metamask following this guide: https://www.trufflesuite.com/docs/truffle/getting-started/truffle-with-metamask


Import one or more account from above in metamask using the private keys above: https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-Account

Compile/Deploy/Migrate the smart contract into the testnet
```bash
$ npm run migrate-sc
```

Build the frontend (webpack):
```bash
$ npm run build-fe
```


Start the server :
```bash
$ npm run start
```

Your browser (chrome) will open on page http://localhost:3000/ showing you the UI of the Cryptoland DApp


** note: in case of error could be useful to do a re-import or a reset of the Metamask wallet
You can recognise the case from message in chrome console ("the tx doesn't have the correct nonce. account has nonce of")
This happens when you kill and restart the testnet and redeploy the contract but using an out of sync wallet.
you can find some useful info here: https://ethereum.stackexchange.com/a/45304
You can fix it quickly doing going to Metamask options-> Advanced->Resume accounts


## Working with ROPSTEN testnet
For an overvew see this guide here:

https://medium.com/coinmonks/5-minute-guide-to-deploying-smart-contracts-with-truffle-and-ropsten-b3e30d5ee1e

Create a ropsten wallet in metamask

Go to this faucet istance and "buy" some test ether posting you wallet address in your account.
https://faucet.ropsten.be/

After a while you should see the test ether appearing in your test wallet balance.

Create an account in Infura

Create a new (free) project in Infura, call it CryptoEarth

Copy the PROJECT_ID that is you API KEY

Test the Infura RPC with curl
```bash
curl https://mainnet.infura.io/v3/PROJECT_ID -X POST -H "Content-Type:application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":74}'
```

(replace PROJECT_ID with the correct ROPSTEN project ID from Infura project dashboard)

You should get an answer like

```
{"jsonrpc":"2.0","id":74,"result":"0x#######"}
```


store the Infura Api Key in an enviromental variable (it is the PROJECT_ID)
store the Metamask wallet in an environmental variable (it is the 12 word secret of you Metamask wallet)
```
export ROPSTEN_APIKEY=################################
export ROPSTEN_MNEMONIC="#### #### #### #### #### #### #### #### #### #### #### ####"
```

Migrate the contract to Ropsten testnet with the npm script
```bash
npm run migrate-sc-ropsten
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.


## License
[MIT](https://choosealicense.com/licenses/mit/)
