import * as functions from 'firebase-functions';
import axios from 'axios';//用於http request
import * as querystring from 'querystring';//json轉x-www-form-urlencoded
const cors = require('cors')({//為了使browser不會擋
    origin: true
});

export const lineLogin = functions.https.onRequest((req, res) => {
    const code: string = req.body.code;
    let body = {//取得accessToken post 的body
        'grant_type': "authorization_code",
        'code': code,
        'redirect_uri': 'http://localhost:4200',
        'client_id': "1609787859",
        'client_secret': "abee3ca762beab7736f3caf70a8a1927"
    }
    cors(req, res, () => {
        //取 accessToken
        axios.post('https://api.line.me/oauth2/v2.1/token', querystring.stringify(body), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
            .then(data => {
                const accessToken: string = data.data.access_token;
                //取user profile
                axios.get('https://api.line.me/v2/profile', { headers: { 'Authorization': `Bearer ${accessToken}` } })
                    .then(userData => {
                        const userId = JSON.stringify(userData.data.userId);
                        res.status(200).send(userId);//回傳userId
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(200).send(err);
                    })

                //res.sendStatus(200);
            })
            .catch(function (err) {
                console.log("err:" + err);
                res.status(200).send(err);
            })
    });

})