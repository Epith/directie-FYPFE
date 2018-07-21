import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import firebase from 'firebase';
import { Keyboard } from '@ionic-native/keyboard';


import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { AuthProvider } from '../providers/auth/auth';
import { Unsubscribe } from '@firebase/util';
import { CompassBearingPage } from '../pages/compass-bearing/compass-bearing';
import { ProfilePage } from '../pages/profile/profile'
import { FirebaseAuth } from '@firebase/auth-types';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  pages: Array<{ title: string, component: any }>;

  profilePicURL: any;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public authProvider: AuthProvider, public keyboard: Keyboard) {
    this.initializeApp();

    this.keyboard.disableScroll(true);
    // used for an example of ngFor and navigation


    firebase.initializeApp({
      apiKey: "AIzaSyAVpnGuapjU3HaCGa-CmBHidWrOGV2RSBI",
      authDomain: "pwa-firebase-hosting.firebaseapp.com",
      databaseURL: "https://pwa-firebase-hosting.firebaseio.com",
      projectId: "pwa-firebase-hosting",
      storageBucket: "pwa-firebase-hosting.appspot.com",
      messagingSenderId: "72415286155"
    });


    const unsubscribe: Unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        firebase.auth().fetchSignInMethodsForEmail(user.email).then(data => {
          if (data.toString() == "facebook.com" || data.toString() == "google.com"){
            this.profilePicURL=user.photoURL;
          }
          else{
            this.profilePicURL="https://firebasestorage.googleapis.com/v0/b/pwa-firebase-hosting.appspot.com/o/images%2FProfilePicture%2Fpp.png?alt=media&token=e9fae8f6-516a-425f-9cd4-f2009cc1dd2f";
          }
        });
        if (user.email == "test@gmail.com") {
          this.pages = [
            { title: 'Home', component: HomePage },
            { title: 'Compass', component: CompassBearingPage },
            { title: 'Edit Profile', component: ProfilePage }
          ];
        }
        else {
          this.pages = [
            { title: 'Home', component: HomePage },
            { title: 'Edit Profile', component: ProfilePage }
          ];
        }
        this.rootPage = HomePage;
      } else {
        this.rootPage = LoginPage;
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  async logOut(): Promise<void> {
    await this.authProvider.logoutUser();
    firebase.auth().signOut().then(function () {
      // Sign-out successful.
    }).catch(function (error) {
      // An error happened.
    });
    this.nav.setRoot(LoginPage);
  }
}
