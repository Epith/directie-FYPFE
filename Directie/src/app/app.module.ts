import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { SignupPage } from '../pages/signup/signup';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { BeaconPage } from '../pages/beacon/beacon';
import { CompassBearingPage } from '../pages/compass-bearing/compass-bearing';
import { ProfilePage } from '../pages/profile/profile';

import { Keyboard } from '@ionic-native/keyboard';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthProvider } from '../providers/auth/auth';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { IBeacon } from '@ionic-native/ibeacon';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { HttpClientModule } from '@angular/common/http';
import { ApiProvider } from '../providers/api/api';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';
import { Camera, CameraOptions } from '@ionic-native/camera';

var firebaseConfig = {
  apiKey: "AIzaSyAVpnGuapjU3HaCGa-CmBHidWrOGV2RSBI",
  authDomain: "pwa-firebase-hosting.firebaseapp.com",
  databaseURL: "https://pwa-firebase-hosting.firebaseio.com",
  projectId: "pwa-firebase-hosting",
  storageBucket: "pwa-firebase-hosting.appspot.com",
  messagingSenderId: "72415286155"
};

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage,
    SignupPage,
    ResetPasswordPage,
    BeaconPage,
    CompassBearingPage,
    ProfilePage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp,{
      scrollAssist: false,
      autoFocusAssist: false
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage,
    SignupPage,
    ResetPasswordPage,
    BeaconPage,
    CompassBearingPage,
    ProfilePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    AuthProvider,
    Facebook,
    GooglePlus,
    IBeacon,
    TextToSpeech,
    ApiProvider,
    SpeechRecognition,
    DeviceOrientation,
    Keyboard,
    Camera
  ]
})
export class AppModule { }
