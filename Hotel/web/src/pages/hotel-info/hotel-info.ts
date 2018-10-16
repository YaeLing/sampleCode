import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth} from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { hotel } from '../../model/hotel';
import { Observable } from 'rxjs';
/**
 * Generated class for the HotelInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-hotel-info',
  templateUrl: 'hotel-info.html',
})
export class HotelInfoPage {
  hotel:hotel={
    address:"",
    email:"",
    phone:"",
    name:""
  }
  user:Observable<firebase.User>;
  editState:boolean=false;
  constructor(public navCtrl: NavController, public navParams: NavParams,private afs:AngularFirestore,private afAuth:AngularFireAuth) {
       this.user=this.afAuth.authState;
       this.afs.doc('hotel/hotelid').valueChanges().subscribe(hotel=>{
         this.hotel=hotel;
       })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HotelInfoPage');
  }
  Edit(){
      this.editState=true;
  }
  onSubmit(){
    this.afs.doc('hotel/hotelid').update(this.hotel);
    this.editState=false;
  }
}
