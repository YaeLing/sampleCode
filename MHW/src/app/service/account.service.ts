import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection} from 'angularfire2/firestore';
import { Account } from '../model/account';
import { TouchSequence } from '../../../node_modules/@types/selenium-webdriver';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  user:Observable<firebase.User>;
  accountDoc:AngularFirestoreDocument<Account>;
  userid:string;
  accounts:Observable<Account[]>
  constructor(private afAuth:AngularFireAuth,private afs:AngularFirestore) {
     this.user=afAuth.authState;
    }
  login(email:string,password:string){
    this.afAuth.auth.signInWithEmailAndPassword(email,password);
  }
  signup(email:string,password:string){
    this.afAuth.auth.createUserWithEmailAndPassword(email,password);
  }
  logout(){
    this.afAuth.auth.signOut();
  }
  createList(account:Account){
     this.afs.doc(`account/${account.uid}`).set(account);
  }
  getList(userid:string){
     return this.afs.doc(`account/${userid}`).valueChanges();

  }
  updateList(account:Account){
     this.afs.doc(`account/${account.uid}`).update(account);
  }
  searchAccount(searchid:string){
    this.accounts=this.afs.collection('account',ref=>ref.where('name','==',searchid)).valueChanges();
    return this.accounts;
  }
  
}
