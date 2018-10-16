import * as functions from 'firebase-functions';
import { WebhookEvent , validateSignature , Client , Message , TextMessage, TemplateMessage, FlexComponent, FlexMessage } from '@line/bot-sdk';
import * as admin from 'firebase-admin';
admin.initializeApp();

import { LINE } from './chatbotConfig';


const lineClient = new Client({
    channelSecret:LINE.channelSecret,
    channelAccessToken:LINE.channelAccessToken
})

export const webhook = functions.https.onRequest((request,response)=>{
    const signature = request.headers["x-line-signature"] as string;
    if (validateSignature(JSON.stringify(request.body),LINE.channelSecret,signature)){
        const events=request.body.events as Array<WebhookEvent>
        events.forEach(event=>eventDispatcher(event))
    }
    response.sendStatus(200);
});

const eventDispatcher=(event : WebhookEvent) : void =>{
    switch(event.type){
        case "follow":
              replyFollowMessage(event.replyToken);
              break;
        case "message":
              if(event.message.type==="text")
                  messageDispatcher(event.replyToken,event.message.text);
                  break;
                  
        default:
              break;
    }
}

const replyFollowMessage = async(replyToken:string): Promise<any>=>{
     const lineMessage : TextMessage = {
         type : "text",
         text : `歡迎使用 花園飯店專用Line`
     }
     await replyMessage(replyToken,lineMessage);
     return pushMessage(replyToken,lineMessage);
}

const messageDispatcher = (replyToken:string,intent:string) : void=>{
      switch(intent)
      {
         case "聯絡資訊":
               replyHotelInfoMessage(replyToken,intent);
               break;
         case "剩餘房間":
         case "豪華套房":
         case "家庭套房":
         case "總統套房":
         case "商業套房":
         case "蜜月套房":
               replyRoomNumMessage(replyToken,intent);
               break;     
         case "房型介紹":
               replyRoomInfoMessage(replyToken,intent); 
               break;
         case "豪華套房詳細":
         case "家庭套房詳細":
         case "總統套房詳細":
         case "商業套房詳細":
         case "蜜月套房詳細":
               replyRoomDetailMessage(replyToken,intent);      
               break;   
               /*
         case "豪華套房價格":
         case "家庭套房價格":  
         case "總統套房價格":  
         case "蜜月套房價格":  
         case "商業套房價格":     
               replyRoomPriceMessage(replyToken,intent);
               break;   
               */
         default:
               replyErrorMessage(replyToken,intent);
               break;
      }
}

const replyHotelInfoMessage = (replyToken:string,intent:string):void =>{
    
     admin.firestore().doc(`hotel/hotelid`).get()
     .then(snapshot=>{
         const data= snapshot.data();     
         const lineMessage:TextMessage={
          type:"text",
          text:`名稱:${data.name}\n電話:${data.phone}\n 地址:${data.address}\n Email:${data.email}\n`
      }
      replyMessage(replyToken,lineMessage);
     })
     .catch(error=>{
         console.log("this.error:"+error);
     })
}

const replyRoomNumMessage = (replyToken:string,intent:string) :void =>{
    if(intent=="剩餘房間"){
        const lineMessage:TextMessage={
              type:"text",
              text:"請選擇要查詢的房間類型",
              quickReply:{
                  items:[
                    {
                         type:"action",
                         action:{
                         type:"message",
                         label:"豪華套房",
                         text:"豪華套房"
                    }
                },

                {
                    type:"action",
                    action:{
                        type:"message",
                        label:"家庭套房",
                        text:"家庭套房"
                    }
                },

                {
                    type:"action",
                    action:{
                        type:"message",
                        label:"總統套房",
                        text:"總統套房"
                    }
                },

                {
                    type:"action",
                    action:{
                        type:"message",
                        label:"商業套房",
                        text:"商業套房"
                    }
                },

                {
                    type:"action",
                    action:{
                        type:"message",
                        label:"蜜月套房",
                        text:"蜜月套房"
                    }
                }
            ]
        }
    }
    replyMessage(replyToken,lineMessage);
   }
   else
    {
        admin.firestore().doc(`hotel/roomNum`).get()
        .then(snapshot=>{
            const data=snapshot.data();
            switch(intent){
                case "豪華套房":
                      const lineMessage:TextMessage={
                          type:"text",
                          text:`目前豪華套房剩下 ${data.LuxurySuite} 間`
                      }
                      replyMessage(replyToken,lineMessage)
                      break;
                case "家庭套房":
                       const lineMessage1:TextMessage={
                          type:"text",
                          text:`目前家庭套房剩下 ${data.FamilySuite} 間`
                       }
                       replyMessage(replyToken,lineMessage1);
                       break;
                case "總統套房":
                       const lineMessage2:TextMessage={
                          type:"text",
                          text:`目前總統套房剩下 ${data.PresidentialSuite} 間`
                       }
                       replyMessage(replyToken,lineMessage2);
                       break;
                case "商業套房":
                       const lineMessage3:TextMessage={
                          type:"text",
                          text:`目前商業套房剩下 ${data.BusinessSuite} 間`
                       }
                       replyMessage(replyToken,lineMessage3);
                       break;
                case "蜜月套房":
                       const lineMessage4:TextMessage={
                          type:"text",
                          text:`目前蜜月套房剩下 ${data.HoneymoonSuite} 間`
                       }
                       replyMessage(replyToken,lineMessage4);
                       break;

            }
        })
    }
    
}

const replyRoomInfoMessage = (replyToken:string,intent:string) :void =>{
      admin.firestore().doc('hotel/roomPrice').get().then(snapshot=>{
        const price=snapshot.data();
        const roomInfo={
            type:"template",
            altText:"roomInfo",
            template:{
                type:"carousel",
                columns:[
                    {
                        thumbnailImageUrl:"https://firebasestorage.googleapis.com/v0/b/hiimbooboochacha.appspot.com/o/%E5%95%86%E6%A5%AD%E5%A5%97%E6%88%BF.jpg?alt=media&token=4f05f0d8-b539-4781-9aa6-f7d64dc2d4f2",
                        text:`商業套房   ${price.BusinessSuite}/日`,
                        actions:[
                        {
                            type:"message",
                            label:"詳細介紹",
                            text:"商業套房詳細"
                        },
                        {
                            type:"message",
                            label:"剩餘房間",
                            text:"商業套房"
                        },
                      
                      ]
                    },
                    {
                        thumbnailImageUrl:"https://firebasestorage.googleapis.com/v0/b/hiimbooboochacha.appspot.com/o/%E5%AE%B6%E5%BA%AD%E5%A5%97%E6%88%BF.jpg?alt=media&token=9d1699c4-4238-468f-ab3e-9009d0a186f2",
                        text:`家庭套房   ${price.FamilySuite}/日}`,
                        actions:[
                            {
                                type:"message",
                                label:"詳細介紹",
                                text:"家庭套房詳細"
                            },
                            {
                                type:"message",
                                label:"剩餘房間",
                                text:"家庭套房"
                            },
                        
                        ]
                    },
                    {
                      thumbnailImageUrl:"https://firebasestorage.googleapis.com/v0/b/hiimbooboochacha.appspot.com/o/%E7%B8%BD%E7%B5%B1%E5%A5%97%E6%88%BF.jpg?alt=media&token=7720431f-b944-4f7a-805a-ef0e927ea20c",
                      text:`總統套房   ${price.PresidentialSuite}/日`,
                      actions:[
                      {
                          type:"message",
                          label:"詳細介紹",
                          text:"總統套房詳細"
                      },
                      {
                          type:"message",
                          label:"剩餘房間",
                          text:"總統套房"
                      },
                     
                     ]
                    },
                    {
                      thumbnailImageUrl:"https://firebasestorage.googleapis.com/v0/b/hiimbooboochacha.appspot.com/o/%E8%9C%9C%E6%9C%88%E5%A5%97%E6%88%BF.jpg?alt=media&token=279d4da5-7445-4020-a8e9-d1f17ee1f2e7",
                      text:`蜜月套房    ${price.HoneymoonSuite}/日`,
                      actions:[
                      {
                          type:"message",
                          label:"詳細介紹",
                          text:"蜜月套房詳細"
                      },
                      {
                          type:"message",
                          label:"剩餘房間",
                          text:"蜜月套房"
                      },
                     
                     ]
                    },
                    {
                      thumbnailImageUrl:"https://firebasestorage.googleapis.com/v0/b/hiimbooboochacha.appspot.com/o/%E8%B1%AA%E8%8F%AF%E5%A5%97%E6%88%BF.jpg?alt=media&token=9175fe14-a511-499b-ad20-bcbf3ee8cb54",
                      text:`豪華套房   ${price.LuxurySuite}/日`,
                      actions:[
                      {
                          type:"message",
                          label:"詳細介紹",
                          text:"豪華套房詳細"
                      },
                      {
                          type:"message",
                          label:"剩餘房間",
                          text:"豪華套房"
                      },
                     
                     ]
                    },
                  
                ]
            }
        }as any;   
        replyMessage(replyToken,roomInfo);
      })
      
   
}

const replyErrorMessage = (replyToken:string,intent:string):void=>{
      const lineMessage:TextMessage={
          type:"text",
          text:`沒有${intent}的服務，請使用下面的按鍵`
      }
      replyMessage(replyToken,lineMessage);
}

const replyRoomDetailMessage=(replyToken:string,intent:string):void=>{
      switch(intent){
        case "豪華套房詳細":
             admin.firestore().doc(`hotel/roomInfo`).get()
             .then(snapshot=>{
             const data= snapshot.data();     
             const lineMessage:TextMessage={
             type:"text",
             text:`${data.LuxurySuite}`
             }
             replyMessage(replyToken,lineMessage);
             })
             .catch(error=>{
                 console.log("this.error:"+error);
             })
             break;

        case "家庭套房詳細":
              admin.firestore().doc(`hotel/roomInfo`).get()
              .then(snapshot=>{
              const data= snapshot.data();     
              const lineMessage:TextMessage={
              type:"text",
              text:`${data.FamilySuite}`
              }
              replyMessage(replyToken,lineMessage);
              })
              .catch(error=>{
                  console.log("this.error:"+error);
              })
              break;
        
        case "總統套房詳細":
              admin.firestore().doc(`hotel/roomInfo`).get()
              .then(snapshot=>{
              const data= snapshot.data();     
              const lineMessage:TextMessage={
              type:"text",
              text:`${data.PresidentialSuite}`
              }
              replyMessage(replyToken,lineMessage);
              })
              .catch(error=>{
                     console.log("this.error:"+error);
              })
              break;
        case "商業套房詳細":
              admin.firestore().doc(`hotel/roomInfo`).get()
              .then(snapshot=>{
              const data= snapshot.data();     
              const lineMessage:TextMessage={
              type:"text",
              text:`${data.BusinessSuite}`
              }
              replyMessage(replyToken,lineMessage);
              })
              .catch(error=>{
                     console.log("this.error:"+error);
              })
              break;
        case "蜜月套房詳細":
              admin.firestore().doc(`hotel/roomInfo`).get()
              .then(snapshot=>{
              const data= snapshot.data();     
              const lineMessage:TextMessage={
              type:"text",
              text:`${data.HoneymoonSuite}`
              }
              replyMessage(replyToken,lineMessage);
              })
              .catch(error=>{
                    console.log("this.error:"+error);
              })
              break;
      }
}
/*
const replyRoomPriceMessage = (replyToken:string,intent:string) =>{
    switch(intent){
         case "豪華套房價格":
           admin.firestore().doc(`hotel/roomPrice`).get()
           .then(snapshot=>{
           const data= snapshot.data();     
           const lineMessage:TextMessage={
           type:"text",
           text:`豪華套房為${data.LuxurySuite}/一夜`
           }
           replyMessage(replyToken,lineMessage);
           })
           .catch(error=>{
               console.log("this.error:"+error);
           })
           break;
         case "家庭套房價格":
           admin.firestore().doc(`hotel/roomPrice`).get()
           .then(snapshot=>{
           const data= snapshot.data();     
           const lineMessage:TextMessage={
           type:"text",
           text:`家庭套房為${data.FamilySuite}/一夜`
           }
           replyMessage(replyToken,lineMessage);
           })
           .catch(error=>{
               console.log("this.error:"+error);
           })
           break;
         case "總統套房價格":  
           admin.firestore().doc(`hotel/roomPrice`).get()
           .then(snapshot=>{
           const data= snapshot.data();     
           const lineMessage:TextMessage={
           type:"text",
           text:`總統套房為${data.PresidentialSuite}/一夜`
           }
           replyMessage(replyToken,lineMessage);
           })
           .catch(error=>{
               console.log("this.error:"+error);
           })
           break;
         case "蜜月套房價格":  
           admin.firestore().doc(`hotel/roomPrice`).get()
           .then(snapshot=>{
           const data= snapshot.data();     
           const lineMessage:TextMessage={
           type:"text",
           text:`蜜月套房為${data.HoneymoonSuite}/一夜`
           }
           replyMessage(replyToken,lineMessage);
           })
           .catch(error=>{
               console.log("this.error:"+error);
           })
           break;
         case "商業套房價格": 
           admin.firestore().doc(`hotel/roomPrice`).get()
           .then(snapshot=>{
           const data= snapshot.data();     
           const lineMessage:TextMessage={
           type:"text",
           text:`商業套房為${data.BusinessSuite}/一夜`
           }
           replyMessage(replyToken,lineMessage);
           })
           .catch(error=>{
               console.log("this.error:"+error);
           })
           break;
        }

}
*/
const replyMessage = (replyToken : string, lineMessage:Message | Array<Message>):Promise<any> =>{
    return lineClient.replyMessage(replyToken,lineMessage);
}

const pushMessage = (replyToken : string , lineMessage:Message | Array<Message>):Promise<any>=>{
    return lineClient.pushMessage(replyToken,lineMessage);
}

