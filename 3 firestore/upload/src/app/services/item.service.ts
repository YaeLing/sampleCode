import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument }
from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item } from '../models/item';



@Injectable({
  providedIn: 'root'
})
export class ItemService {
itemCollection:AngularFirestoreCollection<Item>;
itemDoc:AngularFirestoreDocument<Item>;
items:Observable<Item[]>;
  constructor(public afs: AngularFirestore) {
    //this.items=this.afs.collection('item').valueChanges();
    //用上面的簡單 但是不能取得id 在做刪除的時候不好用
    this.items=this.afs.collection('item').snapshotChanges().pipe(map(changes =>{
      return changes.map(a =>{
        const data=a.payload.doc.data() as Item;
        data.id= a.payload.doc.id;//取得id
        return data;
      })
    }));

    this.itemCollection=this.afs.collection('item',ref => ref.orderBy('title','asc'));
   }
   getItem(){
     return this.items;
   }
   addItem(item : Item){
     this.itemCollection.add(item);//看上面你宣告的 itemCollection:AngularFirestoreCollection<Item>
   }

   deleteItem(item:Item){
     this.itemDoc=this.afs.doc(`item/${item.id}`);
     this.itemDoc.delete();

   }

   updateItem(item:Item){
    this.itemDoc=this.afs.doc(`item/${item.id}`);
    this.itemDoc.update(item);

   }
}

