import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { DataService } from '../services/data.service';
import { ToolService } from '../services/tool.service';
import firebase from 'firebase';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  userSubscribe: Subscription;
  currentUser: any = {};
  loginTrigger: boolean = false;

  constructor(
    public navCtrl: NavController,
    public tool: ToolService,
    private dataService: DataService
  ) { }

  firestore = firebase.firestore()

  people: any = []
  popular: any = []

  ngOnInit(): void {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      console.log(info);

      this.currentUser = info
    })

    this.getHotGirls()
  }

  getHotGirls() {

    this.firestore.collection('profiles').where('gender', '==', 'female').where('verified', '==', true).get().then((snapshot) => {
      const users: any = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(users)
      this.people = users
      this.popular = users.sort((a: any, b: any) => ((b['view'] || 0) - (a['view'] || 0)))
      console.log(this.popular)
    })



  }

  goLobby() {
    this.navCtrl.navigateForward('lobby')

  }

  goUser() {
    this.navCtrl.navigateForward('profile-user')
  }

  goTopUp() {
    this.navCtrl.navigateForward('topup')
  }

}
