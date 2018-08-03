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
import { DetailsPage } from '../details/details';
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
  currentUnitName: any;
  previousUnitName: any;
  currentBeaconInfo: any;
  startingBeacon: any;
  destinationBeacon: any;
  counter: any;
  dateTime: any;
  destinationUnit: any;
  destinationUnitName: any;
  reachedDestination: boolean = false;
  textToDisplay: String = '';
  nextUnit: String;
  nextUnitName: String;
  nextBeaconInfo: any;
  readMessageCounter: boolean = true;
  readMessageList: any = [];
  imageSRC: any = "assets/imgs/straight.png";
  beaconDetailsInfo: any;
  showAccuracy: any;
  startLocation: any;
  note: any;
  nodeArray = [];
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
    this.destinationUnitName = this.navParams.get('destinationUnitName');
    this.startingBeacon = this.navParams.get('currentBeacon');
    this.destinationBeacon = this.navParams.get('destinationBeacon');
    this.currentBeacon = this.navParams.get('currentBeacon');
    this.shortestPath = this.navParams.get('shortestPath');
    this.startLocation = this.navParams.get('currentUnit') + "/" + this.navParams.get('currentBeacon');
    this.displayAccuracyMessage = true;
    this.sub = Observable.interval(500).subscribe((val) => { this.determineCurrentBeacon() });
    /* this.sub2 = Observable.interval(3000).subscribe((val) => {
       if (this.displayAccuracyMessage == true) {
         this.determineIfUserOnTheRightTrack(this.previousNextBeaconAccuracy, this.currentNextBeaconAccuracy);
       }
     });
     */
    //this.sub3 = Observable.interval(400).subscribe((val) => { this.determineUnitAndUnitName() });
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
    this.destinationUnitName = this.navParams.get('destinationUnitName');
    this.currentBeacon = this.navParams.get('currentBeacon');
    this.startingBeacon = this.navParams.get('currentBeacon');
    this.destinationBeacon = this.navParams.get('destinationBeacon');
    this.shortestPath = this.navParams.get('shortestPath');
    var nodesRef = firebase.database().ref('/TimeStamp/' + this.counter + "/Nodes");
    nodesRef.on('value', snapshot => {
      this.nodeArray = snapshot.val();
    });
  }

  ionViewDidLeave() {
    this.isFirstBeacon = true;
    //this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion);
    this.displayMessage = false;
    this.sub.unsubscribe();
    this.sub2.unsubscribe();
    if (this.reachedDestination == true) {
      this.authProvider.updateCounter((this.counter + 1));
      this.navCtrl.push(HomePage);
    }
    else {
      this.dateTime = new Date().toISOString();
      this.authProvider.updateEndTime(this.counter, this.dateTime);
      this.authProvider.updateCounter((this.counter + 1));
      this.navCtrl.push(HomePage);
    }
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

    if (this.isFirstBeacon == true) {
      if (this.getCurrenBeacons.length > 0) {
        this.determineUnitAndUnitName();
        //determine next beacon to go
        for (let pathCounter = 0; pathCounter < this.shortestPath.length; pathCounter++) {
          if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[pathCounter])) {
            this.nextBeaconToGo = this.shortestPath[pathCounter + 1];
          }
          else if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[this.shortestPath.length - 1])) {
            this.arrivedDestination = this.shortestPath[this.shortestPath.length - 1];
          }
        }//end of for
        //if user arrived at destination
        if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.arrivedDestination)) {
          this.imageSRC = "assets/imgs/straight.png";
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
          //get the compass bearing to determine if user facing the right direction
          this.getCompassBearing(this.currentBeacon, this.nextBeaconToGo);
          if (this.getBearing >= (this.beaconBearing - 20) && this.getBearing <= (this.beaconBearing + 20)) {
            this.facingRightDirection = true;
          }
          else {
            this.facingRightDirection = false;
          }
          //when user face the wrong direction
          if (this.facingRightDirection == false) {
            this.determineIffacingRightDirection();

            if (this.readOnce == false) {
              this.readOnce = true;
              this.currentMessage = '';
              this.currentMessage = "Currently at " + this.currentUnit +
                " but facing the wrong direction";
              this.addTextToList(this.currentMessage);
            }
            //when user face the right direction
            if (this.showDirectionToTurn == true) {
              this.addTextToList(this.directionToTurn);
              this.showDirectionToTurn = false;
              this.previousDirectionToTurn = this.directionToTurn;
            }
            else {
              if (this.previousDirectionToTurn != this.directionToTurn) {
                this.addTextToList(this.directionToTurn);
                this.previousDirectionToTurn = this.directionToTurn;
              }
            }
          }
          else {
            this.displayMessage = true;
            this.directionToGo = "Go Straight";
            this.determineIfTurningPoint(this.nextBeaconToGo);
            this.determineNote(this.currentBeacon, this.nextBeaconToGo);
            if (this.isTurningPoint == true) {
              this.determineBeaconDirection(this.currentBeacon, this.nextBeaconToGo);
              this.determineNextUnit(this.nextBeaconToGo);
              if (this.turningPointDirection == "Turn Left") {
                console.log("is turn left");
                this.imageSRC = "assets/imgs/left.png";
              }
              else if (this.turningPointDirection == "Turn Right") {
                this.imageSRC = "assets/imgs/right.png";
              }
              this.setTextToDisplay(this.directionToGo, this.nextUnit, 1);
              this.setCurrentMessage(this.currentBeacon, this.directionToGo, this.nextUnit, 1);
              this.addTextToList(this.currentMessage);
            }
            else {
              this.imageSRC = "assets/imgs/straight.png";
              this.determineNextUnit(this.nextBeaconToGo);
              this.setTextToDisplay(this.directionToGo, this.nextUnit, 2);
              this.setCurrentMessage(this.currentBeacon, this.directionToGo, this.nextUnit, 2);
              this.addTextToList(this.currentMessage);
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
        //check for user reached destination
        /*if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.arrivedDestination) || this.currentBeacon == this.destinationBeacon) {
          let accuracyIndex = this.getCurrenBeacons.findIndex(x => x.major == this.arrivedDestination);
          this.currentAccuracyBeacon = this.getCurrenBeacons[accuracyIndex];
          if (this.currentAccuracyBeacon != null || this.currentAccuracyBeacon != undefined) {
            this.currentNextBeaconAccuracy = this.currentAccuracyBeacon["accuracy"];
            this.determineIfUserAtDestination(this.currentNextBeaconAccuracy);
          }
        }
        else {
          //get accuracy of next beacon
          let accuracyIndex = this.getCurrenBeacons.findIndex(x => x.major == this.nextBeaconToGo);
          this.currentAccuracyBeacon = this.getCurrenBeacons[accuracyIndex];
          if (this.currentAccuracyBeacon != null || this.currentAccuracyBeacon != undefined) {
            this.currentNextBeaconAccuracy = this.currentAccuracyBeacon["accuracy"];
          }
        }
        */
        //check for which beacons that are detected have the lowest accuracy
        this.pBeaconAccuracy = this.getCurrenBeacons[0]["accuracy"]
        this.testForCurrentBeacon = this.getCurrenBeacons[0]["major"];
        for (let i = 1; i < this.getCurrenBeacons.length; i++) {
          if (this.pBeaconAccuracy > this.getCurrenBeacons[i]["accuracy"]) {
            this.pBeaconAccuracy = this.getCurrenBeacons[i]["accuracy"];
            this.testForCurrentBeacon = this.getCurrenBeacons[i]["major"];
          }
        }
        //do checks for if the beacon with the lowest accuracy is part of the path
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
          /*else if (this.testForCurrentBeacon == this.destinationBeacon) {
            this.currentBeacon = this.testForCurrentBeacon;
          }
            */
        }
        //check if user facing the right direction
        this.getCompassBearing(this.currentBeacon, this.nextBeaconToGo);
        if (this.getBearing >= (this.beaconBearing - 20) && this.getBearing <= (this.beaconBearing + 20)) {
          this.facingRightDirection = true;
        }
        else {
          this.facingRightDirection = false;
        }
        //when user faces the wrong direction
        if (this.facingRightDirection == false) {
          this.determineIffacingRightDirection();
          if (this.showDirectionToTurn == true) {
            if (this.currentBeacon != this.destinationBeacon) {
              this.addTextToList(this.directionToTurn);
              this.showDirectionToTurn = false;
              this.previousDirectionToTurn = this.directionToTurn;
            }
          }
          else {
            if (this.previousDirectionToTurn != this.directionToTurn) {
              if (this.currentBeacon != this.destinationBeacon) {
                this.addTextToList(this.directionToTurn);
                this.previousDirectionToTurn = this.directionToTurn;
              }
            }
          }
        }
        //when user faces the right direction
        else {
          this.directionToTurn = '';
          this.directionToTurn = "Go straight"
          if (this.showDirectionToTurn == true) {
            this.addTextToList(this.directionToTurn);
            this.showDirectionToTurn = false;
            this.previousDirectionToTurn = this.directionToTurn;
          }
          else {
            if (this.previousDirectionToTurn != this.directionToTurn) {
              this.addTextToList(this.directionToTurn);
              this.previousDirectionToTurn = this.directionToTurn;
            }
          }
        }
        //when user arrived at the next beacon
        if (this.currentBeacon == this.nextBeaconToGo || this.currentBeacon == this.destinationBeacon/*&& this.currentNextBeaconAccuracy <= 1.5*/) {
          this.determineUnitAndUnitName();
          for (let pathCounter = 0; pathCounter < this.shortestPath.length; pathCounter++) {
            if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[(this.shortestPath.length - 1)])) {
              this.arrivedDestination = this.shortestPath[this.shortestPath.length - 1];
            }
          }
          //if user arrived at destination
          if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.arrivedDestination) || this.currentBeacon == this.destinationBeacon) {
            if (this.reachedDestination == false) {
              this.dateTime = new Date().toISOString();
              this.determineUnitAndUnitName();
              var data = {
                CurrentLocation: this.currentUnit + "/" + this.currentBeacon,
                NextLocation: this.currentUnit + "/" + this.currentBeacon,
                TimeStamp: this.dateTime,
              }
              this.nodeArray.push(data);
              this.authProvider.updateTimeStampDestination(this.counter, this.dateTime, this.nodeArray, true);
              //this.displayMessage = false;
              //this.accuracyMessage = '';
              this.imageSRC = "assets/imgs/straight.png";
              this.setTextToDisplay("", "", 3);
              this.destinationMessage = "Arrived at destination " + this.destinationUnit;
              this.tts.speak({ text: JSON.stringify(this.destinationMessage), rate: 0.9 });
              this.reachedDestination = true;
            }
          }
          //else if user is at next beacon
          else {
            //check if user if user is facing the right direction before executing the codes
            //get the compass bearing for the next next beacon
            for (let pathCounter = 0; pathCounter < this.shortestPath.length; pathCounter++) {
              if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[pathCounter])) {
                this.compassNextBeaconToGo = this.shortestPath[pathCounter + 1];
              }
            }//end of for loop
            //check if facing right direction
            this.getCompassBearing(this.currentBeacon, this.compassNextBeaconToGo);
            if (this.getBearing >= (this.beaconBearing - 20) && this.getBearing <= (this.beaconBearing + 20)) {
              this.secondFacingDirectionCheck = true;
            }
            else {
              this.secondFacingDirectionCheck = false;
            }
            //if facing the right direction get the next beacon to go
            if (this.secondFacingDirectionCheck == true) {
              for (let pathCounter = 0; pathCounter < this.shortestPath.length; pathCounter++) {
                if (JSON.stringify(this.currentBeacon) == JSON.stringify(this.shortestPath[pathCounter])) {
                  this.nextBeaconToGo = this.shortestPath[pathCounter + 1];
                }
              }//end of for loop
              this.determineBeaconDirection(this.currentBeacon, this.nextBeaconToGo);
              this.dateTime = new Date().toISOString();
              this.determineUnitAndUnitName();
              var data = {
                CurrentLocation: this.currentUnit + "/" + this.currentBeacon,
                NextLocation: this.nextUnit + "/" + this.nextBeaconToGo,
                TimeStamp: this.dateTime,
              }
              this.nodeArray.push(data);
              this.authProvider.updateTimeStamp(this.counter, this.nodeArray);
              this.directionToGo = "Go Straight";
              this.determineIfTurningPoint(this.nextBeaconToGo);
              this.determineNote(this.currentBeacon, this.nextBeaconToGo);
              if (this.isTurningPoint == true) {
                this.determineNextUnit(this.nextBeaconToGo);
                if (this.turningPointDirection == "Turn Left") {
                  this.imageSRC = "assets/imgs/left.png";
                }
                else if (this.turningPointDirection == "Turn Right") {
                  this.imageSRC = "assets/imgs/right.png";
                }
                this.readMessageList.length = 0;
                this.setTextToDisplay(this.directionToGo, this.nextUnit, 1);
                this.setCurrentMessage(this.currentBeacon, this.directionToGo, this.nextUnit, 1);
                this.addTextToList(this.currentMessage);
              }
              else {
                this.readMessageList.length = 0;
                this.determineNextUnit(this.nextBeaconToGo);
                this.imageSRC = "assets/imgs/straight.png";
                this.setTextToDisplay(this.directionToGo, this.nextUnit, 2);
                this.setCurrentMessage(this.currentBeacon, this.directionToGo, this.nextUnit, 2);
                this.addTextToList(this.currentMessage);
              }
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
                this.addTextToList("Currently at " + this.currentUnit +
                  " but facing the wrong direction");
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

  determineIfTurningPoint(nextBeacon) {
    let index = this.beaconDetails.findIndex(x => x.beaconID == nextBeacon);
    this.turningPointBeacon = this.beaconDetails[index];
    if (this.turningPointBeacon != null || this.turningPointBeacon != undefined) {
      this.isTurningPoint = this.beaconDetails[index]["turningPoint"];
    }
  }

  determineNote(currentBeacon, nextBeacon) {
    let index = this.beaconDetails.findIndex(x => x.beaconID == currentBeacon);
    if (this.beaconDetails[index]["beaconInfo"].length >= 1) {
      for (let i = 0; i < this.beaconDetails[index]["beaconInfo"].length; i++) {
        if (this.beaconDetails[index]["beaconInfo"][i]["NB"] == nextBeacon) {
          this.note = this.beaconDetails[index]["beaconInfo"][i]["Note"];
          console.log(this.note + " this is a note")
        }
      }
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
    if (this.getBearing < (this.beaconBearing)) {
      if (((this.beaconBearing) - this.getBearing) <= 50) {
        this.directionToTurn = '';
        this.directionToTurn = "turn your facing direction slightly to the right";
      }
      else if (((this.beaconBearing) - this.getBearing) <= 200) {
        this.directionToTurn = '';
        this.directionToTurn = "turn your facing direction to the right";
      }
      else {
        this.directionToTurn = '';
        this.directionToTurn = "turn your facing direction to the left";
      }
    }
    else if (this.getBearing > (this.beaconBearing)) {
      if (((this.getBearing) - this.beaconBearing) <= 50) {
        this.directionToTurn = '';
        this.directionToTurn = "turn your facing direction slightly to the left";
      }
      else if (((this.getBearing) - this.beaconBearing) <= 200) {
        this.directionToTurn = '';
        this.directionToTurn = "turn your facing direction to the left";
      }
      else {
        this.directionToTurn = '';
        this.directionToTurn = "turn your facing direction right";
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
      this.currentMessage = 'At ' + this.currentUnit + " " + this.currentUnitName
        + directionToGo + ' to ' + this.nextUnit + " " + this.nextUnitName
        + ' Be prepared to ' + this.turningPointDirection + " at the next location"
        + this.note;
      console.log(this.currentMessage);
    }
    else {
      this.currentMessage = '';
      this.currentMessage = 'At ' + this.currentUnit + " " + this.currentUnitName
        + ' Please ' + directionToGo + ' to ' + this.nextUnit + " " + this.nextUnitName
        + this.note;
    }
  }

  setTextToDisplay(directionToGo, nextBeaconToGo, version) {
    if (version == 1) {
      this.textToDisplay = '';
      this.textToDisplay = directionToGo + ' to ' + nextBeaconToGo
        + ' Prepare to ' + this.turningPointDirection + " at the next location";
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
    this.addTextToList(this.currentMessage);
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
    if (this.reachedDestination == true) {
      this.authProvider.updateCounter((this.counter + 1));
      this.navCtrl.push(HomePage);
    }
    else {
      this.dateTime = new Date().toISOString();
      this.authProvider.updateEndTime(this.counter, this.dateTime);
      this.authProvider.updateCounter((this.counter + 1));
      this.navCtrl.push(HomePage);
    }

  }

  determineUnitAndUnitName() {
    this.previousUnit = '';
    this.currentUnit = '';
    this.currentUnitName = '';
    this.previousUnitName = '';
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
      if (this.currentBeaconInfo["unitName"].length > 0) {
        this.previousUnitName = this.currentBeaconInfo["unitName"][0];
        this.currentUnitName = this.currentBeaconInfo["unitName"][0];
        for (let i = 1; i < this.currentBeaconInfo["unitName"].length; i++) {
          if (this.previousUnitName != this.currentBeaconInfo["unitName"][i]) {
            this.currentUnitName = this.currentUnitName + this.currentBeaconInfo["unitName"][i];
            this.previousUnitName = this.currentBeaconInfo["unitName"][i];
          }
          else {
            this.previousUnitName = this.currentBeaconInfo["unitName"][i];
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
        this.nextUnitName = this.nextBeaconInfo["unitName"][0];
        for (let i = 1; i < this.nextBeaconInfo["unit"].length; i++) {
          if (this.previousUnit != this.nextBeaconInfo["unit"][i]) {
            this.nextUnitName = this.nextUnitName + "/" + this.nextBeaconInfo["unitName"][i];
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
        this.tts.speak({ text: JSON.stringify(this.readMessageList[0]), rate: 1 })
          .then(() => { resolve(), this.readMessageList.shift(), this.readMessageCounter = true })
          .catch((reason: any) => console.log(reason));
      })
    }
  }

  addTextToList(text) {
    this.readMessageList.push(text);
    //console.log(this.readMessageList);
  }

  goToCurrentLocationDetails(): void {
    let currentBeaconIndex = this.beaconDetails.findIndex(x => x.beaconID == this.currentBeacon);
    this.beaconDetailsInfo = this.beaconDetails[currentBeaconIndex];
    this.navCtrl.push(DetailsPage, {
      beaconList: this.beaconDetailsInfo
    });
  }

  goToNextLocationDetails(): void {
    let currentBeaconIndex = this.beaconDetails.findIndex(x => x.beaconID == this.nextBeaconToGo);
    this.beaconDetailsInfo = this.beaconDetails[currentBeaconIndex];
    this.navCtrl.push(DetailsPage, {
      beaconList: this.beaconDetailsInfo
    });
  }

  goToDestinationDetails(): void {
    let currentBeaconIndex = this.beaconDetails.findIndex(x => x.beaconID == this.destinationBeacon);
    this.beaconDetailsInfo = this.beaconDetails[currentBeaconIndex];
    this.navCtrl.push(DetailsPage, {
      beaconList: this.beaconDetailsInfo
    });
  }

}
