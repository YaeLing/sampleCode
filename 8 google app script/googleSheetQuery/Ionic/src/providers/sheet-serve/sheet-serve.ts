import { Injectable } from '@angular/core';
import { student } from '../../model/student';
import { AngularFirestore } from 'angularfire2/firestore';

//import { AngularFirestore } from 'angularfire2/firestore';

/*
  Generated class for the SheetServeProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SheetServeProvider {

  constructor(private afs:AngularFirestore) {
    console.log('Hello SheetServeProvider Provider');
  }
  Upload(student:student){
    console.log(student);
   this.afs.doc(`student/${student.id}`).set(student);
  }
}
