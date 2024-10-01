import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import { ReadService } from '../services/read.service';
import { DataService } from '../services/data.service';
import { WriteService } from '../services/write.service';
import { Subscription, distinctUntilChanged, timestamp } from 'rxjs';
import firebase from 'firebase';

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
      value: 'male',
      selected: false
    },
    {
      icon: 'assets/icon/female.svg',
      icon2: 'assets/icon/female_white.svg',
      name: 'Female',
      value: 'female',
      selected: false
    },
    {
      icon: 'assets/icon/others.svg',
      icon2: 'assets/icon/others_white.svg',
      name: 'Others',
      value: 'others',
      selected: false
    }
  ]

  languageList = [
    {
      label: "English",
      value: "english"
    },
    {
      label: "日本語",
      value: "japanese"
    },
    {
      label: "ไทย",
      value: "thai"
    },
    {
      label: "中文",
      value: "chinese"
    }
  ];

  preferences = ['Sexy', 'Extrovert', '30 and above', 'Willing to drink', 'Below 30']
  paxNumber = [4, 8, 16, 24]

  budgetRange = {
    1: {
      value: 500,
      label: 'Normal'
    },
    2: {
      value: 800,
      label: 'High'
    },
    3: {
      value: 1200,
      label: 'Premium'
    }
  }

  selectedPax = 4;
  selectedBudget = 1;
  selectedGender = '';
  selectedPreference = '';

  myProfile: any;
  uid = localStorage.getItem('heyu_uid') || ''

  userSubscribe: any;
  currentUser: any;
  roomInfo: any = {
    title: "",
    description: "",
    age: {
      lower: 20,
      upper: 30
    },
    uid: '',
    type: 'party',
    users: [],
    locationId: "",
    locationName: "",
    date: new Date().toISOString(),
    time: new Date().toISOString(),
    gender: ['female'] // add male, others
  }

  today = new Date().toISOString();

  costing = {
    total: 10000,
    fee: 100,
    deposit: 9900
  }
  outlets: any = []

  ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      console.log(info);
      this.currentUser = info;
    });

    this.getOutlets()

  }


  getOutlets() {
    this.readService.getOutlets().subscribe({
      next: (data) => {
        this.outlets = data
        console.log('Outlets:', this.outlets);
      },
      error: (error) => {
        console.error('Error fetching outlets:', error);
      },
      complete: () => {
        console.log('Fetching outlets.');
      }
    });
  }

  setLocationName() {
    this.roomInfo['locationName'] = this.outlets.filter((a: any) => (a['id'] == this.roomInfo['locationId']))[0]?.name
  }

  pinFormatter(value: number) {
    let budgetRange = {
      1: {
        value: 500,
        label: 'Normal'
      },
      2: {
        value: 800,
        label: 'High'
      },
      3: {
        value: 1200,
        label: 'Premium'
      }
    }

    return budgetRange[value]['label'];
  }

  createRoom() {

    // run checker
    if (['date', 'time', 'locationId', 'pax'].some((a) => (this.roomInfo[a] == '' || this.roomInfo[a] == null || this.roomInfo[a] == undefined))) {
      // reject
    }
    if (!this.roomInfo['pax'] && !this.selectedPax) {
      // reject
    }
    this.tool.swalConfirm('Party Room Confirmation', `${this.countTotal()} credits will be deducted from your account. Would you like to proceed?`, 'warning').then(async (a) => {
      if (a == true) {
        // uid: string, roomData: any, transactionData: any): Promise<{ success: boolean; roomId?: string; transactionId?: string; newCredits?: number; message?: string 
        console.log(this.selectedLanguage)
        let body = {
          total: this.costing['total'], // budget
          deposit: this.costing['deposit'],
          fee: this.costing['fee'],
          type: 'party',  //fixed
          byId: this.uid,
          age: this.roomInfo['age'],
          byName: this.currentUser['name'] || '',
          // preferences: [],
          pax: this.roomInfo['pax'] || this.selectedPax,
          title: this.roomInfo['title'] || "",
          description: this.roomInfo['description'] || "",
          locationId: this.roomInfo['locationId'],
          locationName: this.roomInfo['locationName'],
          gender: this.gender.reduce((acc: any[], a: any) => a.selected ? [...acc, a.value] : acc, []),
          datetime: `${this.tool.dateTransform(this.roomInfo['date'], 'YYYYMMdd')}_${this.tool.dateTransform(this.roomInfo['time'], 'hhmm')}`,  // format is 20240910_1200
          duration: 5, //hours,
          status: 'pending',
          users: [this.uid],
          language: [],
        }

        console.log(body)
        // await this.writeService.createRoom(this.uid, body).then((res) => {
        //   console.log(res)
        // }).catch((err) => {
        //   console.log(err)
        // })
      }
    })
  }

  ngOnDestroy() {
    if (this.userSubscribe) this.userSubscribe.unsubscribe();
  }

  selectPreference(prefer) {
    this.selectedPreference = prefer
  }

  selectPax(pax) {
    this.selectedPax = pax
    this.roomInfo['pax'] = null
  }

  selectAge(ev) {
    this.roomInfo['age']['lower'] = ev['detail']['value']['lower']
    this.roomInfo['age']['upper'] = ev['detail']['value']['upper']
    console.log(this.roomInfo['age'])
  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

  logScrolling(ev) {
    let header = document.getElementById('header')
    let scrollTop = ev.detail.scrollTop
    var opacity = (scrollTop / 100);

    header.style.background = `linear-gradient(180deg, rgba(6,6,14,${opacity}) 75%, rgba(6,6,14,0) 100%)`;
  }

  countTotal() {
    let total = 0
    total = (this.selectedPax || this.roomInfo['pax']) * this.budgetRange[this.selectedBudget]['value']
    return total
  }

  selectedLanguage;
}
