import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import { ReadService } from '../services/read.service';
import { DataService } from '../services/data.service';
import { Subscription, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-party-add',
  templateUrl: './party-add.page.html',
  styleUrls: ['./party-add.page.scss'],
})
export class PartyAddPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    public tool: ToolService,
    private readService: ReadService,
    private dataService: DataService,
  ) { }

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

  preferences = ['Sexy', 'Extrovert', '30 and above', 'Willing to drink', 'Below 30']
  paxNumber = ['4', '8', '16', '24']
  selectedPax = ''
  selectedGender = ''
  selectedPreference = ''

  myProfile: any;
  uid = localStorage.getItem('heyu_uid') || ''

  userSubscribe: any;
  currentUser: any;
  roomInfo: any = {}

  ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      console.log(info);
      this.currentUser = info;
    });
  }

  createRoom() {
    this.tool.swalConfirm('Party Room Confirmation', `${this.roomInfo['total']} gems will be deducted from your account. Would you like to proceed?`, 'warning').then((a) => {
      if (a == true) {

      }
    })
  }

  ngOnDestroy() {
    if (this.userSubscribe) this.userSubscribe.unsubscribe();
  }

  selectGender(gender) {
    // this.user['gender'] = gender['value']
    this.selectedGender = gender['value']
  }

  selectPreference(prefer) {
    this.selectedPreference = prefer
  }

  selectPax(pax) {
    this.selectedPax = pax

  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

  proceed() {

  }

}
