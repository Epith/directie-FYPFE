import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CompassBearingPage } from './compass-bearing';

@NgModule({
  declarations: [
    CompassBearingPage,
  ],
  imports: [
    IonicPageModule.forChild(CompassBearingPage),
  ],
})
export class CompassBearingPageModule {}
