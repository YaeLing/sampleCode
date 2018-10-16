import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { sheetapi } from '../config/sheetapi';
import { sheetConfig } from '../config/sheetConfig';
import { client } from '../config/client_secret';
import { Student } from '../model/student';
import { Row } from '../model/data';


export class sheet {


    query(student: Student) {
        return new Promise(function (resolve, reject) {
            const sheets = google.sheets("v4");
            const oAuth2Client = new OAuth2Client(
                client.installed.client_id,
                client.installed.client_secret,
                client.installed.redirect_uris[1]
            )
            oAuth2Client.setCredentials({
                access_token: sheetapi.access_token,
                refresh_token: sheetapi.refresh_token
            })
            let data, row = 0;
            sheets.spreadsheets.values.get({
                spreadsheetId: sheetConfig.id,
                range: encodeURI(`${sheetConfig.range}!A1:B1000`),
                auth: oAuth2Client
            }, function (err, result) {
                if (err) {
                    console.log(err);
                    return err;
                }
                else {
                    data = result.data.values;
                    //  console.log(data);
                    for (let i = 0; i < data.length; i++) {
                        // console.log(data[i][1]);
                        if (data[i][1] == student.id) {
                            //   console.log(data[i][0]);
                            row = data[i][0];
                            break;
                        }
                    }
                    let pack: Row = {
                        row: row
                    }
                    resolve(pack);
                }
            })
        })
    }

    create(student: Student) {
        //console.log("create");
        const sheets = google.sheets("v4");
        const oAuth2Client = new OAuth2Client(
            client.installed.client_id,
            client.installed.client_secret,
            client.installed.redirect_uris[1]
        )
        oAuth2Client.setCredentials({
            access_token: sheetapi.access_token,
            refresh_token: sheetapi.refresh_token
        })
        sheets.spreadsheets.values.append({
            auth: oAuth2Client,
            spreadsheetId: sheetConfig.id,
            range: encodeURI(`${sheetConfig.range}`),
            insertDataOption: 'INSERT_ROWS',
            valueInputOption: 'USER_ENTERED',
            resource: {
                "values": [[
                    "=row()", student.id, student.name, student.phone, student.email
                ]]
            }
        })
    }
    update(row: number, student: Student) {

        const sheets = google.sheets("v4");
        const oAuth2Client = new OAuth2Client(
            client.installed.client_id,
            client.installed.client_secret,
            client.installed.redirect_uris[1]
        )
        oAuth2Client.setCredentials({
            access_token: sheetapi.access_token,
            refresh_token: sheetapi.refresh_token
        })
        sheets.spreadsheets.values.update({
            auth: oAuth2Client,
            spreadsheetId: sheetConfig.id,
            range: encodeURI(`${sheetConfig.range}!C${row}:E${row}`),
            valueInputOption: 'RAW',
            resource: {
                "values": [[
                    student.name, student.phone, student.email
                ]]
            }
        })
    }
}

