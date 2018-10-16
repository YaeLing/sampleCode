import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../service/account.service';
import { Account } from '../../model/account';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  constructor(private accountService:AccountService) { }
  searchState:boolean=false;
  searchid:string="";
  accounts:Account[];

  searchAccount(){
    
    if(this.searchid!=null){
        
        this.accountService.searchAccount(this.searchid).subscribe(search=>{
          this.searchState=true;
          this.accounts=search;
         // console.log(this.searchState);
        })
    }
  
   

    
  }
  ngOnInit() {
  }

}
