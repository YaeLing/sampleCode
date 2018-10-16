import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


import { HomePage } from '../pages/home/home';
import { HotelInfoPage } from '../pages/hotel-info/hotel-info';
import { RoomInfoPage } from '../pages/room-info/room-info';
import { BookPage } from '../pages/book/book';
//import { LoginPage } from '../pages/login/login';
import { RoomManagePage } from '../pages/room-manage/room-manage';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  LoginPage: any = 'login';

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: '飯店資訊'  , component: HotelInfoPage},
      { title: '房間資訊'   , component: RoomInfoPage},
      { title: '訂房'       , component: BookPage},
      { title: '房間管理' ,component: RoomManagePage},
      { title: '管理員登入' , component: this.LoginPage}
      
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
