import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AccountService } from '../../service/account.service';
import { Account } from '../../model/account';
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  account:Account;
  editState:boolean=false;
  constructor(private afAuth:AngularFireAuth,private accountService:AccountService) {
       this.afAuth.authState.subscribe(user=>{
         if(user){
           this.accountService.getList(user.uid).subscribe(data=>{
             this.account=data;
       //      console.log(this.account);
           })
         }

       })
   }
   editAccount(){
     this.editState=true;
     //console.log("editName");
   }
   onSubmit(){
     this.accountService.updateList(this.account);
     this.editState=false;
   }

  ngOnInit() {
  }


}
