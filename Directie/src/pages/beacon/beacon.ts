import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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
  relationTest:{};
  constructor(public navCtrl: NavController, public navParams: NavParams, private ibeacon:IBeacon) {
    this.beaconRelation={
      "Beacons":[
      {
        'beaconID':140,
        'beaconInfo': 
          {
            'PB':139,
            'NB':146,
            'DIR':'go straight'
          },
        'relatedBeacons':[139,146]
      },
      {
        'beaconID':146,
        'beaconInfo': {
          'PB':140,
          'NB':158,
          'DIR':'go straight'
        },
        'relatedBeacons':[140,158]
      },
      {
        'beaconID':158,
        'beaconInfo': [{
          'PB':146,
          'NB':153,
          'DIR':'turn right'
        },
        {
          'PB':146,
          'NB':156,
          "DIR":'turn left'
        }],
        'relatedBeacons':[146,153,156]
      }
    ]
  }
    this.sub=Observable.interval(15000).subscribe((val)=>{this.determineCurrentBeacon()})
    //this.determineCurrentBeacon();
    this.beaconDetails=this.beaconRelation["Beacons"];
    this.inputDijkstra();
  }

  ionViewDidLoad() {
    console.dir(this.beaconDetails);
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
      if (data.beacons.length > 0) {
        for(let i=0;i<data.beacons.length;i++){
          if(i==0){
            this.pBeaconAccuracy=data.beacons[i]["accuracy"]
            this.currentBeacon=data.beacons[i]["major"];
          }
          else{
            if(this.pBeaconAccuracy>data.beacons[i]["accuracy"]){
              this.pBeaconAccuracy=data.beacons[i]["accuracy"];
              this.currentBeacon=data.beacons[i]["major"];
            }
          }
        }
      }
  },
    error => console.error()
  );
    this.beaconRegion = this.ibeacon.BeaconRegion('estimoteBeacon','11111111-1111-1111-1111-111111111111');
  this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion);
  setTimeout(() => {
    this.stopDetectBeacon();
    console.log("Nearest beacon: " + this.pBeaconAccuracy + "beaconId: "+ this.currentBeacon);
  }, 2500);

  }
  stopDetectBeacon(){
    this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion);
  }
  
  inputDijkstra(){
    const Graph = require('node-dijkstra');
 
    const route = new Graph();
    /*
    route.addNode('A', { B:1 });
    route.addNode('B', { A:1, C:2, D: 4 });
    route.addNode('C', { B:2, D:1 });
    route.addNode('D', { C:1, B:4 });
    
    this.shortestPath=route.path('A', 'D');

    console.log(this.shortestPath[0]);
    */
   for(let i=0;i<this.beaconDetails.length;i++){
    this.relatedBeacon={};
     if(this.beaconDetails[i]["relatedBeacons"].length>1){
       for(let j=0;j<this.beaconDetails[i]["relatedBeacons"].length;j++){
         if(j==0){
          this.relatedBeacon=this.beaconDetails[i]["relatedBeacons"][j]+":1";
         }
         else{
           this.relatedBeacon=this.relatedBeacon+", "+this.beaconDetails[i]["relatedBeacons"][j]+":1";
         }
       }
     }
     this.relationTest=JSON.stringify(this.relatedBeacon);
     console.log("beaconID:"+this.beaconDetails[i]["beaconID"]+"related: "+this.relatedBeacon);
     //route.addNode(this.beaconDetails[i]["beaconID"],this.relatedBeacon);
     console.log(this.relationTest);
     //console.log(this.beaconDetails[i]["relatedBeacons"][0]);
   }
   this.shortestPath=route.path(140, 153);
     console.log(this.shortestPath);
  }

}
