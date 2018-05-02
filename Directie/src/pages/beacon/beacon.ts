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
  previousBeacon:any;
  nextBeaconToGo:any;
  constructor(public navCtrl: NavController, public navParams: NavParams, private ibeacon:IBeacon, public alertCtrl:AlertController) {
    this.beaconRelation={
      "Beacons":[
        {
          'beaconID':139,
          'beaconInfo': 
            {
              'PB':'',
              'NB':140,
              'DIR':'go straight',
            },
          'relatedBeacons':[140]
        },
      {
        'beaconID':140,
        'beaconInfo': 
          {
            'PB':139,
            'NB':146,
            'DIR':'go straight'
          },
        'relatedBeacons':[139,140,146]
      },
      {
        'beaconID':146,
        'beaconInfo': {
          'PB':140,
          'NB':158,
          'DIR':'go straight'
        },
        'relatedBeacons':[140,146,158]
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
        'relatedBeacons':[146,153,158,156]
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
            for(let pathCounter=0;pathCounter<this.shortestPath.length;pathCounter++){
              if(JSON.stringify(this.currentBeacon)==JSON.stringify(this.shortestPath[pathCounter])){
                this.nextBeaconToGo=this.shortestPath[pathCounter+1];
              }
            }
            let alert = this.alertCtrl.create({
              title:'Directie',
              subTitle: 'current beacon: '+this.currentBeacon+'<br> Next Beacon: '+this.nextBeaconToGo,
              buttons:['OK']
            });
            alert.present();
            console.log("Nearest beacon: " + this.pBeaconAccuracy + "beaconId: "+ this.currentBeacon);
            this.isFirstScan=false;
            this.previousBeacon=this.currentBeacon;
            console.log(this.previousBeacon);
            console.log(this.shortestPath);
          }
          else{
            console.log("second scan");
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
    //let obj={ B:1 };
   /* route.addNode('139', {140:1});
    route.addNode('140', {139:1,146:1});
    route.addNode('146', { 140:1, 158:1});
    route.addNode('158', { 146:1});
    //route.addNode('D', { C:1, B:4 });
    
    this.shortestPath=route.path('140', '158');

    console.log(this.shortestPath);
    
    */
    /*
    */
        for(let i=0;i<this.beaconDetails.length;i++){
          this.relatedBeacon={};
          if(this.beaconDetails[i]["relatedBeacons"].length>=1){
            for(let j=0;j<this.beaconDetails[i]["relatedBeacons"].length;j++){
              if(j==0){
                this.relatedBeacon[this.beaconDetails[i]["relatedBeacons"][j]]=1;
                //this.relatedBeacon="{"+this.beaconDetails[i]["relatedBeacons"][j]+":1";
              }
              else{
                this.relatedBeacon[this.beaconDetails[i]["relatedBeacons"][j]]=1;
                //this.relatedBeacon=this.relatedBeacon+", "+this.beaconDetails[i]["relatedBeacons"][j]+":1";
              }
            }
          }
          route.addNode(JSON.stringify(this.beaconDetails[i]["beaconID"]),this.relatedBeacon);
          let obj2=this.relatedBeacon;
          //let obj3={151:1,152:1};
          //console.log(obj);
          //console.log(obj3);
          console.dir("beaconID:"+this.beaconDetails[i]["beaconID"]+"related: "+(this.relatedBeacon));
          console.log(obj2);
          
          //console.log(this.relationTest);
          //console.log(this.beaconDetails[i]["relatedBeacons"][0]);
          //console.log(this.beaconDetails[i]["beaconID"]+","+obj2)
        }
        
        this.shortestPath=route.path('139', '156');
          console.log(route.path('139', '156'));
          /* const graph = new Map()
      
      const a = new Map()
      a.set('B', 1)
      
      const b = new Map()
      b.set('A', 1)
      b.set('C', 2)
      b.set('D', 4)
      
      graph.set('A', a)
      graph.set('B', b);
      
      const route = new Graph(graph)
      */
  }
 
}
