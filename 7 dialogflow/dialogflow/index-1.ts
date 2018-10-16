import * as functions from 'firebase-functions';
import * as NodeCache from "node-cache"
import { WebhookEvent, validateSignature, Client, Message, TextMessage, } from "@line/bot-sdk"

import { LINE } from "./chatbotConfig"
import { AttendRecord, PracticeRecord, ReportRecord } from "./model"

const client = new Client(LINE);
const chatbotCache = new NodeCache({ checkperiod: 0 })

export const webhook = functions.https.onRequest((req, res) => {
    const signature = req.headers["x-line-signature"] as string;
    if (validateSignature(JSON.stringify(req.body), LINE.channelSecret, signature)) {
        const events = req.body.events as Array<WebhookEvent>;
        events.forEach(async event => {
            console.log(JSON.stringify(event, null, 4))
            eventDispatcher(event);
        });
    }
    res.sendStatus(200);
});

const eventDispatcher = (event: WebhookEvent): void => {
    const userId = event.source.userId;
    switch (event.type) {
        case "message":
            if (event.message.type == "text") {
                const intent = event.message.text;
                messageDispatcher(userId, event.replyToken, intent);
            }
            break;
    }
}

const messageDispatcher = (userId: string, replyToken: string, intent: string): void => {
    switch (intent) {
        case "上課簽到":
            attendClass(userId)
            break
        case "實習開始":
            beginPractice(userId)
            break
        case "實習結束":
            endPractice(userId)
            break
        case "繳交報告":
            submittedReport(userId);
            break
        default:
            replyErrorMessage(userId, replyToken, intent);
            break
    }
}

const attendClass = (userId: string): void => {
    const attendRecord = chatbotCache.get<AttendRecord[]>(userId + "AttendRecord")
    const now = new Date()
    const newAttendRecord: AttendRecord = { timeStamp: now.getTime() }
    if (attendRecord) {
        attendRecord.push(newAttendRecord)
        chatbotCache.set<AttendRecord[]>(userId + "AttendRecord", attendRecord)
    } else
        chatbotCache.set<AttendRecord[]>(userId + "AttendRecord", [newAttendRecord])
    const attendTime = now.toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei" });
    const attendCount = attendRecord ? attendRecord.length : 1
    const lineMessage: TextMessage = {
        type: "text",
        text: `簽到成功\n\n簽到時間：${attendTime}\n簽到次數：${attendCount}`
    }
    pushMessage(userId, lineMessage)
}

const beginPractice = (userId: string): void => {
    const practiceRecord = chatbotCache.get<PracticeRecord[]>(userId + "PracticeRecord")
    const now = new Date()
    const newPracticeRecord: PracticeRecord = {
        state: 1,
        beginTime: now.getTime(),
        endTime: null,
        practiceTime: null,
        remindCounter: 0
    }
    if (practiceRecord) {
        practiceRecord.push(newPracticeRecord)
        chatbotCache.set<PracticeRecord[]>(userId + "PracticeRecord", practiceRecord)
    } else
        chatbotCache.set<PracticeRecord[]>(userId + "PracticeRecord", [newPracticeRecord])
    const beginTime = now.toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei" });
    const lineMessage: TextMessage = {
        type: "text",
        text: `實習開始\n\n開始時間：${beginTime}`
    }
    pushMessage(userId, lineMessage)
}

const endPractice = (userId: string): void => {
    let practiceRecord = chatbotCache.get<PracticeRecord[]>(userId + "PracticeRecord")
    updatePraticeRecord(userId)
}

const submittedReport = (userId: string) => {
    let reportRecord = chatbotCache.get<ReportRecord[]>(userId + "ReportRecord")
    const now = new Date()
    const newReportRecord = { timeStamp: now.getTime() }
    if (reportRecord) {
        reportRecord.push(newReportRecord)
        chatbotCache.set<ReportRecord[]>(userId + "ReportRecord", reportRecord)
    } else
        chatbotCache.set<ReportRecord[]>(userId + "ReportRecord", [newReportRecord])
    const submitTime = now.toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei" })
    const submitCount = reportRecord ? reportRecord.length : 1
    const lineMessage: TextMessage = {
        type: "text",
        text: `繳交報告\n\n繳交時間：${submitTime}\n繳交次數：${submitCount}`
    }
    pushMessage(userId, lineMessage)

}

const updatePraticeRecord = (userId: string): void => {
    let practiceRecord = chatbotCache.get<PracticeRecord[]>(userId + "PracticeRecord")
    const now = new Date()
    const beginTime = practiceRecord[practiceRecord.length - 1].beginTime
    practiceRecord[practiceRecord.length - 1].state = 0
    practiceRecord[practiceRecord.length - 1].endTime = now.getTime()
    practiceRecord[practiceRecord.length - 1].practiceTime = now.getTime() - beginTime
    chatbotCache.set<PracticeRecord[]>(userId + "PracticeRecord", practiceRecord)

    let totalPracticeTime = 0
    for (const record of practiceRecord) {
        if (record.state === 0)
            totalPracticeTime += record.practiceTime
    }

    const lineMessage: TextMessage = {
        type: "text",
        text: `實習結束\n\n` +
            `實習次數：${practiceRecord.length}\n\n` +
            `開始時間：${new Date(beginTime).toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei" })}\n` +
            `結束時間：${now.toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei" })}\n\n` +
            `本次實習：${calculateDuration(now.getTime() - beginTime)}\n` +
            `累計時間：${calculateDuration(totalPracticeTime)}`
    }
    pushMessage(userId, lineMessage)

}

const calculateDuration = (duration: number): string => {
    const hours = Math.floor(duration / (60 * 60 * 1000))
    const minutes = Math.floor((duration - hours * (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((duration - hours * (60 * 60 * 1000) - minutes * (60 * 1000)) / 1000)
    return `${hours}:${minutes}:${seconds}`
}


const pushCommandMessage = (userId: string): Promise<any> => {
    const lineMessage = {
        type: "text",
        text: `《智能學堂》系統指令如下，請多利用：\n1. 上課簽到\n2. 實習開始\n3. 實習結束\n4. 繳交報告`
    } as TextMessage;
    return pushMessage(userId, lineMessage);
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