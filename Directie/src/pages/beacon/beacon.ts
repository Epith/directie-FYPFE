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
import { HomePage } from '../home/home';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';
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
  private beaconUUID = '11111111-1111-1111-1111-111111111111';
  beaconRelation: any;
  pBeaconAccuracy: any;
  currentBeacon: any;
  relatedBeacon: any;
  shortestPath: any;
  beaconDetails: any;
  sub: Subscription;
  sub2: Subscription;
  sub3: Subscription;
  sub4: Subscription;
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
  getBearing: any;
  facingRightDirection: boolean = false;
  beaconBearing: any;
  directionToTurn: String;
  turningPointDirection: String;
  readOnce: boolean = false;
  turningPointNextBeacon: any;
  secondFacingDirectionCheck: boolean = false;
  compassNextBeaconToGo: any;
  previousDirectionToTurn: String = "";
  showDirectionToTurn: boolean = true;
  currentUnit: any;
  previousUnit: any;
  currentFacility: any;
  previousFacility: any;
  currentBeaconInfo: any;
  startingBeacon: any;
  destinationBeacon: any;
  counter: any;
  dateTime: any;
  destinationUnit: any;
  destinationFacility: any;
  reachedDestination: boolean = false;
  textToDisplay: String = '';
  nextUnit: String;
  nextBeaconInfo: any;
  readMessageCounter: boolean = true;
  readMessageList: any = [];
  imageSRC: any = "assets/imgs/straight.png";
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private ibeacon: IBeacon,
    public alertCtrl: AlertController,
    public apiProvider: ApiProvider,
    private tts: TextToSpeech,
    private deviceOrientation: DeviceOrientation,
    private authProvider: AuthProvider) {
    this.detectBeacon();
    this.getDeviceOrientation();
    this.getBRelation();
  }

  getBRelation() {
    this.beaconDetails = this.navParams.get('beaconList');
    this.counter = this.navParams.get('counter');
    this.destinationUnit = this.navParams.get('destinationUnit');
    this.destinationFacility = this.navParams.get('destinationFacility');
    this.startingBeacon = this.navParams.get('currentBeacon');
    this.destinationBeacon = this.navParams.get('destinationBeacon');
    this.currentBeacon = this.navParams.get('currentBeacon');
    this.inputDijkstra();
    this.displayAccuracyMessage = true;
    this.sub = Observable.interval(500).subscribe((val) => { this.determineCurrentBeacon() });
    this.sub2 = Observable.interval(3000).subscribe((val) => {
      if (this.displayAccuracyMessage == true) {
        this.determineIfUserOnTheRightTrack(this.previousNextBeaconAccuracy, this.currentNextBeaconAccuracy);
      }
    });
    this.sub3 = Observable.interval(400).subscribe((val) => { this.determineCurrentUnitAndFacility() });
    this.sub4 = Observable.interval(0).subscribe((val) => {
      if (this.readMessageCounter == true && this.readMessageList.length > 0) {
        this.speakText()
      }
    });
    console.log(this.beaconDetails);
    console.log(this.shortestPath);
  }

  ionViewDidLoad() {
    this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
    this.counter = this.navParams.get('counter');
    this.destinationUnit = this.navParams.get('destinationUnit');
    this.destinationFacility = this.navParams.get('destinationFacility');
    this.currentBeacon = this.navParams.get('currentBeacon');
    this.startingBeacon = this.navParams.get('currentBeacon');
    this.destinationBeacon = this.navParams.get('destinationBeacon');

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

        for (let pathCounter = 0; pathCounter < this.shortestPath.length; pathCounter++) {
          if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[pathCounter])) {
            this.nextBeaconToGo = this.shortestPath[pathCounter + 1];
          }
          else if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[this.shortestPath.length - 1])) {
            this.arrivedDestination = this.shortestPath[this.shortestPath.length - 1];
          }
        }//end of for

        if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.arrivedDestination)) {
          this.imageSRC = "assets/imgs/straight.png";
          this.displayAccuracyMessage = false;
          this.displayDestination = true;
          this.destinationMessage = "Arrived at destination " + this.destinationUnit;
          this.setTextToDisplay("", "", 3);
          this.tts.speak({ text: JSON.stringify(this.destinationMessage), rate: 0.9 });
          let accuracyIndex = this.getCurrenBeacons.findIndex(x => x.major == this.arrivedDestination);
          this.currentAccuracyBeacon = this.getCurrenBeacons[accuracyIndex];
          if (this.currentAccuracyBeacon != null || this.currentAccuracyBeacon != undefined) {
            this.currentNextBeaconAccuracy = this.currentAccuracyBeacon["accuracy"];
            this.determineIfUserAtDestination(this.currentNextBeaconAccuracy);
          }
          this.readOnce = false;
          this.isFirstBeacon = false;
          this.previousBeacon = this.currentBeacon;
          this.previousPreviousBeacon = this.previousBeacon;
          let accuracyIndex2 = this.getCurrenBeacons.findIndex(x => x.major == this.nextBeaconToGo);
          this.previousAccuracyBeacon = this.getCurrenBeacons[accuracyIndex2];
          if (this.previousAccuracyBeacon != null || this.previousAccuracyBeacon != undefined) {
            this.previousNextBeaconAccuracy = this.previousAccuracyBeacon["accuracy"];
          }
        }//end of if current=destination
        else {
          this.getCompassBearing(this.currentBeacon, this.nextBeaconToGo);
          if (this.getBearing >= (this.beaconBearing - 10) && this.getBearing <= (this.beaconBearing + 10)) {
            this.facingRightDirection = true;
          }
          else {
            this.facingRightDirection = false;
          }
          if (this.facingRightDirection == false) {
            this.determineIffacingRightDirection();

            if (this.readOnce == false) {
              this.readOnce = true;
              this.currentMessage = '';
              this.currentMessage = "Currently at " + this.currentUnit +
                " but facing the wrong direction to the next location";
              this.addTextToList(this.currentMessage);
              //this.tts.speak({ text: JSON.stringify(this.currentMessage), rate: 0.9 }).then();
            }
            if (this.showDirectionToTurn == true) {
              this.addTextToList(this.directionToTurn);
              //this.tts.speak({ text: JSON.stringify(this.directionToTurn), rate: 0.9 });
              this.showDirectionToTurn = false;
              this.previousDirectionToTurn = this.directionToTurn;
            }
            else {
              if (this.previousDirectionToTurn != this.directionToTurn) {
                this.addTextToList(this.directionToTurn);
                //this.tts.speak({ text: JSON.stringify(this.directionToTurn), rate: 0.9 });
                this.previousDirectionToTurn = this.directionToTurn;
              }
            }
          }
          else {
            this.displayMessage = true;
            this.directionToGo = "Go Straight";
            this.determinIfTurningPoint(this.nextBeaconToGo);
            if (this.isTurningPoint == true) {
              this.determineBeaconDirection(this.currentBeacon, this.nextBeaconToGo);
              this.determineNextUnit(this.nextBeaconToGo);
              if (this.turningPointDirection == "Turn Left") {
                this.imageSRC = "assets/imgs/left.png";
              }
              else {
                this.imageSRC = "assets/imgs/right.png";
              }
              this.setTextToDisplay(this.directionToGo, this.nextUnit, 1);
              this.setCurrentMessage(this.currentBeacon, this.directionToGo, this.nextUnit, 1);
              this.addTextToList(this.currentMessage);
              //this.tts.speak({ text: JSON.stringify(this.currentMessage), rate: 0.9 });
            }
            else {
              this.imageSRC = "assets/imgs/straight.png";
              this.determineNextUnit(this.nextBeaconToGo);
              this.setTextToDisplay(this.directionToGo, this.nextUnit, 2);
              this.setCurrentMessage(this.currentBeacon, this.directionToGo, this.nextUnit, 2);
              this.addTextToList(this.currentMessage);
              //this.tts.speak({ text: JSON.stringify(this.currentMessage), rate: 0.9 });
            }
            this.showDirectionToTurn = true;
            this.readOnce = false;
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
      }//end of if(ifFirstBeacon)
    }
    //else of(ifFirstBeacon)
    else {
      if (this.getCurrenBeacons.length > 0) {
        if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.arrivedDestination)) {
          let accuracyIndex = this.getCurrenBeacons.findIndex(x => x.major == this.arrivedDestination);
          this.currentAccuracyBeacon = this.getCurrenBeacons[accuracyIndex];
          if (this.currentAccuracyBeacon != null || this.currentAccuracyBeacon != undefined) {
            this.currentNextBeaconAccuracy = this.currentAccuracyBeacon["accuracy"];
            this.determineIfUserAtDestination(this.currentNextBeaconAccuracy);
          }
        }
        else {
          let accuracyIndex = this.getCurrenBeacons.findIndex(x => x.major == this.nextBeaconToGo);
          this.currentAccuracyBeacon = this.getCurrenBeacons[accuracyIndex];
          if (this.currentAccuracyBeacon != null || this.currentAccuracyBeacon != undefined) {
            this.currentNextBeaconAccuracy = this.currentAccuracyBeacon["accuracy"];
          }
        }
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
          else if (this.testForCurrentBeacon == this.destinationBeacon) {
            this.currentBeacon = this.testForCurrentBeacon;
          }
        }
        this.getCompassBearing(this.currentBeacon, this.nextBeaconToGo);
        if (this.getBearing >= (this.beaconBearing - 10) && this.getBearing <= (this.beaconBearing + 10)) {
          this.facingRightDirection = true;
        }
        else {
          this.facingRightDirection = false;
        }
        if (this.facingRightDirection == false) {
          this.determineIffacingRightDirection();
          if (this.showDirectionToTurn == true) {
            this.addTextToList(this.directionToTurn);
            //this.tts.speak({ text: JSON.stringify(this.directionToTurn), rate: 0.9 });
            this.showDirectionToTurn = false;
            this.previousDirectionToTurn = this.directionToTurn;
          }
          else {
            if (this.previousDirectionToTurn != this.directionToTurn) {
              this.addTextToList(this.directionToTurn);
              //this.tts.speak({ text: JSON.stringify(this.directionToTurn), rate: 0.9 });
              this.previousDirectionToTurn = this.directionToTurn;
            }
          }
        }
        else {
          this.directionToTurn = '';
          this.directionToTurn = "Please go straight"
          if (this.showDirectionToTurn == true) {
            this.addTextToList(this.directionToTurn);
            //this.tts.speak({ text: JSON.stringify(this.directionToTurn), rate: 0.9 });
            this.showDirectionToTurn = false;
            this.previousDirectionToTurn = this.directionToTurn;
          }
          else {
            if (this.previousDirectionToTurn != this.directionToTurn) {
              this.addTextToList(this.directionToTurn);
              //this.tts.speak({ text: JSON.stringify(this.directionToTurn), rate: 0.9 });
              this.previousDirectionToTurn = this.directionToTurn;
            }
          }
        }

        if (this.currentBeacon == this.nextBeaconToGo || this.currentBeacon == this.destinationBeacon/*&& this.currentNextBeaconAccuracy <= 1.5*/) {
          for (let pathCounter = 0; pathCounter < this.shortestPath.length; pathCounter++) {
            if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[(this.shortestPath.length - 1)])) {
              this.arrivedDestination = this.shortestPath[this.shortestPath.length - 1];
            }
          }
          if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.arrivedDestination) || this.currentBeacon == this.destinationBeacon) {
            if (this.reachedDestination == false) {
              this.dateTime = new Date().toLocaleString();
              this.determineCurrentUnitAndFacility();
              this.authProvider.uploadTimeStamp(this.counter, this.dateTime, this.currentUnit, this.destinationUnit, this.currentUnit, firebase.auth().currentUser.email, true);
              this.displayMessage = false;
              this.displayDestination = true;
              this.displayAccuracyMessage = false;
              this.accuracyMessage = '';
              this.imageSRC = "assets/imgs/straight.png";
              this.setTextToDisplay("", "", 3);
              this.destinationMessage = "Arrived at destination " + this.destinationUnit;
              this.tts.speak({ text: JSON.stringify(this.destinationMessage), rate: 0.9 });
              this.reachedDestination = true;
            }
          }
          else {
            for (let pathCounter = 0; pathCounter < this.shortestPath.length; pathCounter++) {
              if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[pathCounter])) {
                this.compassNextBeaconToGo = this.shortestPath[pathCounter + 1];
              }
            }//end of for loop
            this.getCompassBearing(this.currentBeacon, this.compassNextBeaconToGo);
            if (this.getBearing >= (this.beaconBearing - 10) && this.getBearing <= (this.beaconBearing + 10)) {
              this.secondFacingDirectionCheck = true;
            }
            else {
              this.secondFacingDirectionCheck = false;
            }
            if (this.secondFacingDirectionCheck == true) {
              for (let pathCounter = 0; pathCounter < this.shortestPath.length; pathCounter++) {
                if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[pathCounter])) {
                  this.nextBeaconToGo = this.shortestPath[pathCounter + 1];
                }
              }//end of for loop
              this.determineBeaconDirection(this.currentBeacon, this.nextBeaconToGo);
              this.dateTime = new Date().toLocaleString();
              this.determineCurrentUnitAndFacility();
              this.authProvider.uploadTimeStamp(this.counter, this.dateTime, this.currentUnit, this.destinationUnit, this.currentUnit, firebase.auth().currentUser.email, false);
              this.directionToGo = "Go Straight";
              this.determinIfTurningPoint(this.nextBeaconToGo);
              if (this.isTurningPoint == true) {
                this.determineNextUnit(this.nextBeaconToGo);
                if (this.turningPointDirection == "Turn Left") {
                  this.imageSRC = "assets/imgs/left.png";
                }
                else {
                  this.imageSRC = "assets/imgs/right.png";
                }
                this.setTextToDisplay(this.directionToGo, this.nextUnit, 1);
                this.setCurrentMessage(this.currentBeacon, this.directionToGo, this.nextUnit, 1);
                this.addTextToList(this.currentMessage);
                //this.tts.speak({ text: JSON.stringify(this.currentMessage), rate: 0.9 });
              }
              else {
                this.determineNextUnit(this.nextBeaconToGo);
                this.imageSRC = "assets/imgs/straight.png";
                this.setTextToDisplay(this.directionToGo, this.nextUnit, 2);
                this.setCurrentMessage(this.currentBeacon, this.directionToGo, this.nextUnit, 2);
                this.addTextToList(this.currentMessage);
                //this.tts.speak({ text: JSON.stringify(this.currentMessage), rate: 0.9 });
              }
              this.displayDestination = false;
              this.previousBeacon = this.currentBeacon;
              this.previousPreviousBeacon = this.previousBeacon;
              this.getCurrenBeacons = [];
              this.facingRightDirection = false;
              this.readOnce = false;
              this.secondFacingDirectionCheck = false;
              this.showDirectionToTurn = true;
            }
            else {
              if (this.readOnce == false) {
                this.currentMessage = '';
                this.currentMessage = "You are currently at " + this.currentUnit +
                  " but you are facing the wrong direction to the next location";
                this.addTextToList(this.currentMessage);
                //this.tts.speak({ text: JSON.stringify(this.currentMessage), rate: 0.9 });
                this.readOnce = true;
              }
            }
          }
        }
      }
    }//end of else
  }

  stopDetectBeacon() {
    this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion);
  }

  inputDijkstra() {
    this.beaconDetails = this.navParams.get('beaconList');
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

    this.shortestPath = route.path(this.startingBeacon, this.destinationBeacon);

  }

  determineBeaconDirection(currentBeacon, nextBeacon) {
    for (let pathCounter = 0; pathCounter < this.shortestPath.length; pathCounter++) {
      if (JSON.stringify(nextBeacon) == JSON.stringify(this.shortestPath[pathCounter])) {
        this.turningPointNextBeacon = this.shortestPath[pathCounter + 1];
      }
    }//end of for loop
    this.turningPointDirection = '';
    let index = this.beaconDetails.findIndex(x => x.beaconID == nextBeacon);
    if (this.beaconDetails[index]["beaconInfo"].length >= 1) {
      for (let i = 0; i < this.beaconDetails[index]["beaconInfo"].length; i++) {
        if (this.beaconDetails[index]["beaconInfo"][i]["PB"] == currentBeacon && this.beaconDetails[index]["beaconInfo"][i]["NB"] == this.turningPointNextBeacon) {
          this.turningPointDirection = this.beaconDetails[index]["beaconInfo"][i]["DIR"];
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
          this.beaconBearing = this.beaconDetails[index]["beaconInfo"][i]["Compass"];
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
    if (this.getBearing < (this.beaconBearing - 10)) {
      if (((this.beaconBearing - 10) - this.getBearing) <= 50) {
        this.directionToTurn = '';
        this.directionToTurn = "Please turn your facing direction slightly to the right";
      }
      else if (((this.beaconBearing - 10) - this.getBearing) <= 200) {
        this.directionToTurn = '';
        this.directionToTurn = "Please turn your facing direction to the right";
      }
      else {
        this.directionToTurn = '';
        this.directionToTurn = "Please turn your facing direction to the left";
      }
    }
    else if (this.getBearing > (this.beaconBearing + 10)) {
      if (((this.getBearing) - this.beaconBearing + 10) <= 50) {
        this.directionToTurn = '';
        this.directionToTurn = "Please turn your facing direction slightly to the left";
      }
      else if (((this.getBearing) - this.beaconBearing + 10) <= 200) {
        this.directionToTurn = '';
        this.directionToTurn = "Please turn your facing direction to the left";
      }
      else {
        this.directionToTurn = '';
        this.directionToTurn = "Please turn your facing direction right";
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

  setCurrentMessage(currentBeacon, directionToGo, nextBeaconToGo, version) {
    if (version == 1) {
      this.currentMessage = '';
      this.currentMessage = 'You are currently at ' + this.currentUnit
        + ' Please ' + directionToGo + ' to ' + this.nextUnit
        + ' Please be prepared to ' + this.turningPointDirection + " at the next location";
    }
    else {
      this.currentMessage = '';
      this.currentMessage = 'You are currently at ' + this.currentUnit
        + ' Please ' + directionToGo + ' to ' + nextBeaconToGo;
    }
  }

  setTextToDisplay(directionToGo, nextBeaconToGo, version) {
    if (version == 1) {
      this.textToDisplay = '';
      this.textToDisplay = directionToGo + ' to ' + nextBeaconToGo
        + ' Please be prepared to ' + this.turningPointDirection + " at the next location";
    }
    else if (version == 2) {
      this.textToDisplay = '';
      this.textToDisplay = directionToGo + ' to ' + nextBeaconToGo;
    }
    else {
      this.textToDisplay = '';
      this.textToDisplay = "Arrived at destination " + this.destinationUnit;
    }

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
      (data: DeviceOrientationCompassHeading) => this.getBearing = Math.round(data.trueHeading)
    );
  }

  goToHome(): void {
    this.navCtrl.push(HomePage);
    this.authProvider.updateCounter((this.counter + 1));
  }

  determineCurrentUnitAndFacility() {
    this.previousUnit = '';
    this.currentUnit = '';
    this.currentFacility = '';
    this.previousFacility = '';
    let currentBeaconIndex = this.beaconDetails.findIndex(x => x.beaconID == this.currentBeacon);
    this.currentBeaconInfo = this.beaconDetails[currentBeaconIndex];
    if (this.currentBeaconInfo != null || this.currentBeaconInfo != undefined) {
      if (this.currentBeaconInfo["unit"].length > 0) {
        this.previousUnit = this.currentBeaconInfo["unit"][0];
        this.currentUnit = this.currentBeaconInfo["unit"][0];
        for (let i = 1; i < this.currentBeaconInfo["unit"].length; i++) {
          if (this.previousUnit != this.currentBeaconInfo["unit"][i]) {
            this.currentUnit = this.currentUnit + "/" + this.currentBeaconInfo["unit"][i];
            this.previousUnit = this.currentBeaconInfo["unit"][i];
          }
          else {
            this.previousUnit = this.currentBeaconInfo["unit"][i];
          }
        }
      }
      if (this.currentBeaconInfo["facility"].length > 0) {
        this.previousFacility = this.currentBeaconInfo["facility"][0];
        this.currentFacility = this.currentBeaconInfo["facility"][0];
        for (let i = 1; i < this.currentBeaconInfo["facility"].length; i++) {
          if (this.previousFacility != this.currentBeaconInfo["facility"][i]) {
            this.currentFacility = this.currentFacility + this.currentBeaconInfo["facility"][i];
            this.previousFacility = this.currentBeaconInfo["facility"][i];
          }
          else {
            this.previousFacility = this.currentBeaconInfo["facility"][i];
          }
        }
      }
    }
  }

  determineNextUnit(nextBeacon) {
    this.previousUnit = '';
    this.nextUnit = '';
    let currentBeaconIndex = this.beaconDetails.findIndex(x => x.beaconID == nextBeacon);
    this.nextBeaconInfo = this.beaconDetails[currentBeaconIndex];
    if (this.nextBeaconInfo != null || this.nextBeaconInfo != undefined) {
      if (this.nextBeaconInfo["unit"].length > 0) {
        this.previousUnit = this.nextBeaconInfo["unit"][0];
        this.nextUnit = this.nextBeaconInfo["unit"][0];
        for (let i = 1; i < this.nextBeaconInfo["unit"].length; i++) {
          if (this.previousUnit != this.nextBeaconInfo["unit"][i]) {
            this.nextUnit = this.nextUnit + "/" + this.nextBeaconInfo["unit"][i];
            this.previousUnit = this.nextBeaconInfo["unit"][i];
          }
          else {
            this.previousUnit = this.nextBeaconInfo["unit"][i];
          }
        }
      }
    }
  }

  async speakText(): Promise<any> {
    this.readMessageCounter = false;
    if (this.readMessageList.length > 0) {
      return await new Promise(resolve => {
        this.tts.speak({ text: JSON.stringify(this.readMessageList[0]), rate: 0.9 })
          .then(() => { resolve(), this.readMessageList.shift(), this.readMessageCounter = true })
          .catch((reason: any) => console.log(reason));
      })
    }
  }

  addTextToList(text) {
    this.readMessageList.push(text);
    console.log(this.readMessageList);
  }


}
