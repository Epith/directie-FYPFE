import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';

/**
 * Generated class for the CompassBearingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-compass-bearing',
  templateUrl: 'compass-bearing.html',
})
export class CompassBearingPage {
  private bearing:any;
  constructor(public navCtrl: NavController, public navParams: NavParams,private deviceOrientation: DeviceOrientation) {
        // Get the device current compass heading
    this.deviceOrientation.getCurrentHeading().then(
      (data: DeviceOrientationCompassHeading) => console.log(data),
      (error: any) => console.log(error)
    );

    // Watch the device compass heading change
    var subscription = this.deviceOrientation.watchHeading().subscribe(
      (data: DeviceOrientationCompassHeading) => this.bearing=data.magneticHeading
    );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CompassBearingPage');
  }

}
