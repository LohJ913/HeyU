import { Component, OnInit } from '@angular/core';
import { ToolService } from '../services/tool.service';
import { IonRouterOutlet, ModalController, NavController } from '@ionic/angular';
import firebase from 'firebase';
import 'firebase/auth'
declare var require;
const { getRandomName, getNRandomNames, names } = require('fancy-random-names');

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  firestore = firebase.firestore()
  interested: string = '';
  loginUser = {
    username: '',
    password: ''
  }

  constructor(
    public tool: ToolService,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public checkRoute: IonRouterOutlet
  ) { }

  async ngOnInit() {
    // this.firestore.collection('profiles').onSnapshot((doc) => {
    //   console.log(doc.data());

    // })

    // const docSnap = await this.firestore.collection('profiles').get()
    // docSnap.docs.map(doc =>
    //   console.log(doc.data())
    // );

    // this.firestore.collection('test').doc(this.loginUsername).collection('booksList').doc(myBookId).set({
    //   password: this.password,
    //   name: this.name,
    //   rollno: this.rollno
    // })
  }

  back() {
    this.checkRoute.canGoBack() ? this.navCtrl.pop() : this.tool.navRoot('tabs/tab1', 'back')
  }

  checkField() {
    let isValid = true;

    for (const key in this.loginUser) {
      const element = document.getElementById('error_' + key);

      if (element) {

        if (this.loginUser[key] === "") {
          let errorMessage = "";

          if (key === 'username') {
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


  userLogin() {
    if (this.checkField()) {
      this.tool.showLoading('Please wait...')

      let signUpInfo = {
        email: this.loginUser['username'] + '@heyu.com',
        password: this.loginUser['password']
      }

      firebase.auth().signInWithEmailAndPassword(signUpInfo['email'], signUpInfo['password']).then(() => {
        this.tool.dismissLoading()
        this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'forward' })
      })
    }
  }

  guestLogin() {
    // this.firestore.collection('test').doc('f').set({
    //   n: '11'
    // })
    this.tool.showLoading('Please wait...')

    firebase.auth().signInAnonymously().then(async (ano) => {
      let obj = {
        name: getRandomName(),
        gender: this.interested == 'female' ? 'male' : 'female',
        interested: this.interested,
        id: ano.user.uid,
        guest: true,
        picture: 'https://i.imgur.com/sLPx1zW.png'
      }

      await this.firestore.collection('profiles').doc(ano.user.uid).set(obj).then(async () => {
        await this.modalCtrl.dismiss().then(() => {
          this.tool.dismissLoading()
          this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'forward' })
        })
      })
    })
  }
}
