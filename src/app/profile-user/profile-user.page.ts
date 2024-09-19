import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import Swiper from 'swiper';
import { ReadService } from '../services/read.service';
import { DataService } from '../services/data.service';
import { ToolService } from '../services/tool.service';
import { ActivatedRoute } from '@angular/router';
import { WriteService } from '../services/write.service';
import { Subscription, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-profile-user',
  templateUrl: './profile-user.page.html',
  styleUrls: ['./profile-user.page.scss'],
})
export class ProfileUserPage implements OnInit {

  @ViewChild("swiper") swiper?: ElementRef<{ swiper: Swiper }>

  currentIndex = null;

  openGift: boolean = false;

  arrayGift = [];
  gifts = [
    {
      id: '001',
      picture: 'assets/gifting/g_1.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '002',
      picture: 'assets/gifting/g_2.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '003',
      picture: 'assets/gifting/g_3.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '004',
      picture: 'assets/gifting/g_4.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '005',
      picture: 'assets/gifting/g_5.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '006',
      picture: 'assets/gifting/g_6.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '007',
      picture: 'assets/gifting/g_7.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '008',
      picture: 'assets/gifting/g_8.png',
      name: 'Kiss Kiss',
      gem: 300
    }
  ]
  selectedGift: any = {};
  id: any;
  uid: any = localStorage.getItem('heyu_uid') || ''
  userProfile: any = {}
  currentUser: any = {}
  userSubscribe;
  messageText: any
  conversationId: any;

  constructor(
    public router: IonRouterOutlet,
    public navCtrl: NavController,
    private readService: ReadService,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private writeService: WriteService,
    public toolService: ToolService,
  ) { }

  ngOnInit() {
    this.arrayGift = this.groupArray(this.gifts, 8)
    this.activatedRoute.queryParams.subscribe(a => {
      this.id = a['id']
      this.conversationId = [this.uid, this.id].sort().join('|');
      this.readService.getUserProfileOnce(this.id)
        .then((profileData) => {
          this.userProfile = profileData;
          if (this.userProfile['dob']) this.userProfile['age'] = this.toolService.calculateAgeFromString(this.userProfile['dob'])
          console.log('Profile fetched:', this.userProfile);
        })
        .catch((error) => {
          console.error(error);
        });
    })
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = info
      // console.log(info)
    })
  }

  back() {
    this.router.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

  logActiveIndex() {
    let i = this.swiper?.nativeElement.swiper.activeIndex
    this.currentIndex = i
  }

  groupArray(arr, chunkSize) {
    const groupedArray = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      groupedArray.push(arr.slice(i, i + chunkSize));
    }
    return groupedArray;
  }

  selectGift(x) {
    this.selectedGift = x
  }

  sendGift() {
    // this.writeService.sendGift()

    this.writeService.sendGift(
      this.selectedGift,
      this.conversationId,
      this.id,
      this.uid,
      this.currentUser,
      this.userProfile
    ).then(() => {
      console.log('Message sent successfully.');
      this.openGift = false;
      setTimeout(() => {
        this.navCtrl.navigateForward(`chatroom?id=${this.id}`)
      }, 500);
    }).catch((error) => {
      console.error('Error sending message:', error);
    });
  }
}
