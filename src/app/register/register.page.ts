import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import firebase from 'firebase';
import 'firebase/auth'
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(
    public tool: ToolService,
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    public datePipe: DatePipe
  ) { }

  firestore = firebase.firestore();
  user = {
    username: '',
    // name: '',
    gender: '',
    // dob: '',
    // picture: 'https://i.imgur.com/sLPx1zW.png',
    password: ''
  }
  tempImage = '';
  gender = [
    {
      icon: 'assets/icon/male.svg',
      icon2: 'assets/icon/male_white.svg',
      name: 'Male',
      value: 'Male'
    },
    {
      icon: 'assets/icon/female.svg',
      icon2: 'assets/icon/female_white.svg',
      name: 'Female',
      value: 'female'
    },
    {
      icon: 'assets/icon/others.svg',
      icon2: 'assets/icon/others_white.svg',
      name: 'Others',
      value: 'others'
    }
  ]
  selectedGender = ''
  errorText = ''

  ngOnInit() {

  }

  register() {
    if (this.checkField()) {

      this.tool.showLoading('Please wait...')

      let signUpInfo = {
        email: this.user['username'] + '@heyu.com',
        password: this.user['password']
      }

      firebase.auth().createUserWithEmailAndPassword(signUpInfo['email'], signUpInfo['password']).then(async (ano) => {

        if (this.tempImage) {
          this.user['picture'] = (await (this.tool.pictureToLink(this.tempImage, ano.user.uid)))['link']
        }

        let obj = {
          name: this.user['username'],
          username: this.user['username'],
          password: this.user['password'],
          gender: this.user['gender'] == 'others' ? 'others' : this.user['gender'] == 'female' ? 'male' : 'female',
          interested: this.user['gender'],
          id: ano.user.uid,
          guest: false,
          picture: 'https://i.imgur.com/sLPx1zW.png'
        }

        await this.firestore.collection('profiles').doc(ano.user.uid).set(obj).then(async () => {
          this.tool.dismissLoading()
          this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'forward' })
        })
      }, error => {
        console.log(error);

        if (error['code'] == 'auth/email-already-in-use') {
          const element = document.getElementById('error_reg_username');

          let errorMessage = 'Username has been taken';

          element.innerHTML = `<div style="font-size: 11px; color: #ff5050; margin-top: 10px;">${errorMessage}</div>`;
        }

        this.tool.dismissLoading()
      })
    }
  }

  checkField() {
    let isValid = true;

    for (const key in this.user) {
      const element = document.getElementById('error_reg_' + key);

      if (element) {

        // if (this.user[key] === "") {
        let errorMessage = "";

        if (key === 'username') {

          if (this.user[key] === "") {
            errorMessage = 'Username is required';

            element.innerHTML = `<div style="font-size: 11px; color: #ff5050; margin-top: 10px;">${errorMessage}</div>`;
            isValid = false;
          } else if (/\s/g.test(this.user[key])) {
            errorMessage = 'Username cannot have space';

            element.innerHTML = `<div style="font-size: 11px; color: #ff5050; margin-top: 10px;">${errorMessage}</div>`;
            isValid = false;
          } else {
            element.innerHTML = ""; // Clear any previous error message
          }

        } else if (key === 'password') {

          if (this.user[key] === "") {
            errorMessage = 'Password is required';

            element.innerHTML = `<div style="font-size: 11px; color: #ff5050; margin-top: 10px;">${errorMessage}</div>`;
            isValid = false;
          } else {
            element.innerHTML = ""; // Clear any previous error message
          }

        } else if (key === 'gender') {

          if (this.user[key] === "") {
            errorMessage = 'Please select the interested gender';

            element.innerHTML = `<div style="font-size: 11px; color: #ff5050; margin-top: 10px;">${errorMessage}</div>`;
            isValid = false;
          } else {
            element.innerHTML = ""; // Clear any previous error message
          }

        }

        // } else {
        //   element.innerHTML = ""; // Clear any previous error message
        // }
      }
    }

    return isValid;
  }

  selectGender(gender) {
    this.user['gender'] = gender['value']
    this.selectedGender = gender['value']
  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('login', { animated: true, animationDirection: 'back' })
  }

  photoPicker() {
    this.tool.uploadPhoto().then((url) => {
      this.tempImage = url
    })
  }
}
