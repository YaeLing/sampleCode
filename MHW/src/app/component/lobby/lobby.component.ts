import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Message } from '../../model/message';
import { MessageService } from '../../service/message.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  messages:Message[];
  messageSend:string;
  constructor(private messageServe:MessageService,private afAuth:AngularFireAuth) { 
    this.messageServe.getMessage().subscribe(text=>{
     // console.log(text);
      this.messages=text;
    });
  }
  sendMessage(){
    this.messageServe.sendMessage(this.messageSend);
    this.messageSend="";
  }
  ngOnInit() {
  }

}
