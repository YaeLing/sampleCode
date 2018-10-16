import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from "rxjs";
import { Party } from '../model/party';
import { Account } from '../model/account';
import { map } from 'rxjs/operators';
import { TouchSequence } from '../../../node_modules/@types/selenium-webdriver';
@Injectable({
  providedIn: 'root'
})
export class PartyService {
  partys:Observable<Party[]>;
  party:Party;
  partyid:string;//check用
  user1:Account;
  user2:Account;
  user3:Account;
  mem1:string;
  mem2:string;
  mem3:string;
  constructor(private afs:AngularFirestore) { 
    this.partys=this.afs.collection('party').valueChanges();
  }
  getParty(){
    return this.partys;
  }
  createParty(user:Account,monster:string){
    this.party={
       leaderid:user.uid,
       leadername:user.name,
       monster:monster,
       member1:"",
       member2:"",
       member3:""

    }
    this.afs.doc(`party/${user.uid}`).set(this.party);

  }
  deleteParty(partyid:string){
    this.afs.doc(`party/${partyid}`).delete();

  }

  checkParty(partyid:string){
    this.partyid=partyid;
   // console.log('partyid:'+partyid);
  }
  getPartyid(){
   return this.partyid;
  }
  
  addParty(num:number,userid:string,partyid:string){
      this.afs.doc(`party/${partyid}`).valueChanges().subscribe(party=>{
        this.party=party;
        switch(num){
          case 1:
            this.party.member1=userid;
            break;
          case 2:
            this.party.member2=userid;
            break;
          case 3:
            this.party.member3=userid;
            break;
        }
        
        this.afs.doc(`party/${partyid}`).update(this.party);
      })
    
  }

  deleteMember(partyid:string,party:Party){
        this.afs.doc(`party/${partyid}`).update(party);
  }
   
}
