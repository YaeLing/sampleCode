import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  //title = 'emailauth';
  user:Observable<firebase.User>;
  constructor(public afAuth:AngularFireAuth){
    this.user=afAuth.authState;
  }


  register(email,password){
    this.afAuth.auth.createUserWithEmailAndPassword(email,password)
  }

  login(username,password){
    this.afAuth.auth.signInWithEmailAndPassword(username,password)
  }

  logout(){
    this,this.afAuth.auth.signOut();
  }
}
