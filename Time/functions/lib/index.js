"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment-timezone"); //轉格式
/////////////////////////////////////////////////////////////////////////////////////
let now = new Date(); //取現在日期
let date = moment("2020-09-26T23:40:00.000Z").tz("America").format("YYYY-MM-DD HH:mm:ss"); //轉格式
//轉成台灣~~~~ 如果換成用伺服器的時間 要記得轉喔<3
/////////////////////////////////////////////////////////////////////////////////////
let set = new Date("2020-09-26 07:40:00"); //將時間設定成編碼
/////////////////////////////////////////////////////////////////////////////////////
console.log(now);
console.log(date);
console.log(set);
//# sourceMappingURL=index.js.map