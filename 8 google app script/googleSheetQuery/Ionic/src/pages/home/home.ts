import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { student } from '../../model/student';
import { SheetServeProvider } from '../../providers/sheet-serve/sheet-serve';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {
  studentState=false;
  student:student={
    id:"",
    phone:"",
    email:""
  };
  constructor(public navCtrl: NavController,private sheet:SheetServeProvider) {

  }
  onSubmit(){
    //console.log(this.student);
    this.studentState=true;
  }
  check(){
    this.studentState=false;
    this.sheet.Upload(this.student);
    this.student={
      id:"",
      phone:"",
      email:"",
      name:""
    };
    
  }
  edit(){
    this.studentState=false;
  }
}
