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
        Validators.compose([null,Validators.required])
      ],
      gender: [
        '',
        Validators.compose([null,Validators.required])
      ],
      dob:[
        '',
        Validators.compose([null,Validators.required])
      ]
    });
  }

  goToHome(): void {
    this.navCtrl.push(HomePage);
  }

}
