import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RoomManagePage } from './room-manage';

@NgModule({
  declarations: [
    RoomManagePage,
  ],
  imports: [
    IonicPageModule.forChild(RoomManagePage),
  ],
})
export class RoomManagePageModule {}
