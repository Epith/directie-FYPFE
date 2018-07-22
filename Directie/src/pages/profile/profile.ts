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
import { Camera, CameraOptions } from '@ionic-native/camera';

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
  cameraImage: any;
  uuid: any;
  name: any;
  gender: any;
  dob: any;
  imageChoosen: boolean = false;
  socialLogin: boolean;
  public profileForm: FormGroup;
  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public authProvider: AuthProvider,
    formBuilder: FormBuilder,
    private CAMERA: Camera
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
        this.cameraImage = firebase.auth().currentUser.photoURL;
        this.socialLogin = false;
      }
      else {
        this.socialLogin = true;
        var profileRef = firebase.database().ref('/userProfile/' + this.uuid);
        profileRef.on('value', snapshot => {
          console.log(snapshot.val())
          this.name = snapshot.val().name;
          this.dob = snapshot.val().dateOfBirth;
          this.gender = snapshot.val().gender;
          this.cameraImage = snapshot.val().profileURL
        });
      }
    });
  }

  ionViewDidLeave() {
    this.imageChoosen = false;
  }

  selectImage(): Promise<any> {
    return new Promise(resolve => {
      let cameraOptions: CameraOptions = {
        sourceType: this.CAMERA.PictureSourceType.PHOTOLIBRARY,
        destinationType: this.CAMERA.DestinationType.DATA_URL,
        quality: 100,
        encodingType: this.CAMERA.EncodingType.JPEG,
        correctOrientation: true
      };

      this.CAMERA.getPicture(cameraOptions)
        .then((data) => {
          this.cameraImage = "data:image/jpeg;base64," + data;
          this.imageChoosen = true;
          resolve(this.cameraImage);
        });


    });
  }

  goToHome(): void {
    this.navCtrl.push(HomePage);
  }

  updateDatabase() {
    let alert = this.alertCtrl.create({
      title: 'Profile',
      message: 'Update Profile?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm clicked');
            firebase.auth().fetchSignInMethodsForEmail(firebase.auth().currentUser.email).then(data => {
              if (data.toString() == "facebook.com" || data.toString() == "google.com") {
                if (this.imageChoosen == false) {
                  var profile = {
                    displayName: this.name,
                    photoURL: this.cameraImage
                  }
                  firebase.auth().currentUser.updateProfile(profile);
                }
                else {
                  this.authProvider.uploadImage(this.cameraImage).then(snapshot => {
                    console.log(snapshot);
                    var profile = {
                      displayName: this.name,
                      photoURL: snapshot.toString()
                    }
                    firebase.auth().currentUser.updateProfile(profile);
                  });
                }

              }
              else {
                if (this.imageChoosen == false) {
                  this.authProvider.updateUserAccount(this.name, this.dob, this.gender, this.cameraImage);
                }
                else {
                  this.authProvider.uploadImage(this.cameraImage).then(snapshot => {
                    console.log(snapshot);
                    this.authProvider.updateUserAccount(this.name, this.dob, this.gender, snapshot.toString());
                  });
                }
              }
            });

          }
        }
      ]
    });
    alert.present();
  }

}
