import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { BeaconPage } from '../beacon/beacon';
import { CompassBearingPage} from '../compass-bearing/compass-bearing';
import { IBeacon } from '@ionic-native/ibeacon';
import {Observable} from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  getCurrenBeacons:any=[];
  beaconRegion: any;
  beaconUUID = '11111111-1111-1111-1111-111111111111';
  sub:Subscription;
  testForCurrentBeacon:any;
  pBeaconAccuracy: any;
  currentBeacon: any;
  displayMessage:boolean=false;
  currentMessage:String;
  constructor(
    public navCtrl: NavController, 
    private tts: TextToSpeech, 
    private speechRecognition: SpeechRecognition,
    private ibeacon:IBeacon) 
    {
      this.detectBeacon();
      this.sub=Observable.interval(500).subscribe((val)=>{this.determineCurrentBeacon()});
      setTimeout(() => {
        this.welcomeMsg();
      }, 1600);
      
  }

  goToBeacon(){
    this.navCtrl.push(BeaconPage,{
      data: this.currentBeacon
    });
  }

  ionViewDidLoad() {
    this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
    this.detectBeacon();
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
        textMsg = "Good morning, Your current location is at Singapore Polytechnic at beacon"+this.currentBeacon+". May I know where do you want to go?";
      else
        textMsg = "Sorry, no response detected. Your desination please?";

      await this.speakText(textMsg).then(()=>{console.log('success')});
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
        .then(()=>{resolve()})
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

  detectBeacon(){
            // Request permission to use location on iOS
        this.ibeacon.requestAlwaysAuthorization();
        // create a new delegate and register it with the native layer
        let delegate = this.ibeacon.Delegate();

        // Subscribe to some of the delegate's event handlers
        delegate.didRangeBeaconsInRegion()
          .subscribe(
            data => {
              if(data.beacons.length > 0){
                for(let i=0;i<data.beacons.length;i++){
                  if(this.getCurrenBeacons.findIndex(x=>x.major==data.beacons[i]["major"])!=-1){
                    let index=this.getCurrenBeacons.findIndex(x=>x.major==data.beacons[i]["major"]);
                    this.getCurrenBeacons[index]=data.beacons[i];
                  }
                  else if(this.getCurrenBeacons.findIndex(x=>x.major==data.beacons[i]["major"])==-1){
                    this.getCurrenBeacons.push(data.beacons[i])
                  }
                }
                console.log(this.getCurrenBeacons);
              }
            },
            error => console.error()
          );

        this.beaconRegion = this.ibeacon.BeaconRegion('estimoteBeacon','11111111-1111-1111-1111-111111111111');
        this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
    }

    determineCurrentBeacon(){    
      // console.log('didRangeBeaconsInRegion: ', data)
         if (this.getCurrenBeacons.length > 0) {
           this.pBeaconAccuracy=this.getCurrenBeacons[0]["accuracy"]
           this.testForCurrentBeacon=this.getCurrenBeacons[0]["major"];
           for(let i=1;i<this.getCurrenBeacons.length;i++){
               if(this.pBeaconAccuracy>this.getCurrenBeacons[i]["accuracy"]){
                 this.pBeaconAccuracy=this.getCurrenBeacons[i]["accuracy"];
                 this.testForCurrentBeacon=this.getCurrenBeacons[i]["major"];
               }
           }
           this.currentBeacon=this.testForCurrentBeacon;
           this.displayMessage=true;
           this.currentMessage='';
           this.currentMessage='You are currently at beacon '+this.currentBeacon;
         }//end of if
      }

      goToCompass(){
        this.navCtrl.push(CompassBearingPage);
      }
}
