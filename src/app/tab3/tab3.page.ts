import { Component, OnInit } from '@angular/core';
import firebase from 'firebase';
import 'firebase/auth'
import { DataService } from '../services/data.service';
import { ToolService } from '../services/tool.service';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  userSubscribe: Subscription;
  currentUser: any = {};
  settingsOepn: boolean = false;
  firestore = firebase.firestore();

  constructor(
    public tool: ToolService,
    private dataService: DataService,
    private http: HttpClient,
    private nav: NavController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = info
    })
  }


  logout() {
    firebase.auth().signOut().then(() => {
      this.userSubscribe.unsubscribe()
      localStorage.removeItem('heyu_uid')
    })
  }

  async bindAccount() {
    const alert = await this.alertCtrl.create({
      header: 'Account Linking',
      message: 'Fill in the info below',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Username',
          label: 'Username',
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },
        {
          text: 'Ok',
          handler: (alertData) => { //takes the data 

            this.tool.showLoading('Please wait, account linking..')

            let body = {
              uid: this.currentUser['id'],
              email: alertData.username + '@heyu.com',
              password: alertData.password
            }

            this.http.post('https://us-central1-heyu-bed49.cloudfunctions.net/requests/bindUserAccount', body).subscribe(res => {
              console.log(res);
              this.firestore.collection('profiles').doc(res['user']['uid']).set({ username: alertData.username, guest: false })
              this.tool.dismissLoading()
              this.tool.showToast('Account Linked!', 'success', 'bottom')
            })
          }
        }
      ]
    });
    await alert.present();
  }

  toProfile() {
    this.nav.navigateForward('profile-edit')
  }

  toFavourite() {
    this.nav.navigateForward('favourite-list')

  }
}
