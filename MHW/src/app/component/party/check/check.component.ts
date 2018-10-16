import { Component, OnInit } from '@angular/core';
import { PartyService } from '../../../service/party.service';
import { AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import { Account } from '../../../model/account';
import { Party } from '../../../model/party';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from '../../../../../node_modules/rxjs';


@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: ['./check.component.css']
})
export class CheckComponent implements OnInit {
  member1:string;
  member2:string;
  member3:string;
  member1id:string;
  member2id:string;
  member3id:string;
  partyid:string;
  party:Party;
  member:Account;
  user:Account;


  constructor(private partyService:PartyService,private afs:AngularFirestore,private afAuth:AngularFireAuth) {
    this.afAuth.authState.subscribe(user=>{
      this.afs.doc(`account/${user.uid}`).valueChanges().subscribe(usert=>{
           this.user=user;
      })
    })
    this.partyid=this.partyService.getPartyid();
    this.afs.doc(`party/${this.partyid}`).valueChanges().subscribe(party=>{
       this.party=party;

       if(this.party.member1==""){
        // console.log("yep");
         this.member1="";
         this.member1id="";
       }
       else
         this.afs.doc(`account/${this.party.member1}`).valueChanges().subscribe(user=>{
           this.member=user;
           this.member1=this.member.name;
           this.member1id=this.member.uid;
         })

       if(this.party.member2==""){
          this.member2="";
          this.member2id="";
       }
       else
          this.afs.doc(`account/${this.party.member2}`).valueChanges().subscribe(user=>{
             this.member=user;
             this.member2=this.member.name;
             this.member2id=this.member.uid;
          })
       if(this.party.member3==""){
          this.member3="";
          this.member.uid="";
       }
       else
          this.afs.doc(`account/${this.party.member3}`).valueChanges().subscribe(user=>{
            this.member=user;
            this.member3=this.member.name;
            this.member3id=this.member.uid;
          })

    })
  }

  ngOnInit() {
    
  }
  deleteMember(num:number){
    switch(num){
      case 1:
        this.party.member1="";
        break;

      case 2:
        this.party.member2="";
        break;
      
      case 3:
        this.party.member3="";
        break;
    }
    console.log(this.partyid);
    this.partyService.deleteMember(this.partyid,this.party);
  }


}
