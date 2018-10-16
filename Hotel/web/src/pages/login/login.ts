import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name:'login',
  segment:'login'
})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  account:string="";
  password:string="";
  user:Observable<firebase.User>;
  constructor(public navCtrl: NavController, public navParams: NavParams,private afAuth:AngularFireAuth) {
     this.user=afAuth.authState;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }
  logForm(){
    //console.log(this.account+" "+this.password);
    this.afAuth.auth.signInWithEmailAndPassword(this.account,this.password);
  }
  logout(){
    this.afAuth.auth.signOut();
  }
}
