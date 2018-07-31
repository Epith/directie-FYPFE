import { Component } from '@angular/core';
import { NavController, AlertController, } from 'ionic-angular';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { BeaconPage } from '../beacon/beacon';
import { CompassBearingPage } from '../compass-bearing/compass-bearing';
import { IBeacon } from '@ionic-native/ibeacon';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { AuthProvider } from '../../providers/auth/auth';
import firebase from 'firebase';
import { ApiProvider } from '../../providers/api/api';
import { Keyboard } from '@ionic-native/keyboard';

declare var require: any;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  beaconRelation: any;
  beaconDetails: any;
  getCurrenBeacons: any = [];
  beaconRegion: any;
  beaconUUID = '11111111-1111-1111-1111-111111111111';
  sub: Subscription;
  sub2: Subscription;
  testForCurrentBeacon: any;
  pBeaconAccuracy: any;
  currentBeacon: any;
  currentMessage: String;
  dateTime: any;
  counter: any;
  destination: any;
  currentUnit: any;
  previousUnit: any;
  currentUnitName: any;
  previousUnitName: any;
  currentBeaconInfo: any;
  destinationBeacon: any;
  destinationUnitName: any;
  destinationUnit: any;
  destinationBeaconInfo: any;
  isRelated: boolean = false;
  relatedBeacon: any;
  shortestPath: any;
  Graph: any;
  route: any;
  checkPreviousBeacon: any;
  welcomeMsgDone: boolean = false;
  checkDestinationExist: boolean = false;
  previousShortestPath: any;
  firstShortestPath: boolean = true;
  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    private tts: TextToSpeech,
    private speechRecognition: SpeechRecognition,
    private ibeacon: IBeacon,
    private authProvider: AuthProvider,
    public apiProvider: ApiProvider,
    private keyboard: Keyboard) {
    //this.keyboard.disableScroll(true);
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (hasPermission == false) {
          this.speechRecognition.requestPermission();
        }
      });
    this.detectBeacon();
    this.getBRoute();
  }

  goToBeacon() {
    this.checkDestinationExist = false;
    this.destinationBeacon = null;
    this.shortestPath = null;
    this.determineDestinationBeacon(this.destination.toLocaleUpperCase());
    if (this.shortestPath != null) {
      this.dateTime = new Date().toLocaleString();
      this.determineDestinationUnitName(this.destinationBeacon);
      this.authProvider.uploadTimeStamp(this.shortestPath, this.counter, this.dateTime, this.currentUnit + "/" + this.currentBeacon, this.destination + "/" + this.destinationBeacon, this.currentUnit + "/" + this.currentBeacon, firebase.auth().currentUser.uid, false);
      this.navCtrl.push(BeaconPage, {
        currentBeacon: this.currentBeacon,
        currentUnit: this.currentUnit,
        destinationBeacon: this.destinationBeacon.toString(),
        beaconList: this.beaconDetails,
        counter: this.counter,
        destinationUnit: this.destinationUnit,
        destinationUnitName: this.destinationUnitName,
        shortestPath: this.shortestPath
      });
    }
    else {
      this.speakText("No path found");
    }


  }

  ionViewDidLoad() {
    this.ibeacon.enableBluetooth();
    this.ibeacon.isBluetoothEnabled().then(data => {
      if (data == false) {
        let alert = this.alertCtrl.create({
          title: 'Bluetooth',
          subTitle: 'Please turn on Bluetooth',
          buttons: ['Ok']
        });
        alert.present();
      }
    })
    this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
    this.detectBeacon();
    var counterRef = firebase.database().ref('/Counter');
    counterRef.on('value', snapshot => {
      this.counter = snapshot.val();
    });
  }

  ionViewWillEnter() {
    this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
    this.detectBeacon();
  }

  async welcomeMsg() {
    var responseAttempt = 0;
    var responseMsg = 0;
    var textMsg;
    var response;
    this.checkDestinationExist = false;
    this.destinationBeacon = null;
    this.shortestPath = null;
    while (this.shortestPath == null && responseAttempt < 3) {
      if (responseMsg == 0) {
        //textMsg = "Good morning, Your current location is at Singapore Polytechnic at beacon" + this.currentBeacon + ". May I know where do you want to go?";
        textMsg = "Currently at " + this.currentUnit + "state where you would like to go after the beep";
      }
      else if (response == false) {
        textMsg = "Sorry, no response detected. Your destination please?";
      }
      else if (this.checkDestinationExist == false) {
        textMsg = "Destination not found, state your destination again after the beep";
      }
      else if (this.checkDestinationExist == true) {
        if (this.shortestPath == null) {
          textMsg = "No path to your destination, state another destination after the beep";
        }
      }

      await this.speakText(textMsg).then(() => { console.log('success'), this.welcomeMsgDone = true; });
      await this.startSpeechRecognition().then((msg) => {
        this.destination = msg.toLocaleString().toLocaleUpperCase();
        this.determineDestinationBeacon(this.destination);
        console.log(this.destinationBeacon);
        console.log(this.checkDestinationExist);
        console.log(this.shortestPath);
        if (msg == "") {
          responseAttempt++;
          responseMsg++;
          response = false;
          if (responseAttempt == 3)
            this.speakText("Directie in standby mode. Double tap to wake up.");

        }
        else if (this.shortestPath != null) {
          this.speakText("Path found");
          this.determineDestinationUnitName(this.destinationBeacon);
          //responseAttempt = 3; //End the loop if user spoke
          //this.goToBeacon();
        }
        else {
          responseMsg++;
          responseAttempt = 0;
          response = true;
        }
      });
    }
  }

  speakText(textMsg) {
    return new Promise(resolve => {
      this.tts.speak({ text: textMsg, locale: "en-US" })
        .then(() => { resolve() })
        .catch((reason: any) => console.log(reason));
    })
  }

  startSpeechRecognition() {
    var SROptions = {
      language: 'en-US',
      showPopup: false
    };

    return new Promise(resolve => {
      this.speechRecognition.startListening(SROptions)
        .subscribe(
          (matches: Array<string>) => { console.log(matches); resolve(matches[0]) },
          (onerror) => {
            if ((onerror == "No match") || (onerror = "No speech input"))
              resolve("");
            else
              console.log(onerror);
          }
        )
    });
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
    if (this.getCurrenBeacons.length > 0) {
      this.pBeaconAccuracy = this.getCurrenBeacons[0]["accuracy"]
      this.testForCurrentBeacon = this.getCurrenBeacons[0]["major"];
      for (let i = 1; i < this.getCurrenBeacons.length; i++) {
        if (this.pBeaconAccuracy > this.getCurrenBeacons[i]["accuracy"]) {
          this.pBeaconAccuracy = this.getCurrenBeacons[i]["accuracy"];
          this.testForCurrentBeacon = this.getCurrenBeacons[i]["major"];
        }
      }
      this.checkIfRelated(this.testForCurrentBeacon);
      if (this.isRelated == true) {
        this.currentBeacon = this.testForCurrentBeacon;
        if (this.checkPreviousBeacon != this.currentBeacon) {
          this.determineUnitAndUnitName()
          this.checkPreviousBeacon = this.currentBeacon;
          if (this.welcomeMsgDone == true) {
            if (this.currentUnit != null || this.currentUnit != undefined) {
              this.welcomeMsg();
            }
          }
        }
        else {
          this.determineUnitAndUnitName();
          this.checkPreviousBeacon = this.currentBeacon;
        }

      }
    }//end of if
  }

  goToCompass() {
    this.navCtrl.push(CompassBearingPage);
  }

  getBRoute() {
    let data = {
      BeaconID: 'ALL'
    }
    this.apiProvider.getBRoute(data)
      .then(data => {
        this.beaconRelation = data;
        this.beaconDetails = this.beaconRelation["Beacons"];
        this.sub = Observable.interval(500).subscribe((val) => { this.determineCurrentBeacon() });
        setTimeout(() => {
          this.welcomeMsg();
        }, 3500);
        //this.sub2 = Observable.interval(500).subscribe((val) => { this.determineUnitAndUnitName() });
        console.log(this.beaconDetails);
        this.inputDijkstra();
      });
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

  determineDestinationBeacon(destination) {
    for (let i = 0; i < this.beaconDetails.length; i++) {
      for (let k = 0; k < this.beaconDetails[i]["unit"].length; k++) {
        if (destination == this.beaconDetails[i]["unit"][k] || destination == this.beaconDetails[i]["unitName"][k]) {
          this.destinationBeacon = this.beaconDetails[i]["beaconID"];
          this.checkDestinationExist = true;
          let checkShortestPath = this.route.path(this.currentBeacon, JSON.stringify(this.beaconDetails[i]["beaconID"]));
          if (checkShortestPath != null) {
            if (this.firstShortestPath == true) {
              this.shortestPath = checkShortestPath;
              this.previousShortestPath = this.shortestPath;
              this.firstShortestPath = false;
            }
            else {
              if (checkShortestPath.length < this.previousShortestPath.length) {
                this.shortestPath = checkShortestPath;
                this.previousShortestPath = checkShortestPath;
              }
              else {
                this.previousShortestPath = checkShortestPath;
              }
            }
          }
        }
      }
    }
  }

  determineDestinationUnitName(destination) {
    this.destinationUnitName = '';
    this.destinationUnit = '';
    let currentBeaconIndex = this.beaconDetails.findIndex(x => x.beaconID == destination);
    this.destinationBeaconInfo = this.beaconDetails[currentBeaconIndex];
    if (this.destinationBeaconInfo != null || this.destinationBeaconInfo != undefined) {
      if (this.destinationBeaconInfo["unitName"].length > 0) {
        this.previousUnitName = this.destinationBeaconInfo["unitName"][0];
        this.destinationUnitName = this.destinationBeaconInfo["unitName"][0];
        this.destinationUnit = this.destinationBeaconInfo["unit"][0];
        for (let i = 1; i < this.destinationBeaconInfo["unitName"].length; i++) {
          if (this.previousUnitName != this.destinationBeaconInfo["unitName"][i]) {
            this.destinationUnit = this.destinationUnit + "/" + this.destinationBeaconInfo["unit"][i];
            this.destinationUnitName = this.currentUnitName +"/" + this.destinationBeaconInfo["unitName"][i];
            this.previousUnitName = this.destinationBeaconInfo["unitName"][i];
          }
          else {
            this.previousUnitName = this.destinationBeaconInfo["unitName"][i];
          }
        }
      }
    }
  }

  checkIfRelated(currentBeacon) {
    let currentBeaconIndex = this.beaconDetails.findIndex(x => x.beaconID == currentBeacon);
    this.currentBeaconInfo = this.beaconDetails[currentBeaconIndex];
    if (this.currentBeaconInfo == null || this.currentBeaconInfo == undefined) {
      this.isRelated = false;
    }
    else {
      this.isRelated = true;
    }
  }

  inputDijkstra() {
    //this.beaconDetails = this.navParams.get('beaconList');
    this.Graph = require('node-dijkstra');
    this.route = new this.Graph();
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
      this.route.addNode(JSON.stringify(this.beaconDetails[i]["beaconID"]), this.relatedBeacon);
    }
  }

}
