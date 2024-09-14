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
    name: '',
    gender: '',
    dob: '',
    picture: 'https://i.imgur.com/sLPx1zW.png',
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
          username: this.user['username'],
          password: this.user['password'],
          name: this.user['name'],
          gender: this.user['gender'],
          interested: this.user['gender'] == 'female' ? 'male' : 'female',
          id: ano.user.uid,
          guest: false,
          picture: this.user['picture'],
          dob: this.datePipe.transform(this.user['dob'], 'dd/MM/yyyy')
        }

        await this.firestore.collection('profiles').doc(ano.user.uid).set(obj).then(async () => {
          this.tool.dismissLoading()
          this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'forward' })
        })
      }, error => {
        this.tool.dismissLoading()
      })
    }
  }

  checkField() {
    let isValid = true;

    for (const key in this.user) {
      const element = document.getElementById('error_' + key);

      if (element) {

        if (this.user[key] === "") {
          let errorMessage = "";

          if (key === 'name') {
            errorMessage = 'Name is required';
          } else if (key === 'gender') {
            errorMessage = 'Please select your gender ';
          } else if (key === 'dob') {
            errorMessage = 'Please select your date of birth';
          } else if (key === 'username') {
            errorMessage = 'Username is required';
          } else if (key === 'password') {
            errorMessage = 'Password is required';
          }

          element.innerHTML = `<div style="font-size: 11px; color: #ff5050; margin-top: 10px;">${errorMessage}</div>`;
          isValid = false;
        } else {
          element.innerHTML = ""; // Clear any previous error message
        }
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
