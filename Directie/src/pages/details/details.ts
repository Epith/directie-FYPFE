import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BeaconPage } from '../beacon/beacon';
import { AuthProvider } from '../../providers/auth/auth';
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
  facilityImg = [];
  previousFacilityImg: any;
  facilityDetails = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public authProvider: AuthProvider) {
    this.beaconDetails = this.navParams.get('beaconList');
    this.determineValues();
  }

  ionViewDidLoad() {
    this.beaconDetails = this.navParams.get('beaconList');
    console.log(this.beaconDetails);
  }

  ionViewDidLeave() {
    this.authProvider.goToDetails = false;
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
    if (this.beaconDetails["unitName"].length > 0) {
      this.previousUnitName = this.beaconDetails["unitName"][0];
      this.unitName = this.beaconDetails["unitName"][0];
      for (let i = 1; i < this.beaconDetails["unitName"].length; i++) {
        if (this.previousUnitName != this.beaconDetails["unitName"][i]) {
          this.unitName = this.unitName + "/" + this.beaconDetails["unitName"][i];
          this.previousUnitName = this.beaconDetails["unitName"][i];
        }
        else {
          this.previousUnitName = this.beaconDetails["unitName"][i];
        }
      }
    }
    if (this.beaconDetails["facilityImg"].length > 0) {
      for (let i = 0; i < this.beaconDetails["facilityImg"].length; i++) {
        this.facilityImg.push(this.beaconDetails["facilityImg"][i]);
      }
    }
    if (this.beaconDetails["facilityName"].length > 0) {
      for (let i = 0; i < this.beaconDetails["facilityName"].length; i++) {
        var data = {
          facilityName: this.beaconDetails["facilityName"][i],
          facilityDesc: this.beaconDetails["facilityDesc"][i]
        }
        this.facilityDetails.push(data);
      }

      this.facilityDesc = this.beaconDetails["facilityDesc"][0];
      this.facilityDesc = this.beaconDetails["facilityDesc"][0];
      for (let i = 1; i < this.beaconDetails["facilityDesc"].length; i++) {
        if (this.facilityDesc != this.beaconDetails["facilityDesc"][i]) {
          this.facilityDesc = this.facilityDesc + "/" + this.beaconDetails["facilityDesc"][i];
          this.facilityDesc = this.beaconDetails["facilityDesc"][i];
        }
        else {
          this.facilityDesc = this.beaconDetails["facilityDesc"][i];
        }
      }
    }


  }

}
