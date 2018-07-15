import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';
import { ApiProvider } from '../../providers/api/api';

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
  //private beaconRelation:any;
  //private beaconDetails:any;
  private beacon:any;
  private beaconList:any=[];
  selectedPreviousBeacon:any;
  selectedCurrentBeacon:any;
  selectedNextBeacon:any;
  directionToGo:any;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private deviceOrientation: DeviceOrientation,
    public apiProvider: ApiProvider,
    private alertCtrl: AlertController) {
    this.getBeacon();
        // Get the device current compass heading
    this.deviceOrientation.getCurrentHeading().then(
      (data: DeviceOrientationCompassHeading) => console.log(data),
      (error: any) => console.log(error)
    );

    // Watch the device compass heading change
    var subscription = this.deviceOrientation.watchHeading().subscribe(
      (data: DeviceOrientationCompassHeading) => this.bearing=Math.round(data.trueHeading)
    );

    //this.loadBeaconsIntoList();
    //console.log(this.beaconList);
  }
  getBeacon(){
    let data = {
    }
    this.apiProvider.getBeacon(data)
    .then(data => {
      this.beacon = data;
      for(let i=0;i<this.beacon.length;i++){
        this.beaconList.push(this.beacon[i]["BeaconID"]);
      }
      console.log(this.beacon);
    });
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad CompassBearingPage');
  }

  /*loadBeaconsIntoList(){
    for(let i=0;i<this.beaconDetails.length;i++){
      this.beaconList.push(this.beaconDetails[i]["beaconID"]);
    }
  }*/

  callConsole(){
    console.log(this.selectedPreviousBeacon);
    console.log(this.selectedCurrentBeacon);
    console.log(this.selectedNextBeacon);
    console.log(this.directionToGo);
  }

  sendToDatabase(){
    var PreviousBID;
    var NextBID;
    var DirectID;

    var CurrentBID = parseInt(this.selectedCurrentBeacon);
    if (this.selectedPreviousBeacon == "None"){
      PreviousBID = 0;
    }else {
      PreviousBID = parseInt(this.selectedPreviousBeacon);
    }
    if (this.selectedNextBeacon == "None"){
      NextBID = 0;
    }else {
      NextBID = parseInt(this.selectedNextBeacon);
    }
    
    if (this.directionToGo == "Go Sraight"){
      DirectID = 1;
    }else if (this.directionToGo == "Turn Left"){
      DirectID = 2;
    }else if (this.directionToGo == "Turn Right"){
      DirectID = 3;
    }
    var Compass = this.bearing;

    let alert = this.alertCtrl.create({
      title: 'Confirm Data',
      message: 'Send to the database?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            console.log('Buy clicked');
            

            var data = {
              "BeaconDirection" : {
                "CurrentBID":CurrentBID,
                "PreviousBID":PreviousBID,
                "NextBID":NextBID,
                "DirectID":DirectID,
                "Compass":Compass
              }
            }
            console.log(data);
            this.apiProvider.createBeaconDirection(data).then((result) => {
              console.log(result);
            }, (err) => {
              console.log(err);
            });
            
          }
        }
      ]
    });
    alert.present();
  }

}
