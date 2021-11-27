import * as functions from 'firebase-functions';
import { firebaseAdmin, firestore } from './config';

interface IConfig {
    currentLottery: number,
    maxTicketsPerUser: number
}

export const buyTicket = functions.https.onRequest(async (request, response) => {
    const {
        walletAddress,
        ticketCount,
    } = request.body;

    if (!walletAddress || !ticketCount) {
        response.sendStatus(400);
    }

    // Get wallet reference
    const walletReference = await firestore.collection('wallets').doc(walletAddress).get();
    let walletData: any = { isActive: true, lottery: {} }

    // Verify wallet data
    if (walletReference.exists) {
        walletData = walletReference.data();
    }

    // Verify wallet status
    if (!walletData.isActive) {
        response.sendStatus(400);
    }

    // Get current lottery information
    const docSnapshot = await firestore.collection('config').doc('general').get();
    const config = docSnapshot.data() as IConfig;

    const {
        currentLottery,
        maxTicketsPerUser
    } = config;

    // Count current tickets in lottery
    const lotteryTickets: Array<any> = walletData.lottery[currentLottery] ? walletData.lottery[currentLottery].tickets : [];
    const userTotalTickets = lotteryTickets.reduce((a,b) => a + b.count);

    // Validate user total tickets
    if (userTotalTickets + ticketCount > maxTicketsPerUser) {
        response.sendStatus(400);
    }

    // Save tickets to confirm
    await firestore.collection('wallets').doc(walletAddress).set({
        lottery: {
            ...walletData.lottery,
            [currentLottery]: {
                tickets: [
                    ...lotteryTickets,
                    {
                        confirmed: false,
                        count: ticketCount,
                        created: firebaseAdmin.firestore.Timestamp.fromDate(new Date()),
                        txhash: '',
                    }
                ]
            }
        }
    }, { merge: true});



    firestore.collection
});