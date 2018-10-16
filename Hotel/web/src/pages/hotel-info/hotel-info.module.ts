import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HotelInfoPage } from './hotel-info';

@NgModule({
  declarations: [
    HotelInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(HotelInfoPage),
  ],
})
export class HotelInfoPageModule {}
