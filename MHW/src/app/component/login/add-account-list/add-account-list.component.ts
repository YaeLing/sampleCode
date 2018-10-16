import { Component, OnInit } from '@angular/core';
import { Account } from '../../../model/account';
import { AccountService } from '../../../service/account.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-account-list',
  templateUrl: './add-account-list.component.html',
  styleUrls: ['./add-account-list.component.css']
})
export class AddAccountListComponent implements OnInit {
  user:Observable<firebase.User>;
  listState:boolean=false;
  constructor(private accountService:AccountService,private afAuth:AngularFireAuth) {
    this.user=this.afAuth.authState;
   }
  account:Account={
    name:'',
    phone:'',
    lineid:'',
    manage:'User',
    party:""
  }
  ngOnInit() {
  }
  onSubmit(){
      this.user.subscribe(user=>{
        if(user){
          this.account.uid=user.uid;
          this.accountService.createList(this.account);
          this.listState=true;
        }
        else{
          console.log("not login");
        }
      })
      
  }
}
