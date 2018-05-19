import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { BeaconPage } from '../beacon/beacon';

declare let continuoussr: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, private tts: TextToSpeech, private speechRecognition: SpeechRecognition) {
    this.welcomeMsg();
  }

  goToBeacon(){
    this.navCtrl.push(BeaconPage);
  }

  async welcomeMsg() {
    var responseAttempt = 0;
    var textMsg;
    while (responseAttempt < 3) {
      if (responseAttempt == 0)
        textMsg = "Good morning, Your current location is at Singapore Polytechnic. May I know where do you want to go?";
      else
        textMsg = "Sorry, no response detected. Your desination please?";

      await this.speakText(textMsg);

      await this.startSpeechRecognition().then(function (msg) {
        if (msg == "") {
          responseAttempt++;
          if (responseAttempt == 3)
            this.speakText("Directie in standby mode. Double tap to wake up.");
        }
        else if(msg=="toilet") //if the user says he want to go toilet, then it will end
        this.goToBeacon(); //if user responded, then go to beacon
          responseAttempt = 3; //End the loop if user spoke
      });
    }
  }

  speakText(textMsg) {
    return new Promise(resolve => {
      this.tts.speak({ text: textMsg, locale: "en-US" })
        .then()
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
          (matches: Array<string>) => { console.log(matches); resolve(matches) },
          (onerror) => {
            if ((onerror == "No match") || (onerror = "No speech input"))
              resolve("");
            else
              console.log(onerror);
          }
        )
    });
  }

}
