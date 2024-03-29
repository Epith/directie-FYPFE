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
import firebase from 'firebase/app';
import { LoginPage } from '../../pages/login/login';

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  public signupForm: FormGroup;
  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public authProvider: AuthProvider,
    formBuilder: FormBuilder
  ) {
    this.signupForm = formBuilder.group({
      name: [
        '',
        Validators.compose([null,Validators.required])
      ],
      email: [
        '',
        Validators.compose([Validators.required, EmailValidator.isValid])
      ],
      password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(6)])
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
  
  goToLogin(): void {
    this.navCtrl.push(LoginPage);
  }

  async signupUser(): Promise<void> {
    if (!this.signupForm.valid) {
      console.log(
        `Form is not valid yet, current value: ${this.signupForm.value}`
      );
    } else {
      const loading: Loading = this.loadingCtrl.create();
      loading.present();

      const email = this.signupForm.value.email;
      const password = this.signupForm.value.password;
      const gender = this.signupForm.value.gender;
      const dob = this.signupForm.value.dob;
      const name = this.signupForm.value.name;
      const loginType = 'email';


      try {
        await this.authProvider.signupUser(
          email,
          password,
          gender,
          dob,
          name,
          loginType
        );
        await loading.dismiss();
        this.navCtrl.setRoot(HomePage);
      } catch (error) {
        await loading.dismiss();
        const alert: Alert = this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }]
        });
        alert.present();
      }
    }
  }
}