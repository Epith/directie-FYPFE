import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
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
  private beaconRelation:any;
  private beaconDetails:any;
  private beaconList:any=[];
  selectedPreviousBeacon:any;
  selectedCurrentBeacon:any;
  selectedNextBeacon:any;
  directionToGo:any;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private deviceOrientation: DeviceOrientation,
    private alertCtrl: AlertController) {
    this.beaconRelation={
      "Beacons":[
        {
          'beaconID':139,
          'beaconInfo':[
            {
              'PB':'',
              'NB':140,
              'DIR':'Go straight',
              'bearing':330
            }
          ], 
          'relatedBeacons':[139,140],
          'turningPoint':false
        },
      {
        'beaconID':140,
        'beaconInfo':[ 
          {
            'PB':139,
            'NB':146,
            'DIR':'Go Straight'
          }],
        'relatedBeacons':[139,140,146],
        'turningPoint':false
      },
      {
        'beaconID':146,
        'beaconInfo': [{
          'PB':140,
          'NB':158,
          'DIR':'Turn Left'
        }],
        'relatedBeacons':[140,146,158],
        'turningPoint':true
      },
      {
        'beaconID':158,
        'beaconInfo': [{
          'PB':146,
          'NB':153,
          'DIR':'Go Straight'
        },
        {
          'PB':146,
          'NB':156,
          "DIR":'go right'
        }],
        'relatedBeacons':[146,153,158,156],
        'turningPoint':false
      },
      {
        'beaconID':153,
        'beaconInfo': [{
          'PB':158,
          'NB':'159',
          'DIR':'Go straight'
        }],
        'relatedBeacons':[153,158,159],
        'turningPoint':false
      },
      {
        'beaconID':156,
        'beaconInfo': {
          'PB':158,
          'NB':'',
          'DIR':'Go straight'
        },
        'relatedBeacons':[156,158],
        'turningPoint':false
      },
      {
        'beaconID':159,
        'beaconInfo': {
          'PB':153,
          'NB':'',
          'DIR':'Go straight'
        },
        'relatedBeacons':[153,159],
        'turningPoint':false
      }
    ]
  }
    this.beaconDetails=this.beaconRelation["Beacons"];
        // Get the device current compass heading
    this.deviceOrientation.getCurrentHeading().then(
      (data: DeviceOrientationCompassHeading) => console.log(data),
      (error: any) => console.log(error)
    );

    // Watch the device compass heading change
    var subscription = this.deviceOrientation.watchHeading().subscribe(
      (data: DeviceOrientationCompassHeading) => this.bearing=Math.round(data.trueHeading)
    );

    this.loadBeaconsIntoList();
    console.log(this.beaconList);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CompassBearingPage');
  }

  loadBeaconsIntoList(){
    for(let i=0;i<this.beaconDetails.length;i++){
      this.beaconList.push(this.beaconDetails[i]["beaconID"]);
    }
  }

  callConsole(){
    console.log(this.selectedPreviousBeacon);
    console.log(this.selectedCurrentBeacon);
    console.log(this.selectedNextBeacon);
    console.log(this.directionToGo);
  }

  sendToDatabase(){
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
          }
        }
      ]
    });
    alert.present();
  }

}
