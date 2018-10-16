import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth'
import { Observable } from 'rxjs';
import { roomb } from '../../model/roomb';
import { room } from '../../model/room';
import { map } from 'rxjs/operators';
/**
 * Generated class for the RoomManagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-room-manage',
  templateUrl: 'room-manage.html',
})
export class RoomManagePage {
  
  user:Observable<firebase.User>;
  roomNum:room;
  BusinessSuites:roomb[];
  FamilySuites:roomb[];
  HoneymoonSuites:roomb[];
  LuxurySuites:roomb[];
  PresidentialSuites:roomb[];
  constructor(public navCtrl: NavController, public navParams: NavParams,private afs : AngularFirestore,private afAuth:AngularFireAuth ) {
     this.user=this.afAuth.authState;
     this.afs.doc('hotel/roomNum').valueChanges().subscribe(room=>{
       this.roomNum=room;
     })

     this.afs.collection('book',ref=>ref.where("roomtype","==","BusinessSuite")).snapshotChanges().pipe(map(changes=>{
       return changes.map(a=>{
         const data=a.payload.doc.data() as roomb;
         data.rid=a.payload.doc.id;
         return data;
       })
     })).subscribe(room=>{
       this.BusinessSuites=room;
     })

     this.afs.collection('book',ref=>ref.where("roomtype","==","FamilySuite")).snapshotChanges().pipe(map(changes=>{
      return changes.map(a=>{
        const data=a.payload.doc.data() as roomb;
        data.rid=a.payload.doc.id;
        return data;
      })
    })).subscribe(room=>{
      this.FamilySuites=room;
    })

    this.afs.collection('book',ref=>ref.where("roomtype","==","HoneymoonSuite")).snapshotChanges().pipe(map(changes=>{
      return changes.map(a=>{
        const data=a.payload.doc.data() as roomb;
        data.rid=a.payload.doc.id;
        return data;
      })
    })).subscribe(room=>{
      this.HoneymoonSuites=room;
    })

    this.afs.collection('book',ref=>ref.where("roomtype","==","LuxurySuite")).snapshotChanges().pipe(map(changes=>{
      return changes.map(a=>{
        const data=a.payload.doc.data() as roomb;
        data.rid=a.payload.doc.id;
        return data;
      })
    })).subscribe(room=>{
      this.LuxurySuites=room;
    })

    this.afs.collection('book',ref=>ref.where("roomtype","==","PresidentialSuite")).snapshotChanges().pipe(map(changes=>{
      return changes.map(a=>{
        const data=a.payload.doc.data() as roomb;
        data.rid=a.payload.doc.id;
        return data;
      })
    })).subscribe(room=>{
      this.PresidentialSuites=room;
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoomManagePage');
  }
  checkOut(room:roomb){
    //console.log(room);
    let Num:number=0;
    switch(room.roomtype){
      case 'BusinessSuite':
           Num=Number(this.roomNum.BusinessSuite)+Number(room.num);
           this.afs.doc('hotel/roomNum').update({BusinessSuite:`${Num}`});
           this.afs.doc(`book/${room.rid}`).delete();
          // console.log(Num);
           break;
      case 'FamilySuite':
           Num=Number(this.roomNum.FamilySuite)+Number(room.num);
           this.afs.doc('hotel/roomNum').update({FamilySuite:`${Num}`});
           this.afs.doc(`book/${room.rid}`).delete();
          // console.log(Num);
           break;
      case 'HoneymoonSuite':
           Num=Number(this.roomNum.HoneymoonSuite)+Number(room.num);
           this.afs.doc('hotel/roomNum').update({HoneymoonSuite:`${Num}`});
           this.afs.doc(`book/${room.rid}`).delete();
          // console.log(Num);
           break;
      case 'LuxurySuite':
           Num=Number(this.roomNum.LuxurySuite)+Number(room.num);
           this.afs.doc('hotel/roomNum').update({LuxurySuite:`${Num}`});
           this.afs.doc(`book/${room.rid}`).delete();
          // console.log(Num);
           break;
      case 'PresidentialSuite':
           Num=Number(this.roomNum.PresidentialSuite)+Number(room.num);
           this.afs.doc('hotel/roomNum').update({PresidentialSuite:`${Num}`});
           this.afs.doc(`book/${room.rid}`).delete();
          // console.log(Num);
           break;

           
    }

  }
}
