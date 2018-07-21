import { Component } from '@angular/core';
import {
  Alert,
  AlertController,
  IonicPage,
  Loading,
  LoadingController,
  NavController
} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { HomePage } from '../home/home';
import { EmailValidator } from '../../validators/email';
import firebase from 'firebase';
/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  uuid: any;
  name: any;
  gender: any;
  dob: any;
  public profileForm: FormGroup;
  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public authProvider: AuthProvider,
    formBuilder: FormBuilder
  ) {
    this.profileForm = formBuilder.group({
      name: [
        '',
        Validators.compose([null, Validators.required])
      ],
      gender: [
        '',
        Validators.compose([null, Validators.required])
      ],
      dob: [
        '',
        Validators.compose([null, Validators.required])
      ]
    });
  }


  ionViewDidLoad() {
    this.uuid = firebase.auth().currentUser.uid;
    firebase.auth().fetchSignInMethodsForEmail(firebase.auth().currentUser.email).then(data => {
      if (data.toString() == "facebook.com" || data.toString() == "google.com") {
        this.name = firebase.auth().currentUser.displayName;
        this.gender = "Male";
      }
      else {
        var counterRef = firebase.database().ref('/userProfile/' + this.uuid);
        counterRef.on('value', snapshot => {
          console.log(snapshot.val())
          this.name = snapshot.val().name;
          this.dob = snapshot.val().dateOfBirth;
          this.gender = snapshot.val().gender;
        });
      }
    });
  }

  goToHome(): void {
    this.navCtrl.push(HomePage);
  }


}
