import { Component, OnInit } from '@angular/core';
import { ToolService } from '../services/tool.service';
import { ReadService } from '../services/read.service';
import { IonRouterOutlet, ModalController, NavController } from '@ionic/angular';
import firebase from 'firebase';
import 'firebase/auth'
declare var require;
// const { getRandomName, getNRandomNames, names } = require('fancy-random-names');
import namesjson from '../../assets/json/names.json'
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2'

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

  generatedNames = namesjson

  constructor(
    public tool: ToolService,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public checkRoute: IonRouterOutlet,
    private http: HttpClient,
    private readService: ReadService
  ) { }

  async ngOnInit() {

    console.log(this.generatedNames)
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
        email: (this.loginUser['username']).toLowerCase() + '@heyu.com',
        password: this.loginUser['password']
      }
      console.log(signUpInfo)
      firebase.auth().signInWithEmailAndPassword(signUpInfo['email'], signUpInfo['password']).then(async (data) => {
        console.log(data)
        await this.tool.dismissLoading()
        this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'forward' })
      }).catch(async (error) => {
        console.error(error)
        await this.tool.dismissLoading()
        this.tool.swal('error', 'Failed to login', "Invalid login credentials", 3000)
      })


      // this.readService.getProfilefromUsername(this.loginUser['username']).then((data) => {
      //   if (this.tool.lengthof(data)) {

      //     if (data[0].password == this.loginUser['password']) {

      //       localStorage.setItem('heyu_uid', data[0]['id'])

      //     }

      //     this.tool.dismissLoading()
      //   }
      //   else {


      //     this.tool.dismissLoading()
      //   }
      // }).catch(() => {
      //   this.tool.dismissLoading
      // })
    }
  }

  guestLogin() {
    // this.firestore.collection('test').doc('f').set({
    //   n: '11'
    // })

    this.tool.showLoading('Please wait...')

    firebase.auth().signInAnonymously().then(async (ano) => {
      let obj = {
        name: this.getRandomName(),
        // gender: this.interested == 'female' ? 'male' : 'female',
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

  getRandomName() {
    let array = this.interested == 'female' ? this.generatedNames['male'] : this.generatedNames['female']
    var randomName = array[Math.floor(Math.random() * array.length)];
    return randomName
  }
}
