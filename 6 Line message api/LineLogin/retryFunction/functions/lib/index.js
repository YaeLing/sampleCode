"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const axios_1 = require("axios");
const querystring = require("querystring");
const cors = require('cors')({
    origin: true
});
exports.lineLogin = functions.https.onRequest((req, res) => {
    const code = req.body.code;
    let body = {
        'grant_type': "authorization_code",
        'code': code,
        'redirect_uri': 'http://localhost:4200',
        'client_id': "1609787859",
        'client_secret': "abee3ca762beab7736f3caf70a8a1927"
    };
    cors(req, res, () => {
        axios_1.default.post('https://api.line.me/oauth2/v2.1/token', querystring.stringify(body), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
            .then(data => {
            const accessToken = data.data.access_token;
            const sendBody = "";
            axios_1.default.get('https://api.line.me/v2/profile', { headers: { 'Authorization': `Bearer ${accessToken}` } })
                .then(userData => {
                const userId = JSON.stringify(userData.data.userId);
                res.status(200).send(userId);
            })
                .catch(err => {
                console.log(err);
                res.status(200).send(err);
            });
            //res.sendStatus(200);
        })
            .catch(function (err) {
            console.log("err:" + err);
            res.status(200).send(err);
        });
    });
});
//# sourceMappingURL=index.js.map