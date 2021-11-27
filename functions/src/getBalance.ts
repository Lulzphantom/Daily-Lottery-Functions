import * as functions from 'firebase-functions';
import ERC20Abi from './ERC20.json';
import { providers, Contract, utils, BigNumber } from 'ethers';
import { contractAddress, firebaseAdmin, firestore } from './config';


export const chronGetBalance = functions.pubsub.schedule('every 5 minutes').onRun((context) => {
    console.log('This will be run every 5 minutes!');
    return null;
});

export const httpGetBalance = functions.https.onRequest(async (request, response) => {
    try {
        const balance = await getBalance();
        response.send({balance: balance});
    } catch (error) {
        response.send(error);
    }
});

interface IConfig {
    lotteryAddress: string
}

const getBalance = async () => {
    // Get config document
    const docSnapshot = await firestore.collection('config').doc('general').get();
    const config = docSnapshot.data() as IConfig;

    // Connect provider
    const provider = new providers.JsonRpcProvider('https://rpc-mainnet.maticvigil.com/v1/ac5fbc3fd3eb660a8f50d3d1f77fca0a4d5284c5');
    const contract = new Contract(contractAddress, ERC20Abi, provider);

    // Get balance of address
    const balance: BigNumber = await contract.balanceOf(config.lotteryAddress);
    const parsedBalance = parseInt(utils.formatEther(balance));

    // Save balance in config document
    await firestore
        .collection('config')
        .doc('general')
        .set({
            balance: parsedBalance, 
            lastUpdateBalance: firebaseAdmin.firestore.Timestamp.fromDate(new Date())
        }, { merge: true });

    return parsedBalance;
}