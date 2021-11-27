
import admin from 'firebase-admin';
import { cert } from './serviceAccount';

admin.initializeApp({
    credential: admin.credential.cert(cert),
    databaseURL: 'https://midaily-lottery.firebaseio.com'
});

export const firestore = admin.firestore();
export const firebaseAdmin = admin;
export const contractAddress = '0x1659fFb2d40DfB1671Ac226A0D9Dcc95A774521A';