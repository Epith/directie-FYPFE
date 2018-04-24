import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BeaconPage } from './beacon';

@NgModule({
  declarations: [
    BeaconPage,
  ],
  imports: [
    IonicPageModule.forChild(BeaconPage),
  ],
})
export class BeaconPageModule {}
