import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { room } from '../../model/room';
import { AngularFireAuth } from 'angularfire2/auth';
import { customer } from '../../model/customer';
import { Observable } from 'rxjs';

/**
 * Generated class for the BookPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-book',
  templateUrl: 'book.html',
})
export class BookPage {
  roomPrice:room={
    BusinessSuite:"",
    FamilySuite:"",
    PresidentialSuite:"",
    HoneymoonSuite:"",
    LuxurySuite:""
  }
  roomNum:room={
    BusinessSuite:"",
    FamilySuite:"",
    PresidentialSuite:"",
    HoneymoonSuite:"",
    LuxurySuite:""
  }
  customer:customer={
    name:"",
    phone:"",
    num:"",
    roomtype:"",
    id:""
  }
  bookState:boolean=false;
  editState:boolean=false;
  editRoom:string="";
  bookRoom:string="";
  user:Observable<firebase.User>;

  constructor(public navCtrl: NavController, public navParams: NavParams,private afs:AngularFirestore,private afAuth:AngularFireAuth) {
    this.afs.doc('hotel/roomPrice').valueChanges().subscribe(price=>{
      this.roomPrice=price;
    })
    this.user=this.afAuth.authState;
    this.afs.doc('hotel/roomNum').valueChanges().subscribe(Num=>{
      this.roomNum=Num;
    })
  }
  book(bookRoom:string){
    console.log(bookRoom);
    this.bookRoom=bookRoom;
    this.bookState=true;
    
  }
  onSubmit(roomtype:string){

    if(this.customer.id!="" && this.customer.name!="" && this.customer.num!="" && this.customer.phone!=""){
    this.customer.roomtype=roomtype;
    //console.log(this.customer);
    this.afs.collection('book').add(this.customer);
    switch(roomtype){
      case "BusinessSuite":
        let num:number=parseInt(this.roomNum.BusinessSuite)-parseInt(this.customer.num);
        this.roomNum.BusinessSuite=num.toString();
        this.afs.doc(`hotel/roomNum`).update(this.roomNum);
        break;
      case "FamilySuite":
        num=parseInt(this.roomNum.FamilySuite)-parseInt(this.customer.num);
        this.roomNum.FamilySuite=num.toString();
        this.afs.doc(`hotel/roomNum`).update(this.roomNum);
        break;
      case "PresidentialSuite":
        num=parseInt(this.roomNum.PresidentialSuite)-parseInt(this.customer.num);
        this.roomNum.PresidentialSuite=num.toString();
        this.afs.doc(`hotel/roomNum`).update(this.roomNum);
        break;
      case "HoneymoonSuite":
        num=parseInt(this.roomNum.HoneymoonSuite)-parseInt(this.customer.num);
        this.roomNum.HoneymoonSuite=num.toString();
        this.afs.doc(`hotel/roomNum`).update(this.roomNum);
        break;
      case "LuxurySuite":
        num=parseInt(this.roomNum.LuxurySuite)-parseInt(this.customer.num);
        this.roomNum.LuxurySuite=num.toString();
        this.afs.doc(`hotel/roomNum`).update(this.roomNum);
        break;
    }
    this.customer={
      num:"",
      name:"",
      id:"",
      phone:"",
      roomtype:""
    }
    this.bookState=false;
    this.bookRoom="";
  }
  }
 
  cancle(){
    this.customer={
      num:"",
      name:"",
      id:"",
      phone:"",
      roomtype:""
    }
    this.bookState=false;
    this.bookRoom="";
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad BookPage');
  }
  edit(roomtype:string){
    this.editState=true;
    this.editRoom=roomtype;
  }
  submitRoom(){
    switch(this.editRoom){
      case 'BusinessSuite':
            this.afs.doc('hotel/roomNum').update({BusinessSuite:`${this.roomNum.BusinessSuite}`});
            this.afs.doc('hotel/roomPrice').update({BusinessSuite:`${this.roomPrice.BusinessSuite}`});
            break;
      case 'FamilySuite':
            this.afs.doc('hotel/roomNum').update({FamilySuite:`${this.roomNum.FamilySuite}`});
            this.afs.doc('hotel/roomPrice').update({FamilySuite:`${this.roomPrice.FamilySuite}`});
            break;
      case 'HoneymoonSuite':
            this.afs.doc('hotel/roomNum').update({HoneymoonSuite:`${this.roomNum.HoneymoonSuite}`});
            this.afs.doc('hotel/roomPrice').update({HoneymoonSuite:`${this.roomPrice.HoneymoonSuite}`});
            break;
      case 'LuxurySuite':
            this.afs.doc('hotel/roomNum').update({LuxurySuite:`${this.roomNum.LuxurySuite}`});
            this.afs.doc('hotel/roomPrice').update({LuxurySuite:`${this.roomPrice.LuxurySuite}`});
            break;
      case 'PresidentialSuite':
            this.afs.doc('hotel/roomNum').update({PresidentialSuite:`${this.roomNum.PresidentialSuite}`});
            this.afs.doc('hotel/roomPrice').update({PresidentialSuite:`${this.roomPrice.PresidentialSuite}`})
            break;
            
    } 
    this.editState=false;
    this.editRoom="";
    
  }
  cancleEdit(){
    this.editState=false;
    this.editRoom="";
   
  }

}
