import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BeaconPage } from '../beacon/beacon';

/**
 * Generated class for the DetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage {

  beaconDetails: any;
  unit: any;
  unitName: any;
  facilityName: any;
  facilityDesc: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.beaconDetails = this.navParams.get('beaconList');
    console.log(this.beaconDetails);
  }


}
