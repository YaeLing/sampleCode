import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { room } from '../../model/room';
import { Observable } from 'rxjs';
/**
 * Generated class for the RoomInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-room-info',
  templateUrl: 'room-info.html',
})
export class RoomInfoPage {
  room:room={
    BusinessSuite:"",
    FamilySuite:"",
    PresidentialSuite:"",
    HoneymoonSuite:"",
    LuxurySuite:""
  }
  user:Observable<firebase.User>
  editState=false;
  constructor(public navCtrl: NavController, public navParams: NavParams,private afs:AngularFirestore,private afAuth:AngularFireAuth) {
     this.user=this.afAuth.authState;
     this.afs.doc('hotel/roomInfo').valueChanges().subscribe(room=>{
       this.room=room;
       //console.log(this.room);
     })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoomInfoPage');
  }
  edit(){
    this.editState=true;
  }
  onSubmit(){
    this.afs.doc('hotel/roomInfo').update(this.room);
    this.editState=false
  }

}
