import Web3 from "web3";

import sc from '../build/contracts/CryptoLand.json'

export const getWeb3 = () => {
    return new Promise((resolve, reject) => {
        window.addEventListener("load", async () => {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                try {
                    // ask user permission to access his accounts
                    await window.ethereum.request({method: "eth_requestAccounts"});
                    resolve(web3);
                } catch (error) {
                    reject(error);
                }
            } else {
                reject("must install MetaMask");
            }
        });
    });
};

export const getContract = async (web3) => {
    //const data = await $.getJSON("./contracts/CryptoLand.json");

    const netId = await web3.eth.net.getId();
    const deployedNetwork = sc.networks[netId];
    const greeting = new web3.eth.Contract(
            sc.abi,
            deployedNetwork && deployedNetwork.address
            );
    return greeting;
};
