import { Component, OnInit } from '@angular/core';
import { FormsModule, EmailValidator } from '@angular/forms';
import { AccountService } from '../../service/account.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import { AddAccountListComponent } from './add-account-list/add-account-list.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email:string;
  password:string;
  noob:boolean=false;
  user:Observable<firebase.User>
  constructor(private accountService:AccountService, private afAuth:AngularFireAuth) {
      this.user=this.afAuth.authState;
   }
  

  ngOnInit() {
  }

  onSubmit(){
    this.accountService.login(this.email,this.password);
    this.email="";
    this.password="";
  }
  signup(){

    this.accountService.signup(this.email,this.password);
    this.noob =true;
    //console.log(this.noob);
    this.email="";
    this.password="";
  }

}
