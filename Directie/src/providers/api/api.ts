import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the ApiProvider provider.
  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiProvider {
  apiUrl = 'https://1edfsv6nia.execute-api.ap-southeast-1.amazonaws.com/test';
  
  constructor(public http: HttpClient) {
    console.log('Hello ApiProvider Provider');
  }
  getBRoute(data) {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl+'/Beacon', data, {
        headers: new HttpHeaders().set('x-api-key', 'uzpY6JS0Pk7iI027SSLoI5BgzHXNh8gL59ehRUvy'),
        params: new HttpParams().set('action', 'getBRoute')
      })
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }
  getBeacon(data) {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl+'/Beacon', data, {
        headers: new HttpHeaders().set('x-api-key', 'uzpY6JS0Pk7iI027SSLoI5BgzHXNh8gL59ehRUvy'),
        params: new HttpParams().set('action', 'getBeacon')
      })
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }
  createBeaconDirection(data) {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl+'/BeaconDirection', data, {
        headers: new HttpHeaders().set('x-api-key', 'uzpY6JS0Pk7iI027SSLoI5BgzHXNh8gL59ehRUvy'),
        params: new HttpParams().set('action', 'createBeaconDirection')
      })
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }
}