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
  isFirstScan:boolean=true;
  displayMessage:boolean=false;
  previousBeacon:any;
  previousBeaconIndex:any;
  nextBeaconToGo:any;
  previousNextBeaconAccuracy:any;
  currentNextBeaconAccuracy:any;
  testForRelated:any;
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
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private ibeacon:IBeacon, 
    public alertCtrl:AlertController,
    private tts: TextToSpeech) {
    this.beaconRelation={
      "Beacons":[
        {
          'beaconID':139,
          'beaconInfo': 
            {
              'PB':'',
              'NB':140,
              'DIR':'Go straight',
            },
          'relatedBeacons':[139,140],
          'turningPoint':false
        },
      {
        'beaconID':140,
        'beaconInfo': 
          {
            'PB':139,
            'NB':146,
            'DIR':'Go left'
          },
        'relatedBeacons':[139,140,146],
        'turningPoint':true
      },
      {
        'beaconID':146,
        'beaconInfo': {
          'PB':140,
          'NB':158,
          'DIR':'Go right'
        },
        'relatedBeacons':[140,146,158],
        'turningPoint':true
      },
      {
        'beaconID':158,
        'beaconInfo': [{
          'PB':146,
          'NB':153,
          'DIR':'Turn left'
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
        'beaconInfo': {
          'PB':158,
          'NB':'159',
          'DIR':'Go straight'
        },
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
    this.inputDijkstra();
    this.determineCurrentBeacon();
    this.displayAccuracyMessage=true;
    //this.sub=Observable.interval(5000).subscribe((val)=>{this.displayAccuracyMessage=true;});
    //this.sub=Observable.interval(10000).subscribe((val)=>{this.tts.speak(JSON.stringify(this.accuracyMessage))});
   
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
          data => console.log('didRangeBeaconsInRegion: ', data),
          error => console.error()
        );
      delegate.didStartMonitoringForRegion()
        .subscribe(
          data => console.log('didStartMonitoringForRegion: ', data),
          error => console.error()
        );
      delegate.didEnterRegion()
        .subscribe(
          data => {
            console.log('didEnterRegion: ', data);
          }
        );

      this.beaconRegion = this.ibeacon.BeaconRegion('estimoteBeacon','11111111-1111-1111-1111-111111111111');

      this.ibeacon.startMonitoringForRegion(this.beaconRegion)
        .then(
          () => console.log('Native layer recieved the request to monitoring'),
          error => console.error('Native layer failed to begin monitoring: ', error)
        );
        this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
  }
  
  determineCurrentBeacon(){
        // Request permission to use location on iOS
    this.ibeacon.requestAlwaysAuthorization();
    // create a new delegate and register it with the native layer
    let delegate = this.ibeacon.Delegate();

    // Subscribe to some of the delegate's event handlers
    delegate.didRangeBeaconsInRegion()
      .subscribe(
        data => {
         // console.log('didRangeBeaconsInRegion: ', data)
          if(this.isFirstScan==true){
            if (data.beacons.length > 0) {
              this.pBeaconAccuracy=data.beacons[0]["accuracy"]
              this.testForCurrentBeacon=data.beacons[0]["major"];
              for(let i=1;i<data.beacons.length;i++){
                  if(this.pBeaconAccuracy>data.beacons[i]["accuracy"]){
                    this.pBeaconAccuracy=data.beacons[i]["accuracy"];
                    this.testForCurrentBeacon=data.beacons[i]["major"];
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
               let accuracyIndex=data.beacons.findIndex(x=>x.major==this.arrivedDestination);
                  this.currentAccuracyBeacon=data.beacons[accuracyIndex];
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
                    +'\n Please '+this.directionToGo+' to beacon '+this.nextBeaconToGo
                    +'\n Please be aware that the next beacon is a turning point';
                  }
                  else{
                    this.currentMessage='';
                    this.currentMessage='You are currently at beacon '+this.currentBeacon
                    +'\n Please '+this.directionToGo+' to beacon '+this.nextBeaconToGo
                  }
              }
              this.isFirstScan=false;
              this.previousBeacon=this.currentBeacon;
              this.previousPreviousBeacon=this.previousBeacon;
              let accuracyIndex=data.beacons.findIndex(x=>x.major==this.nextBeaconToGo);
              this.previousAccuracyBeacon=data.beacons[accuracyIndex];
              if(this.previousAccuracyBeacon!=null || this.previousAccuracyBeacon!=undefined){
                this.previousNextBeaconAccuracy=this.previousAccuracyBeacon["accuracy"];
              }
            }//end of if
          }
          else{
            if (data.beacons.length > 0) {
                if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.arrivedDestination)){
                  let accuracyIndex=data.beacons.findIndex(x=>x.major==this.arrivedDestination);
                  this.currentAccuracyBeacon=data.beacons[accuracyIndex];
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
                  let accuracyIndex=data.beacons.findIndex(x=>x.major==this.nextBeaconToGo);
                  this.currentAccuracyBeacon=data.beacons[accuracyIndex];
                  if(this.currentAccuracyBeacon!=null || this.currentAccuracyBeacon!=undefined){
                    this.currentNextBeaconAccuracy=this.currentAccuracyBeacon["accuracy"];
                    this.determineIfUserOnTheRightTrack(this.previousNextBeaconAccuracy,this.currentNextBeaconAccuracy);
                  }
                  console.log(this.previousNextBeaconAccuracy);
                  console.log(this.currentNextBeaconAccuracy); 
              }
              this.pBeaconAccuracy=data.beacons[0]["accuracy"]
              this.testForCurrentBeacon=data.beacons[0]["major"];
              for(let i=1;i<data.beacons.length;i++){
                  if(this.pBeaconAccuracy>data.beacons[i]["accuracy"]){
                    this.pBeaconAccuracy=data.beacons[i]["accuracy"];
                    this.testForCurrentBeacon=data.beacons[i]["major"];
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
              /*this.testForRelated=[];
              this.previousBeaconIndex=this.beaconDetails.findIndex(x=>x.beaconID==this.previousBeacon);
                for(let j=0;j<data.beacons.length;j++){
                  if(this.beaconDetails[this.previousBeaconIndex]["relatedBeacons"].includes(Number(data.beacons[j]["major"]))){
                    this.testForRelated.push(data.beacons[j]);
                  }
                }
                console.log(this.testForRelated);
                if(this.testForRelated.length>0){
                    this.pBeaconAccuracy=this.testForRelated[0]["accuracy"]
                    this.currentBeacon=this.testForRelated[0]["major"];
                    for(let i=1;i<this.testForRelated.length;i++){
                      if(this.pBeaconAccuracy>this.testForRelated[i]["accuracy"]){
                          this.pBeaconAccuracy=this.testForRelated[i]["accuracy"];
                          this.currentBeacon=this.testForRelated[i]["major"];
                      }
                    }//end of for loop
                }
                console.log(this.currentBeacon+"hello");
                */
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
                  }
                  else{
                    this.determinIfTurningPoint(this.nextBeaconToGo);
                    if(this.isTurningPoint==true){
                      this.currentMessage='';
                      this.currentMessage='You are currently at beacon '+this.currentBeacon
                      +'\n Please '+this.directionToGo+' to beacon '+this.nextBeaconToGo
                      +'\n Please be aware that the next beacon is a turning point';
                    }
                    else{
                      this.currentMessage='';
                      this.currentMessage='You are currently at beacon '+this.currentBeacon
                      +'\n Please '+this.directionToGo+' to beacon '+this.nextBeaconToGo
                    }
                    this.displayDestination=false;
                  }
                  this.previousBeacon=this.currentBeacon;
                  this.previousPreviousBeacon=this.previousBeacon;
                }
            }
          }//end of else
      },
        error => console.error()
      );
      this.beaconRegion = this.ibeacon.BeaconRegion('estimoteBeacon','11111111-1111-1111-1111-111111111111');
      this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
      
      /*setTimeout(() => {
        this.stopDetectBeacon();
        //console.log("Nearest beacon: " + this.pBeaconAccuracy + "beaconId: "+ this.currentBeacon);
        //console.log("subsequent beacons");
      }, 11000);
      */
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
          console.log(route.path('139', '159'));

  }

  determineBeaconDirection(previousBeacon,currentBeacon,nextBeacon){
    this.directionToGo='';
    let index=this.beaconDetails.findIndex(x=>x.beaconID==currentBeacon);
    if(this.beaconDetails[index]["beaconInfo"].length>1){
      for(let i=0;i<this.beaconDetails[index]["beaconInfo"].length;i++){
          if(this.beaconDetails[index]["beaconInfo"][i]["PB"]==previousBeacon && this.beaconDetails[index]["beaconInfo"][i]["NB"]==nextBeacon){
            this.directionToGo=this.beaconDetails[index]["beaconInfo"][i]["DIR"];
          }
      }
    }
    else{
      if(this.beaconDetails[index]["beaconInfo"]["PB"]==previousBeacon && this.beaconDetails[index]["beaconInfo"]["NB"]==nextBeacon){
        this.directionToGo=this.beaconDetails[index]["beaconInfo"]["DIR"];
        
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

  createAlert(currentBeacon,nextBeacon,direction){
    if(JSON.stringify(currentBeacon)==JSON.stringify(nextBeacon)){
      let alert = this.alertCtrl.create({
        title: 'Directie',
        message: 'Arrived at destination',
        buttons: ['Ok']
      });
      alert.present();
    }
    else{
      let alert = this.alertCtrl.create({
        title: 'Directie',
        message: 'current beacon: '+currentBeacon+'<br> Next Beacon: '+ nextBeacon
        +'<br> Direction: '+direction,
        buttons: ['Ok']
      });
      alert.present();
    }
  }

  determineIfUserOnTheRightTrack(previousAccuracy,currentAccuracy){
    if(currentAccuracy<=previousAccuracy){
      this.accuracyMessage='';
      this.accuracyMessage='You are walking in the right direction.';
      setTimeout(() => {
        this.previousNextBeaconAccuracy=this.currentNextBeaconAccuracy;
        //this.displayAccuracyMessage=false;
      }, 1000);
    }
    else if(currentAccuracy>previousAccuracy){
      this.accuracyMessage='';
      this.accuracyMessage='You are walking in the wrong direction. Could you please make some adjustments.';
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
      this.accuracyMessage='You are out of range of the destination';
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
 
}
