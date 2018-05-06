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

/**
 * Generated class for the BeaconPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var require: any;
declare var Graph: any;
declare var graph: any;
declare var Map:any;
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
  nextBeaconToGo:any;
  testForRelated:any;
  arrivedDestination:any;
  directionToGo:String;
  constructor(public navCtrl: NavController, public navParams: NavParams, private ibeacon:IBeacon, public alertCtrl:AlertController) {
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
          'relatedBeacons':[139,140]
        },
      {
        'beaconID':140,
        'beaconInfo': 
          {
            'PB':139,
            'NB':146,
            'DIR':'Go right'
          },
        'relatedBeacons':[139,140,146]
      },
      {
        'beaconID':146,
        'beaconInfo': {
          'PB':140,
          'NB':158,
          'DIR':'Go straight'
        },
        'relatedBeacons':[140,146,158]
      },
      {
        'beaconID':158,
        'beaconInfo': [{
          'PB':146,
          'NB':153,
          'DIR':'Turn right'
        },
        {
          'PB':146,
          'NB':156,
          "DIR":'Turn left'
        }],
        'relatedBeacons':[146,153,158,156]
      },
      {
        'beaconID':153,
        'beaconInfo': {
          'PB':158,
          'NB':'159',
          'DIR':'Go straight'
        },
        'relatedBeacons':[153,158,159]
      },
      {
        'beaconID':156,
        'beaconInfo': {
          'PB':158,
          'NB':'',
          'DIR':'Go straight'
        },
        'relatedBeacons':[156,158]
      },
      {
        'beaconID':159,
        'beaconInfo': {
          'PB':153,
          'NB':'',
          'DIR':'Go straight'
        },
        'relatedBeacons':[153,159]
      }
    ]
  }
    this.beaconDetails=this.beaconRelation["Beacons"];
    this.inputDijkstra();
    this.determineCurrentBeacon();
    //this.sub=Observable.interval(15000).subscribe((val)=>{this.determineCurrentBeacon()})
  }

  ionViewDidLoad() {
    console.dir(this.beaconDetails);
  }

  ionViewDidLeave(){
    this.isFirstScan=true;
    this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion);
    this.displayMessage=false;
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
          //console.log('didRangeBeaconsInRegion: ', data.beacons[0]['accuracy'])
          if(this.isFirstScan==true){
            if (data.beacons.length > 0) {
              this.pBeaconAccuracy=data.beacons[0]["accuracy"]
              this.currentBeacon=data.beacons[0]["major"];
              for(let i=1;i<data.beacons.length;i++){
                  if(this.pBeaconAccuracy>data.beacons[i]["accuracy"]){
                    this.pBeaconAccuracy=data.beacons[i]["accuracy"];
                    this.currentBeacon=data.beacons[i]["major"];
                  }
              }
            }
            for(let pathCounter=0;pathCounter<this.shortestPath.length;pathCounter++){
              if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.shortestPath[pathCounter])){
                this.nextBeaconToGo=this.shortestPath[pathCounter+1];
              }
              else if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.shortestPath[this.shortestPath.length-1])){
                this.arrivedDestination=this.shortestPath[this.shortestPath.length-1];
              }
            }
            if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.arrivedDestination)){
              this.createAlert(this.currentBeacon,this.arrivedDestination,"");
            }
            else{
              this.createAlert(this.currentBeacon,this.nextBeaconToGo,"Go Straight");
            }
            this.isFirstScan=false;
            this.displayMessage=true;
            this.directionToGo="Go Straight";
            this.previousBeacon=this.currentBeacon;
          }
          else{
            if (data.beacons.length > 0) {
              this.testForRelated=[];
              let index=this.beaconDetails.findIndex(x=>x.beaconID==this.previousBeacon);
                  // this.testForRelated.splice(1,1);
                    for(let j=0;j<data.beacons.length;j++){
                      if(this.beaconDetails[index]["relatedBeacons"].includes(Number(data.beacons[j]["major"]))){
                        this.testForRelated.push(data.beacons[j]);
                        console.log(this.testForRelated);
                        console.log("after splice");
                      }
                    }
                this.pBeaconAccuracy=this.testForRelated[0]["accuracy"]
                this.currentBeacon=this.testForRelated[0]["major"];
                for(let i=1;i<this.testForRelated.length;i++){
                    if(this.pBeaconAccuracy>this.testForRelated[i]["accuracy"]){
                      this.pBeaconAccuracy=this.testForRelated[i]["accuracy"];
                      this.currentBeacon=this.testForRelated[i]["major"];
                    }
                }//end of for loop
                if(this.nextBeaconToGo==this.currentBeacon){
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
                    this.createAlert(this.currentBeacon,this.arrivedDestination,"");
                  }
                  else{
                    this.createAlert(this.currentBeacon,this.nextBeaconToGo,this.directionToGo);
                  }
                  this.previousBeacon=this.currentBeacon;
                }
            }
          }
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
        
        this.shortestPath=route.path('139', '159');
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
        console.log(this.directionToGo);
      }
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
 
}
