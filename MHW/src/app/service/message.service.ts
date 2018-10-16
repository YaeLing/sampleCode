import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase/app';
import { Message } from '../model/message';
import { Account } from '../model/account';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  message:Observable<Message[]>;
  mes:Message;
  user:Account;
  time:string;
  constructor(private afs:AngularFirestore,private afAuth:AngularFireAuth) {
    this.message=this.afs.collection('message',ref=>ref.orderBy('gjp4vm4')).valueChanges();
    this.message.subscribe(mes=>{
      console.log(mes);
    })
   }

   getMessage(){
        return this.message;
   }
   sendMessage(message:string){
    // console.log(message);
     this.afAuth.authState.subscribe(user=>{
        this.afs.doc(`account/${user.uid}`).valueChanges().subscribe(user=>{
           this.user=user;
           var d = new Date()
         
           var vMon = d.getMonth() + 1
           var vDay = d.getDate()
           var h = d.getHours(); 
           var m = d.getMinutes(); 
           var s= d.getSeconds();
           
           
         

           let gjp4vm4=(60-s)+(60-m)*100+(12-h)*10000+(30-vDay)*1000000+(12-vMon)*100000000;       
           console.log(vMon+'/'+vDay+'  '+h+':'+m+':'+s);
           this.mes={
             sender:this.user.name,
             message:message,
             time:vMon+'/'+vDay+'  '+h+':'+m+':'+s,
             gjp4vm4:gjp4vm4.toString()
           };
           
           this.afs.collection('message').add(this.mes);
        })
           
        
     })
   }
}
