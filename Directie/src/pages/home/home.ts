import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BeaconPage } from '../beacon/beacon';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {
    console.log("Test");
  }
  
  goToBeacon(){
    this.navCtrl.push(BeaconPage);
  }

}
