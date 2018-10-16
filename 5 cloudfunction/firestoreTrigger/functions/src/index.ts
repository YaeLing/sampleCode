import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
import { Client, TextMessage } from '@line/bot-sdk';
import { request } from 'https';

const lineClient = new Client({
    channelAccessToken:'s/2HGXevN+Dpctw8RqnAr0bbs2FLp0rI6gs6szG+KTWv5yQYF1iHc9r18hZO2V6hEP49GKZSTK+kRXLCZcfjVIedWlytw8k1Un/mNoFcliecuw2aAkL91TiauWWpUkrSnK6Xi7ee/yYRcmbaIVVQ0AdB04t89/1O/w1cDnyilFU=',
    channelSecret:'b445e9d5aa84ef73fa34054bf4a93dbb'
})

export const firestoreTrigger =
functions.firestore.document('testCollection/testDocument').onUpdate(change=>{
    const after = change.after.data();
    console.log(after);
    const lineMessage:TextMessage={
        type:"text",
        text:`${after.testData}`
    }
    lineClient.pushMessage('Ub4697167fa6ce60c3386d188e77df2d9',lineMessage)
    .catch(err=>{
        console.log(err);
    })

    return 0;
})

export const httpTrigger =
functions.https.onRequest((request,response)=>{
    const lineMessage:TextMessage={
        type:"text",
        text:"sub"
    }
    lineClient.pushMessage('Ub4697167fa6ce60c3386d188e77df2d9',lineMessage)
    .catch(err=>{
        console.log(err);
    })
})

export const firestoreTrigger = functions.firestore
    .document('student/{studentId}')
    .onCreate((snap, context) => {
      // Get an object representing the document
      // e.g. {'name': 'Marie', 'age': 66}
      const newValue = snap.data();

      // access a particular field as you would any JS property
      const name = newValue.name;

      // perform desired operations ...
    });