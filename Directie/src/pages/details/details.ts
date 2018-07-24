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
  previousUnit: any;
  unitName: any;
  previousUnitName: any;
  facilityName: any;
  previousFacilityName: any;
  facilityDesc: any;
  previousFacilityDesc: any;
  facilityImg: any;
  previousFacilityImg: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.determineValues();
  }

  ionViewDidLoad() {
    this.beaconDetails = this.navParams.get('beaconList');
    this.unit = this.beaconDetails["unit"];
    this.unitName = this.beaconDetails["unitName"];
    this.facilityName = this.beaconDetails["facilityName"];
    this.facilityDesc = this.beaconDetails["facilityDesc"];
    this.facilityImg = this.beaconDetails["facilityImg"];
    console.log(this.beaconDetails);
  }

  determineValues() {
    if (this.beaconDetails["unit"].length > 0) {
      this.previousUnit = this.beaconDetails["unit"][0];
      this.unit = this.beaconDetails["unit"][0];
      for (let i = 1; i < this.beaconDetails["unit"].length; i++) {
        if (this.previousUnit != this.beaconDetails["unit"][i]) {
          this.unit = this.unit + "/" + this.beaconDetails["unit"][i];
          this.previousUnit = this.beaconDetails["unit"][i];
        }
        else {
          this.previousUnit = this.beaconDetails["unit"][i];
        }
      }
    }


  }

}
