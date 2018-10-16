import {  ErrorHandler,NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NextPage } from './next';

@NgModule({
  declarations: [
    NextPage,
  ],
  imports: [
    IonicPageModule.forChild(NextPage),
  ],
  bootstrap: [IonicApp],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class NextPageModule {}
