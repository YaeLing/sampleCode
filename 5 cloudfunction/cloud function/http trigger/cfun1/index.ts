import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
 export const getBostonWeather = functions.https.onRequest((request, response) => {
   //////////////////////////////////////////////////////////////////////////////////////////////////  
   const promise= admin.firestore().doc ('cities-weather/boston-ma-us').get();
   const p2 = promise.then(snapshot=>{  //用promise將會回傳結果 是或者是否 因此必須使用catch回抓結果
       const data =snapshot.data();
       response.send(data);
   })
   p2.catch(error=>{
       //handle error
       console.log(error);
       response.status(500).send(error);
   })

   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   admin.firestore().doc('cities-weather/boston-ma-us').get()  //簡化後
   .then(snapshot=>{
       const data =snapshot.data();
       response.send(data);
   })
   .catch(error=>{
       console.log(error);
       response.status(500).send(error);
   })
   //////////////////////////////////////////////////////////////////////////////////////////////////////////

   /* Rules of cloud function  如何結束cloud function   !!切忌絕對不能將Promise閒置
     1. Http triggers: send a response at the end
     2.Background triggers :return a promise 
     */
 });
