import * as functions from "firebase-functions"
import * as NodeCache from "node-cache"
import { Client, validateSignature, WebhookEvent, Message, TextMessage, TemplateMessage } from "@line/bot-sdk"
import * as Dialogflow from "apiai"

import { LINE, DIALOGFLOW } from "./chatbotConfig"
import { AttendRecord, PracticeRecord, ReportRecord } from "./model"

const lineClient = new Client({
    channelSecret: LINE.channelSecret,
    channelAccessToken: LINE.channelAccessToken
})
const dialogflowAgent = Dialogflow(DIALOGFLOW.agentToken)
const chatbotCache = new NodeCache({ checkperiod: 0 })

export const timeConstrain = true
export const actionRemind = true
export const remindInterval = 60

export const webhook = functions.https.onRequest((req, res) => {
    const signature = req.headers["x-line-signature"] as string
    if (validateSignature(JSON.stringify(req.body), LINE.channelSecret, signature)) {
        const events = req.body.events as Array<WebhookEvent>
        events.forEach(event => eventDispatcher(event))
    }
    res.sendStatus(200)
})

const eventDispatcher = (event: WebhookEvent): void => {
    const userId = event.source.userId
    switch (event.type) {
        case "follow":
            replyFollowMessage(event.replyToken, userId)
            break
        case "join":
            if (event.source.type == "group")
                replyJoinMessage(event.replyToken, event.source.groupId)
            break
        case "message":
            if (event.message.type === "text")
                messageDispatcher(userId, event.message.text)
            break
        default:
            break
    }
}

const messageDispatcher = (userId: string, message: string): void => {
    const request = dialogflowAgent.textRequest(message, { sessionId: userId })
    request.on("response", response => actionDispatcher(userId, response.result)).end()
    request.on("error", error => console.log("Error: ", error))
}

const actionDispatcher = (userId: string, result: any): void => {
    console.log(JSON.stringify(result, null, 4))
    const action = result.action
    switch (action) {
        case "attendClass":
            attendClass(userId, result)
            break
        case "beginPractice":
            beginPractice(userId, result)
            break
        case "endPractice":
            endPractice(userId, result)
            break
        case "requestReport":
            requestReport(userId, result)
            break
        case "submittedReport":
            submittedReport(userId, result)
            break
        case "notSubmittedReport":
            notSubmittedReport(userId, result)
            break
        default:
            pushErrorMessage(userId, result)
            break
    }
    resetPracticeState(userId)
}

const attendClass = (userId: string, result: any): void => {
    const attendRecord = chatbotCache.get<AttendRecord[]>(userId + "AttendRecord")
    const responseText = result.fulfillment.messages[0].speech as string
    const parameters = result.parameters
    if (parameters.class !== "" && parameters.attend) {
        if (canAttend(userId) === "canAttend") {
            const now = new Date()
            const newAttendRecord: AttendRecord = { timeStamp: now.getTime() }
            if (attendRecord) {
                attendRecord.push(newAttendRecord)
                chatbotCache.set<AttendRecord[]>(userId + "AttendRecord", attendRecord)
            } else
                chatbotCache.set<AttendRecord[]>(userId + "AttendRecord", [newAttendRecord])
            const lineMessage: TextMessage = {
                type: "text",
                text: responseText.replace("{{attendTime}}", now.toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei" }))
                    .replace("{{attendCount}}", attendRecord ? `${attendRecord.length}` : "1")
            }
            pushMessage(userId, lineMessage)
        } else if (canAttend(userId) === "notAtTheTime") {
            const lineMessage: TextMessage = {
                type: "text",
                text: "現在不是上課時間，請於上課時間簽到"
            }
            pushMessage(userId, lineMessage)
        } else {
            const lineMessage: TextMessage[] = [
                {
                    type: "text",
                    text: "您已簽到"
                },
                {
                    type: "text",
                    text: responseText.replace("{{attendTime}}", new Date(attendRecord[attendRecord.length - 1].timeStamp).toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei" }))
                        .replace("{{attendCount}}", `${attendRecord.length}`)
                }
            ]
            pushMessage(userId, lineMessage)
        }
    } else
        pushErrorMessage(userId, result)
}

const beginPractice = (userId: string, result: any): void => {
    const practiceRecord = chatbotCache.get<PracticeRecord[]>(userId + "PracticeRecord")
    const responseText = result.fulfillment.messages[0].speech as string
    const parameters = result.parameters
    if (parameters.practice !== "" && parameters.begin !== "") {
        if (canBeginPractice(userId) === "canBeginPractice") {
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
            const lineMessage: TextMessage = {
                type: "text",
                text: responseText.replace("{{beginTime}}", now.toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei" }))
            }
            pushMessage(userId, lineMessage)
            checkPraticeState(userId)
        } else if (canBeginPractice(userId) === "practicing") {
            const lineMessage: TextMessage[] = [
                {
                    type: "text",
                    text: "您已開始實習"
                },
                {
                    type: "text",
                    text: responseText.replace("{{beginTime}}", new Date(practiceRecord[practiceRecord.length - 1].beginTime).toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei" }))
                }
            ]
            pushMessage(userId, lineMessage)
        } else {
            const lineMessage: TextMessage = {
                type: "text",
                text: "現在無法開始實習"
            }
            pushMessage(userId, lineMessage)
        }
    } else
        pushErrorMessage(userId, result)
}

const endPractice = (userId: string, result: any): void => {
    let practiceRecord = chatbotCache.get<PracticeRecord[]>(userId + "PracticeRecord")
    const parameters = result.parameters
    if (parameters.practice !== "" && parameters.end !== "") {
        if (canEndPractice(userId))
            updatePraticeRecord(userId, result)
        else {
            const lineMessage: TextMessage = {
                type: "text",
                text: "您尚未開始實習"
            }
            pushMessage(userId, lineMessage)
        }
    } else
        pushErrorMessage(userId, result)
}

const requestReport = (userId: string, result: any): void => {
    const responseText = result.fulfillment.messages[0].speech as string
    const parameters = result.parameters
    if (parameters.report !== "" && parameters.submit !== "") {
        const lineMessage: TextMessage = {
            type: "text",
            text: responseText
        }
        const confirmMessage: TemplateMessage = {
            type: "template",
            altText: "this is a confirm template",
            template: {
                type: "confirm",
                text: "上傳完畢？",
                actions: [
                    {
                        type: "message",
                        label: "是",
                        text: "是"
                    },
                    {
                        type: "message",
                        label: "否",
                        text: "否"
                    }
                ]
            }
        }
        pushMessage(userId, [lineMessage, confirmMessage])
    } else
        pushErrorMessage(userId, result)
}

const submittedReport = (userId: string, result: any) => {
    let reportRecord = chatbotCache.get<ReportRecord[]>(userId + "ReportRecord")
    const parameters = result.parameters
    if (parameters.report !== "" && parameters.submit !== "") {
        const now = new Date()
        const newReportRecord = { timeStamp: now.getTime() }
        const responseText = result.fulfillment.messages[0].speech as string
        if (reportRecord) {
            reportRecord.push(newReportRecord)
            chatbotCache.set<ReportRecord[]>(userId + "ReportRecord", reportRecord)
        } else
            chatbotCache.set<ReportRecord[]>(userId + "ReportRecord", [newReportRecord])
        const lineMessage: TextMessage = {
            type: "text",
            text: responseText.replace("{{submitTime}}", now.toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei" }))
                .replace("{{submitCount}}", reportRecord ? `${reportRecord.length}` : "1")
        }
        pushMessage(userId, lineMessage)
    } else
        pushErrorMessage(userId, result)
}

const notSubmittedReport = (userId: string, result: any) => {
    const lineMessage: TextMessage = {
        type: "text",
        text: result.fulfillment.messages[0].speech as string
    }
    pushMessage(userId, lineMessage)
}

const updatePraticeRecord = (userId: string, result?: any): void => {
    let practiceRecord = chatbotCache.get<PracticeRecord[]>(userId + "PracticeRecord")
    const now = new Date()
    const beginTime = practiceRecord[practiceRecord.length - 1].beginTime
    practiceRecord[practiceRecord.length - 1].state = 0
    practiceRecord[practiceRecord.length - 1].remindCounter = 3
    practiceRecord[practiceRecord.length - 1].endTime = now.getTime()
    practiceRecord[practiceRecord.length - 1].practiceTime = now.getTime() - beginTime
    chatbotCache.set<PracticeRecord[]>(userId + "PracticeRecord", practiceRecord)

    let totalPracticeTime = 0
    for (const record of practiceRecord) {
        if (record.state === 0)
            totalPracticeTime += record.practiceTime
    }
    if (result) {
        const responseText = result.fulfillment.messages[0].speech as string
        const lineMessage: TextMessage = {
            type: "text",
            text: responseText.replace("{{practiceCount}}", `${practiceRecord.length}`)
                .replace("{{beginTime}}", new Date(beginTime).toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei" }))
                .replace("{{endTime}}", now.toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei" }))
                .replace("{{practiceTime}}", calculateDuration(now.getTime() - beginTime))
                .replace("{{totalPracticeTime}}", calculateDuration(totalPracticeTime))
        }
        pushMessage(userId, lineMessage)
    } else {
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
}

const canAttend = (userId: string): "canAttend" | "attended" | "notAtTheTime" => {
    const now = new Date()
    const attendRecord = chatbotCache.get<AttendRecord[]>(userId + "AttendRecord")
    if (timeConstrain) {
        if (now.getMinutes() % 10 >= 0 && now.getMinutes() % 10 < 5) {
            if (attendRecord) {
                if (now.getTime() - attendRecord[attendRecord.length - 1].timeStamp < 60 * 5 * 1000)
                    return "attended"
            }
            return "canAttend"
        }
        return "notAtTheTime"
    }
    return "canAttend"
}

const canBeginPractice = (userId: string): "canBeginPractice" | "practicing" | "notAtTheTime" => {
    const now = new Date()
    const practiceRecord = chatbotCache.get<PracticeRecord[]>(userId + "PracticeRecord")
    if (timeConstrain) {
        if (now.getMinutes() % 10 < 5 || now.getMinutes() % 10 >= 10)
            return "notAtTheTime"
    }
    if (practiceRecord) {
        if (practiceRecord[practiceRecord.length - 1].state === 1)
            return "practicing"
    }
    return "canBeginPractice"
}

const canEndPractice = (userId: string): Boolean => {
    const practiceRecord = chatbotCache.get<PracticeRecord[]>(userId + "PracticeRecord")
    if (practiceRecord)
        return practiceRecord[practiceRecord.length - 1].state === 1
    return false
}

const resetPracticeState = (userId: string): void => {
    let practiceRecord = chatbotCache.get<PracticeRecord[]>(userId + "PracticeRecord")
    if (practiceRecord) {
        if (practiceRecord[practiceRecord.length - 1].state === 1) {
            practiceRecord[practiceRecord.length - 1].remindCounter = 0
            chatbotCache.set<PracticeRecord[]>(userId + "PracticeRecord", practiceRecord)
        }
    }
}

const checkPraticeState = (userId: string): void => {
    if (actionRemind) {
        const checkPractice = setInterval(() => {
            let practiceRecord = chatbotCache.get<PracticeRecord[]>(userId + "PracticeRecord")
            if (practiceRecord[practiceRecord.length - 1].state === 1) {
                let counter = practiceRecord[practiceRecord.length - 1].remindCounter
                if (counter < 3) {
                    const lineMessage: TemplateMessage = {
                        type: "template",
                        altText: "《智能學堂》關心您",
                        template: {
                            type: "confirm",
                            text: "實習還順利嗎？",
                            actions: [
                                {
                                    type: "message",
                                    label: "實習順利",
                                    text: "實習順利"
                                },
                                {
                                    type: "message",
                                    label: "實習結束",
                                    text: "實習結束"
                                }
                            ]
                        }
                    }
                    pushMessage(userId, lineMessage)
                    counter++
                    practiceRecord[practiceRecord.length - 1].remindCounter = counter
                    chatbotCache.set<PracticeRecord[]>(userId + "PracticeRecord", practiceRecord)
                } else {
                    updatePraticeRecord(userId)
                    clearInterval(checkPractice)
                }
            } else
                clearInterval(checkPractice)
        }, remindInterval * 1000)
    }
}

const calculateDuration = (duration: number): string => {
    const hours = Math.floor(duration / (60 * 60 * 1000))
    const minutes = Math.floor((duration - hours * (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((duration - hours * (60 * 60 * 1000) - minutes * (60 * 1000)) / 1000)
    return `${hours}:${minutes}:${seconds}`
}

const replyFollowMessage = async (replyToken: string, userId): Promise<any> => {
    const lineMessage: TextMessage = {
        type: "text",
        text: `歡迎加入《智能學堂》\n${userId}\n下次我長智慧，把你繫結到學員資料庫後，就能喊出你的名字`
    }
    await replyMessage(replyToken, lineMessage)
    return pushCommandMessage(userId)
}

const pushCommandMessage = (userId: string): Promise<any> => {
    const lineMessage: TextMessage = {
        type: "text",
        text: `《智能學堂》系統指令如下，請多利用：\n1. 上課簽到\n2. 實習開始\n3. 實習結束\n4. 繳交報告`
    }
    return pushMessage(userId, lineMessage)
}

const replyJoinMessage = (replyToken: string, groupId: string): Promise<any> => {
    const lineMessage: TextMessage = {
        type: "text",
        text: `我是《智能學堂》\n很高興受邀加入${groupId}貴群組\n下次請你填表幫我長智慧，讓我知道這個群組的相關資料`
    }
    return replyMessage(replyToken, lineMessage)
}

const pushErrorMessage = (userId: string, result: any): Promise<any> => {
    const lineMessage: TextMessage = {
        type: "text",
        text: (result.fulfillment.messages[0].speech as string).replace("{{message}}", result.resolvedQuery)
    }
    return pushMessage(userId, lineMessage)
}

const replyMessage = (replyToken: string, lineMessage: Message | Array<Message>): Promise<any> => {
    return lineClient.replyMessage(replyToken, lineMessage)
}

const pushMessage = (userId: string, lineMessage: Message | Array<Message>): Promise<any> => {
    return lineClient.pushMessage(userId, lineMessage)
}