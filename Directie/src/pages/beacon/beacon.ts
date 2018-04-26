import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';

/**
 * Generated class for the BeaconPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-beacon',
  templateUrl: 'beacon.html',
})
export class BeaconPage {
  beaconRegion: any;
  beaconUUID = '11111111-1111-1111-1111-111111111111';
  beaconRelation: any;
  pBeaconAccuracy: any;
  nBreaconId: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, private ibeacon:IBeacon) {
    this.beaconRelation={
      151:[{
        PB:150,NB:152,DIR:'straight'
      },
      {
        PB:149,NB:152,DIR:'turn right'
      }],
      152:[{
        PB:151,NB:153,DIR:'straight'
      }],
      153:[{
        PB:152,NB:154,DIR:"turn left"
      }]
    }
        // Request permission to use location on iOS
this.ibeacon.requestAlwaysAuthorization();
// create a new delegate and register it with the native layer
let delegate = this.ibeacon.Delegate();

// Subscribe to some of the delegate's event handlers
delegate.didRangeBeaconsInRegion()
  .subscribe(
    data => {
      //console.log('didRangeBeaconsInRegion: ', data.beacons[0]['accuracy'])
      if (data.beacons.length > 0) {

        console.log(data.beacons.length);
        for(let i=0;i<data.beacons.length;i++){
          this.pBeaconAccuracy=data.beacons[i]["accuracy"]
          if(this.pBeaconAccuracy<data.beacons[i]["accuracy"]){
            this.pBeaconAccuracy=data.beacons[i]["accuracy"];
            this.nBreaconId=data.beacons[i]["major"];
          }
        }
      }
      console.log("Nearest beacon: " + this.pBeaconAccuracy + "beaconId: "+ this.nBreaconId);
  },
    error => console.error()
  );
    this.beaconRegion = this.ibeacon.BeaconRegion('estimoteBeacon','11111111-1111-1111-1111-111111111111');
  this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
  
  }

  ionViewDidLoad() {
    console.dir(this.beaconRelation[151][0]["DIR"]);
  }
  
  detectBeacon(){
    // Request permission to use location on iOS
this.ibeacon.requestAlwaysAuthorization();
// create a new delegate and register it with the native layer
let delegate = this.ibeacon.Delegate();

// Subscribe to some of the delegate's event handlers
delegate.didRangeBeaconsInRegion()
  .subscribe(
    data => console.log('didRangeBeaconsInRegion: ', data),
    error => console.error()
  );
delegate.didStartMonitoringForRegion()
  .subscribe(
    data => console.log('didStartMonitoringForRegion: ', data),
    error => console.error()
  );
delegate.didEnterRegion()
  .subscribe(
    data => {
      console.log('didEnterRegion: ', data);
    }
  );

this.beaconRegion = this.ibeacon.BeaconRegion('estimoteBeacon','11111111-1111-1111-1111-111111111111');

this.ibeacon.startMonitoringForRegion(this.beaconRegion)
  .then(
    () => console.log('Native layer recieved the request to monitoring'),
    error => console.error('Native layer failed to begin monitoring: ', error)
  );
  this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
  }
  
  onBluetooth(){
    this.ibeacon.enableBluetooth();
  }
  stopDetectBeacon(){
    this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion);
  }

}
