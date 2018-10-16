import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { AccountComponent } from './component/account/account.component';
import { PartyComponent } from '../app/component/party/party.component';
import { SearchComponent } from '../app/component/search/search.component';
import { LobbyComponent } from './component/lobby/lobby.component';

const routes:Routes=[
   {path: 'login',component:LoginComponent},
   {path: 'account', component:AccountComponent},
   {path: 'search', component:SearchComponent},
   {path: 'party', component:PartyComponent},
   {path: 'lobby', component:LobbyComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports:[RouterModule]
  

})
export class AppRoutingModule { }
