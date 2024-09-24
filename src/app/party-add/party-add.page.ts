import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import { ReadService } from '../services/read.service';
import { DataService } from '../services/data.service';
import { Subscription, distinctUntilChanged, timestamp } from 'rxjs';
import firebase from 'firebase';
import { WriteService } from '../services/write.service';

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
    private writeService: WriteService,
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
  roomInfo: any = {
    description: "I want sex tonight",
    preferences: [],
    uid: '',
    type: 'party',
    users: [],
    locationId: "",
    locationName: "",
    date: new Date(),
    gender: ['female'] // add male, others
  }

  costing = {
    total: 10000,
    fee: 100,
    deposit: 9900
  }

  ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      console.log(info);
      this.currentUser = info;
    });
  }

  createRoom() {

    // run checker

    if (['date',].some((a) => (this.roomInfo[a] == '' || this.roomInfo[a] == null))) {
      // reject
    }

    this.tool.swalConfirm('Party Room Confirmation', `${this.roomInfo['total']} gems will be deducted from your account. Would you like to proceed?`, 'warning').then(async (a) => {
      if (a == true) {
        // uid: string, roomData: any, transactionData: any): Promise<{ success: boolean; roomId?: string; transactionId?: string; newCredits?: number; message?: string 

        let body = {
          total: this.costing['total'], // budget
          deposit: this.costing['deposit'],
          fee: this.costing['fee'],
          type: 'party',  //fixed
          uid: this.uid,
          byName: this.currentUser['name'] || '',
          preferences: ['firm bubble shaped butt', 'japanese or chinese', 'petite', "speaks fucking english"],
          title: this.roomInfo['title'] || "",
          description: this.roomInfo['description'] || "",
          locationId: 'vsinghqmalaysia',
          locationName: 'VSING HQ',
          gender: ['female'],
          datetime: this.tool.dateTransform(this.roomInfo['date'], 'YYYYMMdd_hhmm'),
          date: 1730300400000,
          time_start: new Date(1730300400000),
          time_end: new Date(1730300400000 + (5 * 60 * 60 * 1000)),
          duration: 5, //hours,
          status: 'pending',
          users: [this.uid]
        }



        await this.writeService.createRoom(this.uid, body).then((res) => {
          console.log(res)
        }).catch((err) => {
          console.log(err)
        })
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


}
