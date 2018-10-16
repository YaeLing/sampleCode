import * as functions from 'firebase-functions';

export function helloWorld(){
    return 'helloWorld';
}
/*
模組安裝:
    npm install mocha chai --save-dev
    npm install @types/mocha @types/chai --save-dev
設定途徑:
    在package.json的script中可以自定義指令，新增test的指令 把mocha後面的途徑指向lib的test檔案內

*/