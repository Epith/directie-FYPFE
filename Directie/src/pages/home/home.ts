import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
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
  displayMessage: boolean = false;
  currentMessage: String;
  dateTime: any;
  counter: any;
  destination: any;
  currentUnit: any;
  previousUnit: any;
  currentFacility: any;
  previousFacility: any;
  currentBeaconInfo: any;
  destinationBeacon: any;
  destinationFacility: any;
  destinationBeaconInfo: any;
  isRelated: boolean = false;
  constructor(
    public navCtrl: NavController,
    private tts: TextToSpeech,
    private speechRecognition: SpeechRecognition,
    private ibeacon: IBeacon,
    private authProvider: AuthProvider,
    public apiProvider: ApiProvider,
    private keyboard: Keyboard) {
    this.keyboard.disableScroll(true);
    this.detectBeacon();
    this.getBRoute();
  }

  goToBeacon() {
    this.determineDestinationBeacon(this.destination);
    console.log(this.destinationBeacon);
    this.dateTime = new Date().toLocaleString();
    this.determineDestinationFacility(this.destinationBeacon);
    console.log(this.destinationFacility);
    //this.authProvider.uploadTimeStamp(this.counter, this.dateTime, this.currentUnit, this.destination, this.currentUnit, firebase.auth().currentUser.email, false);
    this.navCtrl.push(BeaconPage, {
      currentBeacon: this.currentBeacon,
      destinationBeacon: this.destinationBeacon.toString(),
      beaconList: this.beaconDetails,
      counter: this.counter,
      destinationUnit: this.destination,
      destinationFacility: this.destinationFacility
    });
  }

  ionViewDidLoad() {
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
    var textMsg;
    while (responseAttempt < 3) {
      if (responseAttempt == 0)
        textMsg = "Good morning, Your current location is at Singapore Polytechnic at beacon" + this.currentBeacon + ". May I know where do you want to go?";
      else
        textMsg = "Sorry, no response detected. Your desination please?";

      await this.speakText(textMsg).then(() => { console.log('success') });
      await this.startSpeechRecognition().then((msg) => {
        if (msg == "") {
          responseAttempt++;
          if (responseAttempt == 3)
            this.speakText("Directie in standby mode. Double tap to wake up.");
        }
        else {
          responseAttempt = 3; //End the loop if user spoke
          this.goToBeacon();
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
        this.displayMessage = true;
        this.currentMessage = '';
        this.currentMessage = 'You are currently at beacon ' + this.currentBeacon;
        console.log("is related");
      }
      else {
        console.log("not related");
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
        }, 3000);
        this.sub2 = Observable.interval(500).subscribe((val) => { this.determineUnitAndFacility() });
        console.log(this.beaconDetails);
      });
  }

  determineUnitAndFacility() {
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

  determineDestinationBeacon(destination) {
    for (let i = 0; i < this.beaconDetails.length; i++) {
      for (let k = 0; k < this.beaconDetails[i]["unit"].length; k++) {
        if (destination == this.beaconDetails[i]["unit"][k]) {
          this.destinationBeacon = this.beaconDetails[i]["beaconID"]
        }
      }
    }
  }

  determineDestinationFacility(destination) {
    this.destinationFacility = '';
    let currentBeaconIndex = this.beaconDetails.findIndex(x => x.beaconID == destination);
    this.destinationBeaconInfo = this.beaconDetails[currentBeaconIndex];
    if (this.destinationBeaconInfo != null || this.destinationBeaconInfo != undefined) {
      if (this.destinationBeaconInfo["facility"].length > 0) {
        this.previousFacility = this.destinationBeaconInfo["facility"][0];
        this.destinationFacility = this.destinationBeaconInfo["facility"][0];
        for (let i = 1; i < this.destinationBeaconInfo["facility"].length; i++) {
          if (this.previousFacility != this.destinationBeaconInfo["facility"][i]) {
            this.destinationFacility = this.currentFacility + this.destinationBeaconInfo["facility"][i];
            this.previousFacility = this.destinationBeaconInfo["facility"][i];
          }
          else {
            this.previousFacility = this.destinationBeaconInfo["facility"][i];
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
}
