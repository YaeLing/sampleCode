import { Component } from '@angular/core';
import { LINE } from '../lib/lineConfig';
import { HttpClient, HttpParams } from '../../node_modules/@angular/common/http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private http: HttpClient) {
    ////////////////////////////////////////////////////////////////////////////////////////
    //取得code
    const url = location.href;
    if (url.indexOf('?') != -1) {
      let str1 = url.split('?');
      let str2 = str1[1].split('&');
      let str3 = str2[0].split('=');
      let code = str3[1];
      ///////////////////////////////////////////////////////////////////////////////////////////
      //呼叫cloud function
      let body = new HttpParams();
      body = body.set('code', code);
      this.http.post('http://localhost:5000/airporthelper-1875e/us-central1/lineLogin', body).subscribe(data => {
        console.log(data);
      })
    }
  }
  auth() {//導引至登入網站
    let url = "https://access.line.me/oauth2/v2.1/authorize?";
    url += "response_type=code";
    url += "&client_id=" + LINE.channelId;
    url += "&redirect_uri=http://localhost:8100";
    url += "&state=abcde";
    url += "&scope=openid%20profile";
    //console.log(url);
    window.location.href = url;
  }
}
