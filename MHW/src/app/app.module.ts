import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireModule } from 'angularfire2';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { LoginComponent } from './component/login/login.component';
import { FormsModule} from '@angular/forms';
import { AddAccountListComponent } from './component/login/add-account-list/add-account-list.component';
import { AccountComponent } from './component/account/account.component';
import { PartyComponent } from './component/party/party.component';
import { SearchComponent } from './component/search/search.component';
import { CheckComponent } from './component/party/check/check.component';
import { LobbyComponent } from './component/lobby/lobby.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AddAccountListComponent,
    AccountComponent,
    PartyComponent,
    SearchComponent,
    CheckComponent,
    LobbyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
