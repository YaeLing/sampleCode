import { Component, OnInit } from '@angular/core';
import {  ItemService } from '../../services/item.service';
import { Item } from '../../models/item';
@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {
  items:Item[];
  editState: boolean = false;
  itemToEdit : Item;
  constructor(private ItemService:ItemService) { }

  ngOnInit() {
    this.ItemService.getItem().subscribe(items=>{
       //console.log(items);
       this.items=items;
    })
  }

  deleteItem(item : Item){
    this.clearState();
    this.ItemService.deleteItem(item);
  }

  editItem(event,item : Item){
    this.editState= true;
    this.itemToEdit= item;
  }
  clearState(){
    this.editState= false;
    this.itemToEdit={};
  }
  updateItem(item : Item){
    this.ItemService.updateItem(item);
    this.clearState();
  }

}
