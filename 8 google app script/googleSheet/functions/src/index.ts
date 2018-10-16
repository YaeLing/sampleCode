import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { sheetapi } from './sheetapi';
import { client } from './client_secret';






const oauth2client = new OAuth2Client(
    client.installed.client_id,
    client.installed.client_secret,
    client.installed.redirect_uris[1]
)

oauth2client.setCredentials({
    access_token:sheetapi.access_token,
    refresh_token:sheetapi.refresh_token,
})

let sheetId = '1ObYCg02AjvBNgFnDnc66i5J1ukUK9LZ9uaSojaKPHgI';

const sheets = google.sheets("v4");



//googleapis@27
//取表單
/*
sheets.spreadsheets.values.get({
    spreadsheetId:sheetId,
    range:encodeURI('表單回應1'),
    auth:oauth2client
},function(err,result){
    if(err){
        console.log(err);
    }
    else 
        console.log(result.data)
})
*/


var h=new Date();


let values =[
    [
        h.toString(),
        "124",
        "123"
    ]
]
/*
//加新資料
sheets.spreadsheets.values.append({
    auth:oauth2client,
    spreadsheetId:sheetId,
    range:encodeURI('表單回應1'),
    insertDataOption:'INSERT_ROWS',
    valueInputOption:'RAW',
    resource:{
        "values":values
    }
},function(err,response){
    if(err){
        console.log(err);
        return;
    }
});
*/

sheets.spreadsheets.values.update({
    auth:oauth2client,
    spreadsheetId:sheetId,
    range:encodeURI('表單回應1'),
    valueInputOption:'RAW',
    resource:{
        "values":values
    }
})

