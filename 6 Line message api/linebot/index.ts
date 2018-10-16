import * as functions from 'firebase-functions';
import { WebhookEvent, validateSignature, Client, Message, TextMessage, ImageMessage, VideoMessage, AudioMessage, LocationMessage, TemplateMessage, StickerMessage, ImageMapMessage } from "@line/bot-sdk"

import { LINE } from "./chatbotConfig"
import * as queryString from "query-string"

const client = new Client(LINE);
/*
    webhook基本包含: header : x-line-signature 用來做 validateSignature
                    body   : events           裡面放著events object
*/
export const webhook = functions.https.onRequest((req, res) => {//全部都是從這裡頭開始 當有event的時候 會送到你設定的url
    const signature = req.headers["x-line-signature"] as string;// request header use for signature validation
    if (validateSignature(JSON.stringify(req.body), LINE.channelSecret, signature)) {//用來確認是不是真的由line傳過來的 認證用
        //JSON.stringify 是把object轉成string   而 req.body裡面是放著event object  為 body的 property所以後面才要events
        const events = req.body.events as Array<WebhookEvent>;
        events.forEach(async event => {//可能會傳不只一個event
            console.log(JSON.stringify(event, null, 4))
            eventDispatcher(event);
        });
    }
    res.sendStatus(200);//回傳通知收到了
});
/*
  events 中的property:   type: identifier for the type of event
             timestamp: time of the event in milliseconds
             source   : 看是哪個source 有 user room group 三個不同的形態 裡面放的東西也不同
                
                 user:type:user
                      userid
                group:type:group
                      groupid
                      userid
                 room:type:room
                      roomid
                      userid
*/
const eventDispatcher = (event: WebhookEvent): void => {//把 events由上面整理好的array送過來
    const userId = event.source.userId;
    switch (event.type) {//依照event的type分類
        case "follow"://有人加朋友
            replyFollowMessage(userId, event.replyToken);
            break;  
        case "join"://有人加進群
            if (event.source.type == "group")
                replyJoinMessage(event.replyToken, event.source.groupId);
            break;
        case "message"://確認 event 的 type是 message後 再 確認message的type是哪種
            if (event.message.type == "text") {
                const intent = event.message.text;
                messageDispatcher(userId, event.replyToken, intent);
            }
            break;
        case "postback"://template message回傳
            postbackDispatcher(userId, event.replyToken, event.postback.data);
            break
    }
}
/*
    message: type : message
             replyToken: 要傳回去的放這裡
             message: 裡面放著不同類型的message object

*/
const messageDispatcher = (userId: string, replyToken: string, intent: string): void => {
    switch (intent) {
        case "上課簽到":
        case "實習開始":
        case "實習結束":
        case "繳交報告":
            replyEchoMessage(replyToken, intent);
            break;
        case "??":
            pushCommandMessage(userId);
            break;
        case "!!":
            replyImageMapMessage(replyToken);
            break;
        case "confirmTemplate":
            replyConfirmMessage(replyToken);
            break;
        case "buttonsTemplate":
            replyButtonsMessage(replyToken);
            break;
        case "imageCarouselTemplate":
            replyImageCarouselMessage(replyToken);
            break;
        case "carouselTemplate":
            replyCarouselMessage(replyToken);
            break;
        default:
            replyErrorMessage(userId, replyToken, intent);
            break;
    }
}

const postbackDispatcher = (userId: string, replyToken: string, postbackData: string): void => {
    const event = queryString.parse(postbackData);
    const requestTime = new Date(parseInt(event.requestTime)).toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei' });
    const responseTime = new Date().toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei' });
    switch (event.action) {
        case "yesConfirm":
            replyStickerMessage(replyToken, "4", "293", requestTime, responseTime);
            break;
        case "noConfirm":
            replyStickerMessage(replyToken, "1", "7", requestTime, responseTime);
            break;
        case "imageButtons":
            replyImageMessage(replyToken, requestTime, responseTime);
            break;
        case "videoButtons":
            replyVideoMessage(replyToken, requestTime, responseTime);
            break;
        case "audioButtons":
            replyAudioMessage(replyToken, requestTime, responseTime);
            break;
        case "locationButtons":
            replyLocationMessage(replyToken, requestTime, responseTime);
            break;
        case "signInImageCarousel":
        case "signInCarousel":
            replyEchoMessage(replyToken, "上課簽到");
            break;
        case "reportImageCarousel":
        case "reportCarousel":
            replyEchoMessage(replyToken, "繳交報告");
            break;
        case "beginPracticeImageCarousel":
        case "beginPracticeCarousel":
            replyEchoMessage(replyToken, "實習開始");
            break;
        case "endPracticeImageCarousel":
        case "endPracticeCarousel":
            replyEchoMessage(replyToken, "實習結束");
            break;

    }
}

const replyFollowMessage = async (userId: string, replyToken: string): Promise<any> => {
    const lineMessage = {
        type: "text",
        text: `歡迎加入《智能學堂》\n${userId}\n下次我長智慧，把你繫結到學員資料庫後，就能喊出你的名字`
    } as TextMessage;
    await replyMessage(replyToken, lineMessage);
    return pushCommandMessage(userId);
}

const pushCommandMessage = (userId: string): Promise<any> => {
    const lineMessage = {
        type: "text",
        text: `《智能學堂》系統指令如下，請多利用：\n1. 上課簽到\n2. 實習開始\n3. 實習結束\n4. 繳交報告`
    } as TextMessage;
    return pushMessage(userId, lineMessage);
}

const replyJoinMessage = (replyToken: string, groupId: string): Promise<any> => {
    const lineMessage = {
        type: "text",
        text: `我是《智能學堂》\n很高興受邀加入${groupId}貴群組\n下次請你填表幫我長智慧，讓我知道這個群組的相關資料`
    } as TextMessage;
    return replyMessage(replyToken, lineMessage);
}

const replyImageMapMessage = (replyToken: string): Promise<any> => {
    const imageMapMessage = {
        type: "imagemap",
        baseUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/menuImageMap",
        altText: "This is an imagemap",
        baseSize: {
            height: 1040,
            width: 1040
        },
        actions: [
            {
                type: "message",
                text: "confirmTemplate",
                area: {
                    x: 0,
                    y: 0,
                    width: 520,
                    height: 520
                }
            },
            {
                type: "message",
                text: "buttonsTemplate",
                area: {
                    x: 520,
                    y: 0,
                    width: 520,
                    height: 520
                }
            },
            {
                type: "message",
                text: "imageCarouselTemplate",
                area: {
                    x: 0,
                    y: 520,
                    width: 520,
                    height: 520
                }
            },
            {
                type: "message",
                text: "carouselTemplate",
                area: {
                    x: 520,
                    y: 520,
                    width: 520,
                    height: 520
                }
            }
        ]
    } as ImageMapMessage;
    return replyMessage(replyToken, imageMapMessage);
}

const replyConfirmMessage = (replyToken: string): Promise<any> => {
    const requestTime = new Date().getTime();
    const confirmMessage = {
        type: "template",
        altText: "this is a confirm template",
        template: {
            type: "confirm",
            text: "智能學堂，讚？",
            actions: [
                {
                    type: "postback",
                    label: "是",
                    data: "action=yesConfirm&requestTime=" + requestTime
                },
                {
                    type: "postback",
                    label: "否",
                    data: "action=noConfirm&requestTime=" + requestTime
                }
            ]
        }
    } as TemplateMessage;
    return replyMessage(replyToken, confirmMessage);
}

const replyButtonsMessage = (replyToken: string): Promise<any> => {
    const requestTime = new Date().getTime();
    const buttonsMessage = {
        type: "template",
        altText: "This is a buttons template",
        template: {
            type: "buttons",
            thumbnailImageUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/buttons.png",
            title: "訊息類型",
            text: "請你靈活運用下列訊息類型",
            actions: [
                {
                    type: "postback",
                    label: "圖片",
                    data: "action=imageButtons&requestTime=" + requestTime
                },
                {
                    type: "postback",
                    label: "影片",
                    data: "action=videoButtons&requestTime=" + requestTime
                },
                {
                    type: "postback",
                    label: "聲音",
                    data: "action=audioButtons&requestTime=" + requestTime
                },
                {
                    type: "postback",
                    label: "地點",
                    data: "action=locationButtons&requestTime=" + requestTime
                }
            ]
        }
    } as TemplateMessage

    return replyMessage(replyToken, buttonsMessage);
}

const replyImageCarouselMessage = (replyToken: string): Promise<any> => {
    const requestTime = new Date().getTime();
    const imageCarouselMessage = {
        type: "template",
        altText: "this is a image carousel template",
        template: {
            type: "image_carousel",
            columns: [
                {
                    imageUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/signInImageCarousel.png",
                    action: {
                        type: "postback",
                        data: "action=signInImageCarousel&requestTime=" + requestTime
                    }
                },
                {
                    imageUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/reportImageCarousel.png",
                    action: {
                        type: "postback",
                        data: "action=reportImageCarousel&requestTime=" + requestTime
                    }
                },
                {
                    imageUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/beginPracticeImageCarousel.png",
                    action: {
                        type: "postback",
                        data: "action=beginPracticeImageCarousel&requestTime=" + requestTime
                    }
                },
                {
                    imageUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/endPracticeImageCarousel.png",
                    action: {
                        type: "postback",
                        data: "action=endPracticeImageCarousel&requestTime=" + requestTime
                    }
                }
            ]
        }
    } as any;
    return replyMessage(replyToken, imageCarouselMessage);
}

const replyCarouselMessage = (replyToken: string): Promise<any> => {
    const requestTime = new Date().getTime();
    const carouselMessage = {
        type: "template",
        altText: "this is a carousel template",
        template: {
            type: "carousel",
            columns: [
                {
                    thumbnailImageUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/signInImageCarousel.png",
                    imageBackgroundColor: "#FFFFFF",
                    title: "智能學堂",
                    text: "上課簽到",
                    actions: [
                        {
                            type: "postback",
                            label: "上課簽到",
                            data: "action=signInCarousel&requestTime=" + requestTime
                        }
                    ]
                },
                {
                    thumbnailImageUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/reportImageCarousel.png",
                    imageBackgroundColor: "#FFFFFF",
                    title: "智能學堂",
                    text: "繳交報告",
                    actions: [
                        {
                            type: "postback",
                            label: "繳交報告",
                            data: "action=reportCarousel&requestTime=" + requestTime
                        }
                    ]
                },
                {
                    thumbnailImageUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/beginPracticeImageCarousel.png",
                    imageBackgroundColor: "#FFFFFF",
                    title: "智能學堂",
                    text: "實習開始",
                    actions: [
                        {
                            type: "postback",
                            label: "實習開始",
                            data: "action=beginPracticeCarousel&requestTime=" + requestTime
                        }
                    ]
                },
                {
                    thumbnailImageUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/endPracticeImageCarousel.png",
                    imageBackgroundColor: "#FFFFFF",
                    title: "智能學堂",
                    text: "實習結束",
                    actions: [
                        {
                            type: "postback",
                            label: "實習結束",
                            data: "action=endPracticeCarousel&requestTime=" + requestTime
                        }
                    ]
                }
            ],
            imageAspectRatio: "rectangle",
            imageSize: "cover"
        }
    } as TemplateMessage;
    return replyMessage(replyToken, carouselMessage);
}

const replyImageMessage = (replyToken: string, requestTime: string, responseTime: string): Promise<any> => {
    const requestTimeMessage = {
        type: "text",
        text: `請求時間：${requestTime}`
    } as TextMessage;
    const imageMessage = {
        type: "image",
        originalContentUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/imageButtons.png",
        previewImageUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/imageButtons.png"
    } as ImageMessage;
    const responseTimeMessage = {
        type: "text",
        text: `回覆時間：${responseTime}`
    } as TextMessage;
    return replyMessage(replyToken, [requestTimeMessage, imageMessage, responseTimeMessage]);
}

const replyVideoMessage = (replyToken: string, requestTime: string, responseTime: string): Promise<any> => {
    const requestTimeMessage = {
        type: "text",
        text: `請求時間：${requestTime}`
    } as TextMessage;
    const videoMessage = {
        type: "video",
        originalContentUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/videoButtons.mp4",
        previewImageUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/buttons.png"
    } as VideoMessage;
    const responseTimeMessage = {
        type: "text",
        text: `回覆時間：${responseTime}`
    } as TextMessage;
    return replyMessage(replyToken, [requestTimeMessage, videoMessage, responseTimeMessage]);
}

const replyAudioMessage = (replyToken: string, requestTime: string, responseTime: string): Promise<any> => {
    const requestTimeMessage = {
        type: "text",
        text: `請求時間：${requestTime}`
    } as TextMessage;
    const audioMessage = {
        type: "audio",
        originalContentUrl: "https://storage.googleapis.com/apps-taipeitech.appspot.com/imageAudio.m4a",
        duration: 9000//只能數字
    } as AudioMessage;
    const responseTimeMessage = {
        type: "text",
        text: `回覆時間：${responseTime}`
    } as TextMessage;
    return replyMessage(replyToken, [requestTimeMessage, audioMessage, responseTimeMessage]);
}

const replyLocationMessage = (replyToken: string, requestTime: string, responseTime: string): Promise<any> => {
    const requestTimeMessage = {
        type: "text",
        text: `請求時間：${requestTime}`
    } as TextMessage;
    const locationMessage = {
        type: "location",
        title: "智能學堂地點",
        address: "106台北市大安區忠孝東路三段1號",
        latitude: 25.042251,
        longitude: 121.535459
    } as LocationMessage;
    const responseTimeMessage = {
        type: "text",
        text: `回覆時間：${responseTime}`
    } as TextMessage;
    return replyMessage(replyToken, [requestTimeMessage, locationMessage, responseTimeMessage]);
}

const replyStickerMessage = (replyToken: string, packageId: string, stickerId: string, requestTime: string, responseTime: string): Promise<any> => {
    const requestTimeMessage = {
        type: "text",
        text: `請求時間：${requestTime}`
    } as TextMessage;
    const stickerMessage = {
        type: "sticker",
        packageId: packageId,
        stickerId: stickerId
    } as StickerMessage;
    const responseTimeMessage = {
        type: "text",
        text: `回覆時間：${responseTime}`
    } as TextMessage;
    return replyMessage(replyToken, [requestTimeMessage, stickerMessage, responseTimeMessage]);
}

const replyEchoMessage = (replyToken: string, message: string): void => {
    const lineMessage = {
        type: "text",
        text: message
    } as TextMessage;
    replyMessage(replyToken, lineMessage);
}

const replyErrorMessage = async (userId: string, replyToken: string, message: string): Promise<any> => {
    const lineMessage = {
        type: "text",
        text: `你所說的.....\n${message}\n不是智能學堂的指令`
    } as TextMessage;
    await replyMessage(replyToken, lineMessage);
    return pushCommandMessage(userId);
}

const pushMessage = (userId: string, lineMessage: Message | Message[]): Promise<any> => {
    return client.pushMessage(userId, lineMessage);
}

const replyMessage = (replyToken: string, lineMessage: Message | Message[]): Promise<any> => {
    return client.replyMessage(replyToken, lineMessage);
}