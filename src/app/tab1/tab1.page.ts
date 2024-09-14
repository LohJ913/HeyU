import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { DataService } from '../services/data.service';
import { ToolService } from '../services/tool.service';
import firebase from 'firebase';
import { ReadService } from '../services/read.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  userSubscribe: Subscription;
  currentUser: any = {};
  loginTrigger: boolean = false;

  firestore = firebase.firestore();
  people: any = [];
  popular: any = [];

  constructor(
    public navCtrl: NavController,
    public tool: ToolService,
    private dataService: DataService,
    private readService: ReadService
  ) {

  }

  ngOnInit(): void {

    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      console.log(info);
      this.currentUser = info;
    });
    this.getHotGirls();
    this.getOutlets();
  }

  getOutlets() {
    // Access a GeoCollection

  }

  getHotGirls() {
    this.readService.getHotGirls().subscribe({
      next: (data) => {
        this.people = JSON.parse(JSON.stringify(data));
        this.popular = data.sort((a, b) => ((b['view'] || 0) - (a['view'] || 0)));
        console.log('Popular users:', this.popular);
      },
      error: (error) => {
        console.error('Error fetching hot girls:', error);
      },
      complete: () => {
        console.log('Fetching hot girls completed.');
      }
    });
  }

  goLobby() {
    this.navCtrl.navigateForward('lobby');
  }

  goUser(user: any) {
    this.navCtrl.navigateForward(`profile-user?id=${user['id']}`);
  }

  goTopUp() {
    this.navCtrl.navigateForward('topup');
  }
}
