import { Component, OnInit } from '@angular/core';
import { Party } from '../../model/party';
import { PartyService } from '../../service/party.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import { AngularFirestore , AngularFirestoreDocument} from 'angularfire2/firestore';
import { Account } from '../../model/account';


@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.css']
})
export class PartyComponent implements OnInit {
  partys:Party[];//上傳用;
  partyJoin:Party;//join 用
  user:Account;
  deleteState:boolean=false;
  checkState:boolean=false;
  checkParty:string;
  
  
  constructor(private partyService:PartyService,private afAuth:AngularFireAuth,private afs:AngularFirestore) {
    this.partyService.getParty().subscribe(partys=>{
      this.partys=partys;
    })

    this.afAuth.authState.subscribe(user=>{
      if(user){
        this.afs.doc(`account/${user.uid}`).valueChanges().subscribe(userdetail=>{
          this.user=userdetail;
         // console.log(this.user.manage);
          if(this.user.manage=="manager")
               this.deleteState=true;
        //  console.log(this.deleteState);
        })
      }
    })
    
   }

  ngOnInit() {
  }
  createParty(monster:string){
     this.partyService.createParty(this.user,monster);
    
  }
  check(partyid:string){
    this.checkState=true;
    this.checkParty=partyid;
   // console.log(this.checkParty);
    this.partyService.checkParty(partyid);
    
  }
  delete(leaderid:string){
     this.partyService.deleteParty(leaderid);
  }
  clearState(){
    this.checkState=false;
    this.checkParty="";
  }
  joinParty(partyid:string){
    
    if(partyid!="" && partyid != this.user.uid){
       this.afs.doc(`party/${partyid}`).valueChanges().subscribe(party=>{
          this.partyJoin=party;

          ////////////////////////////////////////////判斷member1-3有沒有空位
       if(this.partyJoin.member1 != this.user.uid && this.partyJoin.member2 != this.user.uid && this.partyJoin.member1 != this.user.uid)
          {
            if(this.partyJoin.member1=="")
               this.partyService.addParty(1,this.user.uid,partyid);
            else{ 
              if(this.partyJoin.member2==""){
                this.partyService.addParty(2,this.user.uid,partyid);
              }
              else{
                if(this.partyJoin.member3==""){
                  this.partyService.addParty(3,this.user.uid,partyid);
                }
                else{
                  console.log("滿惹");
                }
              }
              }
            }

          })
          
       }
     
    }

  }

