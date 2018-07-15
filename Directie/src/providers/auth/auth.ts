import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { User, UserCredential } from '@firebase/auth-types';

@Injectable()
export class AuthProvider {
  private counter: any;
  constructor() { }

  loginUser(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  async signupUser(email: string, password: string, gender: string, dob: string): Promise<firebase.auth.UserCredential> {
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
          password: password,
          gender: gender,
          dateOfBirth: dob
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

  uploadTimeStamp(dateTime) {
    const ref = firebase.database().ref('/TimeStamp/');
    firebase.database()
      .ref('/TimeStamp')
      .child(ref.push().key)
      .set(dateTime);
  }

  readCounter() {
    /*return firebase.database().ref('/Counter').once('value').then(snapshot=> {
      this.counter=snapshot.val();
      console.log(this.counter);
    });
    */
    var counterRef = firebase.database().ref('/Counter');
    counterRef.on('value', snapshot=> {
      console.log(snapshot.val());
    });
  }


}
