import { NgModule } from '@angular/core';
import { IonicApp,IonicPageModule } from 'ionic-angular';
import { Next2Page } from './next2';

@NgModule({
  declarations: [
    Next2Page,
  ],
  imports: [
    IonicPageModule.forChild(Next2Page),
  ],
  bootstrap: [IonicApp]
})
export class Next2PageModule {}
