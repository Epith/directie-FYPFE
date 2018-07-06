import { Component } from '@angular/core';
import {
  Alert,
  AlertController,
  IonicPage,
  Loading,
  LoadingController,
  NavController,
  NavParams
} from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { ApiProvider } from '../../providers/api/api';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';

/**
 * Generated class for the BeaconPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var require: any;
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
  currentBeacon: any;
  relatedBeacon: any;
  shortestPath: any;
  beaconDetails: any;
  sub: Subscription;
  sub2: Subscription;
  isFirstBeacon: boolean = true;
  displayMessage: boolean = false;
  previousBeacon: any;
  previousBeaconIndex: any;
  nextBeaconToGo: any;
  previousNextBeaconAccuracy: any;
  currentNextBeaconAccuracy: any;
  getCurrenBeacons: any = [];
  arrivedDestination: any;
  directionToGo: String;
  accuracyMessage: String;
  displayAccuracyMessage: boolean = false;
  displayDestination: boolean = false;
  destinationMessage: String;
  previousAccuracyBeacon: any;
  currentAccuracyBeacon: any;
  isTurningPoint: boolean = false;
  turningPointBeacon: any;
  currentMessage: String;
  testForCurrentBeacon: any;
  previousPreviousBeacon: any;
  ifGetFirstCurrentBeacons: boolean = true;
  getBearing: any;
  facingRightDirection: boolean = false;
  beaconBearing: any;
  directionToTurn: String;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private ibeacon: IBeacon,
    public alertCtrl: AlertController,
    public apiProvider: ApiProvider,
    private tts: TextToSpeech,
    private deviceOrientation: DeviceOrientation) {
    this.getDeviceOrientation();
    //this.getBRelation();
    this.detectBeacon();
    this.beaconRelation = {
      "Beacons": [
        {
          'beaconID': 139,
          'beaconInfo': [
            {
              'PB': null,
              'NB': 140,
              'DIR': 'Go straight',
              'Bearing': 200
            }
          ],
          'relatedBeacons': [139, 140],
          'turningPoint': false
        },
        {
          'beaconID': 140,
          'beaconInfo': [
            {
              'PB': 139,
              'NB': 146,
              'DIR': 'Go Straight',
              'Bearing': 250
            }],
          'relatedBeacons': [139, 140, 146],
          'turningPoint': false
        },
        {
          'beaconID': 146,
          'beaconInfo': [{
            'PB': 140,
            'NB': 158,
            'DIR': 'Turn Left',
            'Bearing': 290
          }],
          'relatedBeacons': [140, 146, 158],
          'turningPoint': true
        },
        {
          'beaconID': 158,
          'beaconInfo': [{
            'PB': 146,
            'NB': 153,
            'DIR': 'Go Straight',
            'Bearing': 200
          },
          {
            'PB': 146,
            'NB': 156,
            "DIR": 'go right'
          }],
          'relatedBeacons': [146, 153, 158, 156],
          'turningPoint': false
        },
        {
          'beaconID': 153,
          'beaconInfo': [{
            'PB': 158,
            'NB': 159,
            'DIR': 'Go straight',
            'Bearing': 200
          }],
          'relatedBeacons': [153, 158, 159],
          'turningPoint': false
        },
        {
          'beaconID': 156,
          'beaconInfo': {
            'PB': 158,
            'NB': null,
            'DIR': 'Go straight'
          },
          'relatedBeacons': [156, 158],
          'turningPoint': false
        },
        {
          'beaconID': 159,
          'beaconInfo': {
            'PB': 153,
            'NB': null,
            'DIR': 'Go straight'
          },
          'relatedBeacons': [153, 159],
          'turningPoint': false
        }
      ]
    }
    this.beaconDetails = this.beaconRelation["Beacons"];
    this.inputDijkstra();
    this.detectBeacon();
    this.displayAccuracyMessage = true;
    this.sub = Observable.interval(500).subscribe((val) => { this.determineCurrentBeacon() });
    this.sub2 = Observable.interval(3000).subscribe((val) => {
      if (this.displayAccuracyMessage == true) {
        this.determineIfUserOnTheRightTrack(this.previousNextBeaconAccuracy, this.currentNextBeaconAccuracy);
      }
    });

  }

  getBRelation() {
    let data = {
      BeaconID: 'ALL'
    }
    this.apiProvider.getBRelation(data)
      .then(data => {
        this.beaconRelation = data;
        this.beaconDetails = this.beaconRelation["Beacons"];
        this.inputDijkstra();
        this.displayAccuracyMessage = true;
        this.sub = Observable.interval(500).subscribe((val) => { this.determineCurrentBeacon() });
        this.sub2 = Observable.interval(3000).subscribe((val) => {
          if (this.displayAccuracyMessage == true) {
            this.determineIfUserOnTheRightTrack(this.previousNextBeaconAccuracy, this.currentNextBeaconAccuracy);
          }
        });
        console.log(this.beaconDetails);
      });
  }

  ionViewDidLoad() {
    this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
  }

  ionViewDidLeave() {
    this.isFirstBeacon = true;
    //this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion);
    this.displayMessage = false;
    this.displayAccuracyMessage = false;
    this.sub.unsubscribe();
    this.sub2.unsubscribe();
    this.displayDestination = false;
  }

  ionViewWillEnter() {
    this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
  }

  detectBeacon() {
    // Request permission to use location on iOS
    this.ibeacon.requestAlwaysAuthorization();
    // create a new delegate and register it with the native layer
    let delegate = this.ibeacon.Delegate();

    // Subscribe to some of the delegate's event handlers
    delegate.didRangeBeaconsInRegion()
      .subscribe(
        data => {
          if (data.beacons.length > 0) {
            for (let i = 0; i < data.beacons.length; i++) {
              if (this.getCurrenBeacons.findIndex(x => x.major == data.beacons[i]["major"]) != -1) {
                let index = this.getCurrenBeacons.findIndex(x => x.major == data.beacons[i]["major"]);
                this.getCurrenBeacons[index] = data.beacons[i];
              }
              else if (this.getCurrenBeacons.findIndex(x => x.major == data.beacons[i]["major"]) == -1) {
                this.getCurrenBeacons.push(data.beacons[i])
              }
            }
            console.log(this.getCurrenBeacons);
          }
        },
        error => console.error()
      );

    this.beaconRegion = this.ibeacon.BeaconRegion('estimoteBeacon', '11111111-1111-1111-1111-111111111111');
    this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
  }

  determineCurrentBeacon() {
    // console.log('didRangeBeaconsInRegion: ', data)
    if (this.isFirstBeacon == true) {
      if (this.getCurrenBeacons.length > 0) {
        this.pBeaconAccuracy = this.getCurrenBeacons[0]["accuracy"]
        this.testForCurrentBeacon = this.getCurrenBeacons[0]["major"];
        for (let i = 1; i < this.getCurrenBeacons.length; i++) {
          if (this.pBeaconAccuracy > this.getCurrenBeacons[i]["accuracy"]) {
            this.pBeaconAccuracy = this.getCurrenBeacons[i]["accuracy"];
            this.testForCurrentBeacon = this.getCurrenBeacons[i]["major"];
          }
        }
        this.currentBeacon = this.testForCurrentBeacon;
        for (let pathCounter = 0; pathCounter < this.shortestPath.length; pathCounter++) {
          if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[pathCounter])) {
            this.nextBeaconToGo = this.shortestPath[pathCounter + 1];
          }
          else if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[this.shortestPath.length - 1])) {
            this.arrivedDestination = this.shortestPath[this.shortestPath.length - 1];
          }
        }
        if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.arrivedDestination)) {
          this.displayAccuracyMessage = false;
          this.displayDestination = true;
          this.destinationMessage = "Arrived at destination beacon " + this.currentBeacon;
          this.tts.speak({ text: JSON.stringify(this.destinationMessage), rate: 0.9 });
          let accuracyIndex = this.getCurrenBeacons.findIndex(x => x.major == this.arrivedDestination);
          this.currentAccuracyBeacon = this.getCurrenBeacons[accuracyIndex];
          if (this.currentAccuracyBeacon != null || this.currentAccuracyBeacon != undefined) {
            this.currentNextBeaconAccuracy = this.currentAccuracyBeacon["accuracy"];
            this.determineIfUserAtDestination(this.currentNextBeaconAccuracy);
          }
          this.isFirstBeacon = false;
          this.previousBeacon = this.currentBeacon;
          this.previousPreviousBeacon = this.previousBeacon;
          let accuracyIndex2 = this.getCurrenBeacons.findIndex(x => x.major == this.nextBeaconToGo);
          this.previousAccuracyBeacon = this.getCurrenBeacons[accuracyIndex2];
          if (this.previousAccuracyBeacon != null || this.previousAccuracyBeacon != undefined) {
            this.previousNextBeaconAccuracy = this.previousAccuracyBeacon["accuracy"];
          }
        }
        else {
          this.getCompassBearing(this.currentBeacon, this.nextBeaconToGo);
          console.log(this.beaconBearing);
          console.log(this.getBearing);
          if (this.getBearing >= (this.beaconBearing - 5) && this.getBearing <= (this.beaconBearing + 5)) {
            this.facingRightDirection = true;
          }
          else {
            this.facingRightDirection = false;
          }
          if (this.facingRightDirection == false) {
            this.determineIffacingRightDirection();
          }
          else {
            this.displayMessage = true;
            this.directionToGo = "Go Straight";
            this.determinIfTurningPoint(this.nextBeaconToGo);
            if (this.isTurningPoint == true) {

              this.tts.speak({ text: JSON.stringify(this.currentMessage), rate: 0.9 });
            }
            else {
              this.setCurrentMessage(this.currentBeacon, this.directionToGo, this.nextBeaconToGo);
              this.tts.speak({ text: JSON.stringify(this.currentMessage), rate: 0.9 });
            }
            this.facingRightDirection = false;
            this.isFirstBeacon = false;
            this.previousBeacon = this.currentBeacon;
            this.previousPreviousBeacon = this.previousBeacon;
            let accuracyIndex = this.getCurrenBeacons.findIndex(x => x.major == this.nextBeaconToGo);
            this.previousAccuracyBeacon = this.getCurrenBeacons[accuracyIndex];
            if (this.previousAccuracyBeacon != null || this.previousAccuracyBeacon != undefined) {
              this.previousNextBeaconAccuracy = this.previousAccuracyBeacon["accuracy"];
            }
          }
        }
      }//end of if
    }
    else {
      if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.arrivedDestination)) {
        let accuracyIndex = this.getCurrenBeacons.findIndex(x => x.major == this.arrivedDestination);
        this.currentAccuracyBeacon = this.getCurrenBeacons[accuracyIndex];
        if (this.currentAccuracyBeacon != null || this.currentAccuracyBeacon != undefined) {
          this.currentNextBeaconAccuracy = this.currentAccuracyBeacon["accuracy"];
          this.determineIfUserAtDestination(this.currentNextBeaconAccuracy);
        }
        console.log("already at destination");
        console.log(this.previousNextBeaconAccuracy);
        console.log(this.currentNextBeaconAccuracy);
        console.log(this.accuracyMessage);
      }
      else {
        let accuracyIndex = this.getCurrenBeacons.findIndex(x => x.major == this.nextBeaconToGo);
        this.currentAccuracyBeacon = this.getCurrenBeacons[accuracyIndex];
        if (this.currentAccuracyBeacon != null || this.currentAccuracyBeacon != undefined) {
          this.currentNextBeaconAccuracy = this.currentAccuracyBeacon["accuracy"];
        }
        console.log(this.previousNextBeaconAccuracy);
        console.log(this.currentNextBeaconAccuracy);
      }
      this.getCompassBearing(this.currentBeacon, this.nextBeaconToGo);
      console.log(this.beaconBearing);
      console.log(this.getBearing);
      if (this.getBearing >= (this.beaconBearing - 5) && this.getBearing <= (this.beaconBearing + 5)) {
        this.facingRightDirection = true;
      }
      else {
        this.facingRightDirection = false;
      }
      if (this.facingRightDirection == false) {
        this.determineIffacingRightDirection();
      }
      else {
        this.directionToTurn = '';
        this.directionToTurn = "Please go straight"
        if (this.getCurrenBeacons.length > 0) {
          this.pBeaconAccuracy = this.getCurrenBeacons[0]["accuracy"]
          this.testForCurrentBeacon = this.getCurrenBeacons[0]["major"];
          for (let i = 1; i < this.getCurrenBeacons.length; i++) {
            if (this.pBeaconAccuracy > this.getCurrenBeacons[i]["accuracy"]) {
              this.pBeaconAccuracy = this.getCurrenBeacons[i]["accuracy"];
              this.testForCurrentBeacon = this.getCurrenBeacons[i]["major"];
            }
          }
          if (this.shortestPath.includes(this.testForCurrentBeacon)) {
            this.previousBeaconIndex = this.beaconDetails.findIndex(x => x.beaconID == this.previousBeacon);
            let previousPreviousIndex = this.shortestPath.indexOf(this.previousPreviousBeacon);
            console.log(previousPreviousIndex + 1);
            console.log(this.shortestPath);
            if (this.beaconDetails[this.previousBeaconIndex]["relatedBeacons"].includes(Number(this.testForCurrentBeacon))) {
              this.currentBeacon = this.testForCurrentBeacon;
            }
            else if (this.beaconDetails[previousPreviousIndex + 1]["relatedBeacons"].includes(Number(this.testForCurrentBeacon))) {
              this.previousBeacon = this.shortestPath[this.previousBeaconIndex + 1];
              this.currentBeacon = this.testForCurrentBeacon;
              for (let pathCounter = 0; pathCounter < this.shortestPath.length; pathCounter++) {
                if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[pathCounter])) {
                  this.nextBeaconToGo = this.shortestPath[pathCounter];
                }
                else if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[(this.shortestPath.length - 1)])) {
                  this.arrivedDestination = this.shortestPath[this.shortestPath.length - 1];
                }
              }//end of for loop
            }
          }
          if (this.currentBeacon == this.nextBeaconToGo && this.currentNextBeaconAccuracy<0.5) {
            for (let pathCounter = 0; pathCounter < this.shortestPath.length; pathCounter++) {
              if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[pathCounter])) {
                this.nextBeaconToGo = this.shortestPath[pathCounter + 1];
              }
              else if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[(this.shortestPath.length - 1)])) {
                this.arrivedDestination = this.shortestPath[this.shortestPath.length - 1];
              }
            }//end of for loop
            this.determineBeaconDirection(this.previousBeacon, this.currentBeacon, this.nextBeaconToGo);
            if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.arrivedDestination)) {
              this.displayMessage = false;
              this.displayDestination = true;
              this.displayAccuracyMessage = false;
              this.accuracyMessage = '';
              this.destinationMessage = "Arrived at destination beacon " + this.currentBeacon;
              this.tts.speak({ text: JSON.stringify(this.destinationMessage), rate: 0.9 });
            }
            else {
              this.determinIfTurningPoint(this.nextBeaconToGo);
              if (this.isTurningPoint == true) {
                this.setCurrentMessage(this.currentBeacon, this.directionToGo, this.nextBeaconToGo);
                this.tts.speak({ text: JSON.stringify(this.currentMessage), rate: 0.9 });
              }
              else {
                this.setCurrentMessage(this.currentBeacon, this.directionToGo, this.nextBeaconToGo);
                this.tts.speak({ text: JSON.stringify(this.currentMessage), rate: 0.9 });
              }
              this.displayDestination = false;
            }
            this.previousBeacon = this.currentBeacon;
            this.previousPreviousBeacon = this.previousBeacon;
            this.getCurrenBeacons = [];
            this.facingRightDirection = false;
          }
        }
      }

    }//end of else
  }

  stopDetectBeacon() {
    this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion);
  }

  inputDijkstra() {
    const Graph = require('node-dijkstra');
    const route = new Graph();
    for (let i = 0; i < this.beaconDetails.length; i++) {
      this.relatedBeacon = {};
      if (this.beaconDetails[i]["relatedBeacons"].length >= 1) {
        for (let j = 0; j < this.beaconDetails[i]["relatedBeacons"].length; j++) {
          if (j == 0) {
            this.relatedBeacon[this.beaconDetails[i]["relatedBeacons"][j]] = 1;
          }
          else {
            this.relatedBeacon[this.beaconDetails[i]["relatedBeacons"][j]] = 1;
          }
        }
      }
      route.addNode(JSON.stringify(this.beaconDetails[i]["beaconID"]), this.relatedBeacon);
      console.dir("beaconID:" + this.beaconDetails[i]["beaconID"] + "related: " + (this.relatedBeacon));
    }

    this.shortestPath = route.path('139', '153');

  }

  determineBeaconDirection(previousBeacon, currentBeacon, nextBeacon) {
    this.directionToGo = '';
    let index = this.beaconDetails.findIndex(x => x.beaconID == currentBeacon);
    if (this.beaconDetails[index]["beaconInfo"].length >= 1) {
      for (let i = 0; i < this.beaconDetails[index]["beaconInfo"].length; i++) {
        if (this.beaconDetails[index]["beaconInfo"][i]["PB"] == previousBeacon && this.beaconDetails[index]["beaconInfo"][i]["NB"] == nextBeacon) {
          this.directionToGo = this.beaconDetails[index]["beaconInfo"][i]["DIR"];
        }
      }
    }
  }//end of determineBeaconDirection

  determinIfTurningPoint(nextBeacon) {
    let index = this.beaconDetails.findIndex(x => x.beaconID == nextBeacon);
    this.turningPointBeacon = this.beaconDetails[index];
    if (this.turningPointBeacon != null || this.turningPointBeacon != undefined) {
      this.isTurningPoint = this.beaconDetails[index]["turningPoint"];
    }
  }

  getCompassBearing(currentBeacon, nextBeacon) {
    let index = this.beaconDetails.findIndex(x => x.beaconID == currentBeacon);
    if (this.beaconDetails[index]["beaconInfo"].length >= 1) {
      for (let i = 0; i < this.beaconDetails[index]["beaconInfo"].length; i++) {
        if (this.beaconDetails[index]["beaconInfo"][i]["NB"] == nextBeacon) {
          this.beaconBearing = this.beaconDetails[index]["beaconInfo"][i]["Bearing"];
        }
      }
    }
  }

  determineIfUserOnTheRightTrack(previousAccuracy, currentAccuracy) {
    if (currentAccuracy <= previousAccuracy) {
      this.accuracyMessage = '';
      this.accuracyMessage = 'You are walking nearer to the next location.';
      this.previousNextBeaconAccuracy = this.currentNextBeaconAccuracy;
    }
    else if (currentAccuracy > previousAccuracy) {
      this.accuracyMessage = '';
      this.accuracyMessage = 'You are walking further away from the next location, could you please make some adjustments';
      this.previousNextBeaconAccuracy = this.currentNextBeaconAccuracy;
    }
    else {
      this.previousNextBeaconAccuracy = this.currentNextBeaconAccuracy;
    }
  }

  determineIffacingRightDirection() {
    if (this.getBearing < (this.beaconBearing - 5)) {
      if (((this.beaconBearing - 5) - this.getBearing) <= 180) {
        this.directionToTurn = '';
        this.directionToTurn = "Please turn right";
      }
      else {
        this.directionToTurn = '';
        this.directionToTurn = "Please turn left";
      }
    }
    else if (this.getBearing > (this.beaconBearing + 5)) {
      if (((this.beaconBearing + 5) - this.getBearing) <= 180) {
        this.directionToTurn = '';
        this.directionToTurn = "Please turn left";
      }
      else {
        this.directionToTurn = '';
        this.directionToTurn = "Please turn right";
      }
    }
  }

  determineIfUserAtDestination(currentAccuracy) {
    if (currentAccuracy <= 1) {
      this.accuracyMessage = '';
      this.accuracyMessage = 'You are at the destination';
      this.previousNextBeaconAccuracy = this.currentNextBeaconAccuracy;
    }
    else if (currentAccuracy > 1) {
      this.accuracyMessage = '';
      this.accuracyMessage = 'You are further from the destination';
      this.previousNextBeaconAccuracy = this.currentNextBeaconAccuracy;
    }
    else {
      this.previousNextBeaconAccuracy = this.currentNextBeaconAccuracy;
    }
  }

  setCurrentMessage(currentBeacon, directionToGo, nextBeaconToGo, ) {
    this.currentMessage = '';
    this.currentMessage = 'You are currently at beacon ' + currentBeacon
      + ' Please ' + directionToGo + ' to beacon ' + nextBeaconToGo
      + ' Please be aware that the next beacon is a turning point';
  }

  readMessage() {
    this.tts.speak({ text: JSON.stringify(this.currentMessage), rate: 0.9 });
  }

  readAccuracyMessage() {
    this.tts.speak({ text: JSON.stringify(this.accuracyMessage), rate: 0.9 });
  }

  readDestinationMessage() {
    this.tts.speak({ text: JSON.stringify(this.destinationMessage), rate: 0.9 });
  }

  getDeviceOrientation() {
    // Get the device current compass heading
    this.deviceOrientation.getCurrentHeading().then(
      (data: DeviceOrientationCompassHeading) => console.log(data),
      (error: any) => console.log(error)
    );

    // Watch the device compass heading change
    var subscription = this.deviceOrientation.watchHeading().subscribe(
      (data: DeviceOrientationCompassHeading) => this.getBearing = Math.round(data.magneticHeading)
    );
  }

}
