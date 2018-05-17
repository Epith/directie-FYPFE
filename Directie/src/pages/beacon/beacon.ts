import { Component } from '@angular/core';
import { Alert,
  AlertController,
  IonicPage,
  Loading,
  LoadingController,
  NavController,
  NavParams } from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';
import {Observable} from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { ApiProvider } from '../../providers/api/api';

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
  sub:Subscription;
  sub2:Subscription;
  isFirstScan:boolean=true;
  displayMessage:boolean=false;
  previousBeacon:any;
  previousBeaconIndex:any;
  nextBeaconToGo:any;
  previousNextBeaconAccuracy:any;
  currentNextBeaconAccuracy:any;
  getCurrenBeacons:any=[];
  arrivedDestination:any;
  directionToGo:String;
  accuracyMessage:String;
  displayAccuracyMessage:boolean=false;
  displayDestination:boolean=false;
  destinationMessage:String;
  previousAccuracyBeacon:any;
  currentAccuracyBeacon:any;
  isTurningPoint:boolean=false;
  turningPointBeacon:any;
  currentMessage:String;
  testForCurrentBeacon:any;
  previousPreviousBeacon:any;
  ifGetFirstCurrentBeacons:boolean=true;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private ibeacon:IBeacon, 
    public alertCtrl:AlertController,
    public apiProvider:ApiProvider,
    private tts: TextToSpeech) {
    this.getBRelation();
    this.detectBeacon();
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
      this.displayAccuracyMessage=true;
      this.sub=Observable.interval(500).subscribe((val)=>{this.determineCurrentBeacon()});
      this.sub2=Observable.interval(2500).subscribe((val)=>{this.determineIfUserOnTheRightTrack(this.previousNextBeaconAccuracy,this.currentNextBeaconAccuracy)});
      console.log(this.beaconDetails);
    });
  }
  ionViewDidLoad() {
    this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
  }

  ionViewDidLeave(){
    this.isFirstScan=true;
    this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion);
    this.displayMessage=false;
    this.displayAccuracyMessage=false;
    //this.sub.unsubscribe();
    this.displayDestination=false;
  }

  ionViewWillEnter() {
      this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
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
          if(this.isFirstScan==true){
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
              for(let pathCounter=0;pathCounter<this.shortestPath.length;pathCounter++){
                if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.shortestPath[pathCounter])){
                  this.nextBeaconToGo=this.shortestPath[pathCounter+1];
                }
                else if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.shortestPath[this.shortestPath.length-1])){
                  this.arrivedDestination=this.shortestPath[this.shortestPath.length-1];
                }
              }
              if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.arrivedDestination)){
               this.displayDestination=true;
               this.destinationMessage="Arrived at destination beacon "+this.currentBeacon;
               this.tts.speak(JSON.stringify(this.destinationMessage));
               let accuracyIndex=this.getCurrenBeacons.findIndex(x=>x.major==this.arrivedDestination);
                  this.currentAccuracyBeacon=this.getCurrenBeacons[accuracyIndex];
                  if(this.currentAccuracyBeacon!=null||this.currentAccuracyBeacon!=undefined){
                    this.currentNextBeaconAccuracy=this.currentAccuracyBeacon["accuracy"];
                    this.determineIfUserAtDestination(this.currentNextBeaconAccuracy);
                  }
              }
              else{
                this.displayMessage=true;
                this.directionToGo="Go Straight";
                this.determinIfTurningPoint(this.nextBeaconToGo);
                  if(this.isTurningPoint==true){
                    this.currentMessage='';
                    this.currentMessage='You are currently at beacon '+this.currentBeacon
                    +' Please '+this.directionToGo+' to beacon '+this.nextBeaconToGo
                    +' Please be aware that the next beacon is a turning point';
                    this.tts.speak(JSON.stringify(this.currentMessage));
                  }
                  else{
                    this.currentMessage='';
                    this.currentMessage='You are currently at beacon '+this.currentBeacon
                    +' Please '+this.directionToGo+' to beacon '+this.nextBeaconToGo;
                    this.tts.speak(JSON.stringify(this.currentMessage));
                  }
              }
              this.isFirstScan=false;
              this.previousBeacon=this.currentBeacon;
              this.previousPreviousBeacon=this.previousBeacon;
              let accuracyIndex=this.getCurrenBeacons.findIndex(x=>x.major==this.nextBeaconToGo);
              this.previousAccuracyBeacon=this.getCurrenBeacons[accuracyIndex];
              if(this.previousAccuracyBeacon!=null || this.previousAccuracyBeacon!=undefined){
                this.previousNextBeaconAccuracy=this.previousAccuracyBeacon["accuracy"];
              }
            }//end of if
          }
          else{
            if (this.getCurrenBeacons.length > 0) {
                if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.arrivedDestination)){
                  let accuracyIndex=this.getCurrenBeacons.findIndex(x=>x.major==this.arrivedDestination);
                  this.currentAccuracyBeacon=this.getCurrenBeacons[accuracyIndex];
                  if(this.currentAccuracyBeacon!=null||this.currentAccuracyBeacon!=undefined){
                    this.currentNextBeaconAccuracy=this.currentAccuracyBeacon["accuracy"];
                    this.determineIfUserAtDestination(this.currentNextBeaconAccuracy);
                  }
                  console.log("already at destination");
                  console.log(this.previousNextBeaconAccuracy);
                  console.log(this.currentNextBeaconAccuracy);
                  console.log(this.accuracyMessage); 
              }
              else{
                  let accuracyIndex=this.getCurrenBeacons.findIndex(x=>x.major==this.nextBeaconToGo);
                  this.currentAccuracyBeacon=this.getCurrenBeacons[accuracyIndex];
                  if(this.currentAccuracyBeacon!=null || this.currentAccuracyBeacon!=undefined){
                    this.currentNextBeaconAccuracy=this.currentAccuracyBeacon["accuracy"];
                  }
                  console.log(this.previousNextBeaconAccuracy);
                  console.log(this.currentNextBeaconAccuracy); 
              }
              this.pBeaconAccuracy=this.getCurrenBeacons[0]["accuracy"]
              this.testForCurrentBeacon=this.getCurrenBeacons[0]["major"];
              for(let i=1;i<this.getCurrenBeacons.length;i++){
                  if(this.pBeaconAccuracy>this.getCurrenBeacons[i]["accuracy"]){
                    this.pBeaconAccuracy=this.getCurrenBeacons[i]["accuracy"];
                    this.testForCurrentBeacon=this.getCurrenBeacons[i]["major"];
                  }
              }
              if(this.shortestPath.includes(this.testForCurrentBeacon)){
                this.previousBeaconIndex=this.beaconDetails.findIndex(x=>x.beaconID==this.previousBeacon);
                let previousPreviousIndex=this.shortestPath.indexOf(this.previousPreviousBeacon);
                console.log(previousPreviousIndex+1);
                console.log(this.shortestPath);
                if(this.beaconDetails[this.previousBeaconIndex]["relatedBeacons"].includes(Number(this.testForCurrentBeacon))){
                  this.currentBeacon=this.testForCurrentBeacon;
                }
                else if(this.beaconDetails[previousPreviousIndex+1]["relatedBeacons"].includes(Number(this.testForCurrentBeacon))){
                  this.previousBeacon=this.shortestPath[this.previousBeaconIndex+1];
                  this.currentBeacon=this.testForCurrentBeacon;
                  for(let pathCounter=0;pathCounter<this.shortestPath.length;pathCounter++){
                    if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.shortestPath[pathCounter])){
                      this.nextBeaconToGo=this.shortestPath[pathCounter];
                    }
                    else if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.shortestPath[(this.shortestPath.length-1)])){
                      this.arrivedDestination=this.shortestPath[this.shortestPath.length-1];
                    }
                  }//end of for loop
                }
              }
                if(this.currentBeacon==this.nextBeaconToGo){
                  for(let pathCounter=0;pathCounter<this.shortestPath.length;pathCounter++){
                      if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.shortestPath[pathCounter])){
                        this.nextBeaconToGo=this.shortestPath[pathCounter+1];
                      }
                      else if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.shortestPath[(this.shortestPath.length-1)])){
                        this.arrivedDestination=this.shortestPath[this.shortestPath.length-1];
                      }
                  }//end of for loop
                  this.determineBeaconDirection(this.previousBeacon,this.currentBeacon,this.nextBeaconToGo);
                  if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.arrivedDestination)){
                      this.displayMessage=false;
                      this.displayDestination=true;
                      this.accuracyMessage='';
                      this.destinationMessage="Arrived at destination beacon "+this.currentBeacon;
                      this.tts.speak(JSON.stringify(this.destinationMessage));
                  }
                  else{
                    this.determinIfTurningPoint(this.nextBeaconToGo);
                    if(this.isTurningPoint==true){
                      this.currentMessage='';
                      this.currentMessage='You are currently at beacon '+this.currentBeacon
                      +' Please '+this.directionToGo+' to beacon '+this.nextBeaconToGo
                      +' Please be aware that the next beacon is a turning point';
                      this.tts.speak(JSON.stringify(this.currentMessage));
                    }
                    else{
                      this.currentMessage='';
                      this.currentMessage='You are currently at beacon '+this.currentBeacon
                      +' Please '+this.directionToGo+' to beacon '+this.nextBeaconToGo;
                      this.tts.speak(JSON.stringify(this.currentMessage));
                    }
                    this.displayDestination=false;
                  }
                  this.previousBeacon=this.currentBeacon;
                  this.previousPreviousBeacon=this.previousBeacon;
                  this.getCurrenBeacons=[];
                }
            }
          }//end of else
  }

  stopDetectBeacon(){
    this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion);
  }
  
  inputDijkstra(){
     const Graph = require('node-dijkstra');
     const route = new Graph();
        for(let i=0;i<this.beaconDetails.length;i++){
          this.relatedBeacon={};
          if(this.beaconDetails[i]["relatedBeacons"].length>=1){
            for(let j=0;j<this.beaconDetails[i]["relatedBeacons"].length;j++){
              if(j==0){
                this.relatedBeacon[this.beaconDetails[i]["relatedBeacons"][j]]=1;
              }
              else{
                this.relatedBeacon[this.beaconDetails[i]["relatedBeacons"][j]]=1;
              }
            }
          }
          route.addNode(JSON.stringify(this.beaconDetails[i]["beaconID"]),this.relatedBeacon);
          console.dir("beaconID:"+this.beaconDetails[i]["beaconID"]+"related: "+(this.relatedBeacon));
        }
        
        this.shortestPath=route.path('139', '153');

  }

  determineBeaconDirection(previousBeacon,currentBeacon,nextBeacon){
    this.directionToGo='';
    let index=this.beaconDetails.findIndex(x=>x.beaconID==currentBeacon);
    if(this.beaconDetails[index]["beaconInfo"].length>=1){
      for(let i=0;i<this.beaconDetails[index]["beaconInfo"].length;i++){
          if(this.beaconDetails[index]["beaconInfo"][i]["PB"]==previousBeacon && this.beaconDetails[index]["beaconInfo"][i]["NB"]==nextBeacon){
            this.directionToGo=this.beaconDetails[index]["beaconInfo"][i]["DIR"];
          }
      }
    }
  }//end of determineBeaconDirection

  determinIfTurningPoint(nextBeacon){
    let index=this.beaconDetails.findIndex(x=>x.beaconID==nextBeacon);
    this.turningPointBeacon=this.beaconDetails[index];
    if(this.turningPointBeacon!=null || this.turningPointBeacon!=undefined){
      this.isTurningPoint=this.beaconDetails[index]["turningPoint"];
    }
  }


  determineIfUserOnTheRightTrack(previousAccuracy,currentAccuracy){
    if(currentAccuracy<=previousAccuracy){
      this.accuracyMessage='';
      this.accuracyMessage='You are walking in the right direction.';
      this.previousNextBeaconAccuracy=this.currentNextBeaconAccuracy;
        //this.displayAccuracyMessage=false;
    }
    else if(currentAccuracy>previousAccuracy){
      this.accuracyMessage='';
      this.accuracyMessage='You are walking in the wrong direction, could you please make some adjustments';
      this.previousNextBeaconAccuracy=this.currentNextBeaconAccuracy;
        //this.displayAccuracyMessage=false;
    }
    else{
      this.previousNextBeaconAccuracy=this.currentNextBeaconAccuracy;
    }
  }

  determineIfUserAtDestination(currentAccuracy){
    if(currentAccuracy<=1){
      this.accuracyMessage='';
      this.accuracyMessage='You are at the destination';
      setTimeout(() => {
        this.previousNextBeaconAccuracy=this.currentNextBeaconAccuracy;
       // this.displayAccuracyMessage=false;
      }, 1000);
    }
    else if(currentAccuracy>1){
      this.accuracyMessage='';
      this.accuracyMessage='You are further from the destination';
      setTimeout(() => {
        this.previousNextBeaconAccuracy=this.currentNextBeaconAccuracy;
        //this.displayAccuracyMessage=false;
      }, 1000);
    }
    else{
      setTimeout(() => {
        this.previousNextBeaconAccuracy=this.currentNextBeaconAccuracy;
        //this.displayAccuracyMessage=false;
      }, 1000);
    }
  }

  readMessage(){
    this.tts.speak(JSON.stringify(this.currentMessage));
    
  }

  readAccuracyMessage(){
    this.tts.speak(JSON.stringify(this.accuracyMessage));
  }

  readDestinationMessage(){
    this.tts.speak(JSON.stringify(this.destinationMessage));
  }
 
}
