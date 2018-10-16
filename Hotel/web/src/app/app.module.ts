import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { FormsModule } from '@angular/forms'


import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { HotelInfoPage } from '../pages/hotel-info/hotel-info';
import { RoomInfoPage } from '../pages/room-info/room-info';
import { BookPage } from '../pages/book/book';
import { LoginPage } from '../pages/login/login';
import { RoomManagePage } from '../pages/room-manage/room-manage';

import { environment } from '../environments/environment';



import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    HotelInfoPage,
    RoomInfoPage,
    BookPage,
    LoginPage,
    RoomManagePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase),
    FormsModule,
    AngularFirestoreModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    HotelInfoPage,
    RoomInfoPage,
    BookPage,
    LoginPage,
    RoomManagePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
