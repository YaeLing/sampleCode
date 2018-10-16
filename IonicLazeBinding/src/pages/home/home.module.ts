import { NgModule } from '@angular/core';
import { IonicApp, IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
@NgModule({
  declarations: [HomePage],
  imports: [IonicPageModule.forChild(HomePage)],
  bootstrap: [IonicApp]
})
export class HomePageModule { }