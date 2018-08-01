import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { User, UserCredential } from '@firebase/auth-types';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable()
export class AuthProvider {
  private counter: any;
  public cameraImage: String;
  profileURL: any;
  constructor() { }

  loginUser(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  async signupUser(email: string, password: string, gender: string, dob: string, name: string, login: string): Promise<firebase.auth.UserCredential> {
    try {
      const newUser: UserCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);

      await firebase
        .database()
        .ref('/userProfile')
        .child(firebase.auth().currentUser.uid)
        .set({
          email: email,
          password: Md5.hashStr(password),
          gender: gender,
          dateOfBirth: dob,
          name: name,
          role: 'User',
          loginType: login,
          profileURL: 'https://firebasestorage.googleapis.com/v0/b/pwa-firebase-hosting.appspot.com/o/images%2FProfilePicture%2Fpp.png?alt=media&token=e9fae8f6-516a-425f-9cd4-f2009cc1dd2f'
        });
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  resetPassword(email: string): Promise<void> {
    return firebase.auth().sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<void> {
    return firebase.auth().signOut();
  }

  uploadTimeStamp(route, counter, dateTime, startLocation, destination, currentLocation, user, routeComplete, data) {
    firebase.database()
      .ref('/TimeStamp')
      .child(counter)
      .set({
        Beacons: route,
        startTime: dateTime,
        endTime: "",
        Origin: currentLocation,
        Destination: destination,
        routeCompleted: routeComplete,
        User: user
      }).then(value => {
        const ref2 = firebase.database().ref('/TimeStamp/' + counter + "/");
        firebase.database()
          .ref('/TimeStamp/' + counter)
          .child("Nodes")
          .set(data)
      });
  }

  updateTimeStamp(counter, data) {
    firebase.database()
      .ref('/TimeStamp/')
      .child(counter)
      .child("Nodes")
      .set(data);
  }

  updateEndTime(counter, dateTime) {
    firebase.database()
      .ref('/TimeStamp/')
      .child(counter)
      .update({
        endTime: dateTime
      });
  }

  updateTimeStampDestination(counter,dateTime,data,routeComplete) {
    var postData={
      Nodes: data,
      endTime: dateTime,
      routeCompleted: routeComplete
    };
    firebase.database()
      .ref('/TimeStamp/')
      .child(counter)
      .update(postData);
  }

  insertSocialAccount(email: string, password: string, gender: string, dob: string, name: string, login: string) {
    firebase
      .database()
      .ref('/userProfile')
      .child(firebase.auth().currentUser.uid)
      .set({
        email: email,
        password: Md5.hashStr(password),
        gender: gender,
        dateOfBirth: dob,
        name: name,
        role: 'User',
        loginType: login,
        profileURL: 'https://firebasestorage.googleapis.com/v0/b/pwa-firebase-hosting.appspot.com/o/images%2FProfilePicture%2Fpp.png?alt=media&token=e9fae8f6-516a-425f-9cd4-f2009cc1dd2f'
      });
  }

  readCounter() {
    //read once
    /*return firebase.database().ref('/Counter').once('value').then(snapshot=> {
      this.counter=snapshot.val();
      console.log(this.counter);
    });
    */
    /*var counterRef = firebase.database().ref('/Counter');
    counterRef.on('value', snapshot => {
      return snapshot.val();
    });
    */
  }

  updateCounter(counter) {
    const ref = firebase.database().ref('/Counter');
    ref.set(counter);
  }

  uploadImage(imageString): Promise<any> {
    let image: string = firebase.auth().currentUser.uid + '.jpg',
      storageRef: firebase.storage.Reference,
      parseUpload: any;

    return new Promise((resolve, reject) => {
      storageRef = firebase.storage().ref('images/').child('ProfilePicture/' + image);
      parseUpload = storageRef.putString(imageString, 'data_url');

      parseUpload.on('state_changed', (snapshot) => {
        // We could log the progress here IF necessary
        //console.log(storageRef.getDownloadUrl());
      },
        (_err) => {
          reject(_err);
        },
        (success) => {
          resolve(storageRef.getDownloadURL());
        });
    });
  }

  updateImageURL(imageURL) {
    var postData = {
      profileURL: imageURL
    };
    var profileRef = firebase.database().ref('/userProfile/' + firebase.auth().currentUser.uid);
    profileRef.update(postData);
  }

  updateUserAccount(name, dob, gender, imageURL) {
    var postData = {
      name: name,
      dateOfBirth: dob,
      gender: gender,
      profileURL: imageURL
    };
    var profileRef = firebase.database().ref('/userProfile/' + firebase.auth().currentUser.uid);
    profileRef.update(postData);
  }

}
