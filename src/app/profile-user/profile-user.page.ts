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
      name: 'Love Kiss',
      gem: 33300
    }
  ]

  gender = {
    "male": "Male",
    "female": "Female",
    "others": "Others"
  }

  selectedGift: any = {};
  id: any;
  uid: any = localStorage.getItem('heyu_uid') || ''
  userProfile: any = {}
  currentUser: any = {}
  userSubscribe;
  messageText: any
  conversationId: any;

  favorites = null
  favoritesNo: any = ''
  love = false;

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
    console.log(this.uid)
    this.arrayGift = this.toolService.groupArray(this.gifts, 8)
    this.activatedRoute.queryParams.subscribe(a => {
      this.id = a['id']
      this.conversationId = [this.uid, this.id].sort().join('|');
      this.uid = this.currentUser['id'] || this.uid
      this.readService.getAmbassadorInfo(this.uid, this.id).then(res => {
        console.log(res)
        if (res['profile']) {
          this.userProfile = res['profile'];
          this.userProfile['age'] = this.userProfile['dob'] ? this.toolService.calculateAge(this.userProfile['dob']) : 18
          // if (this.userProfile['dob']) this.userProfile['age'] = this.toolService.calculateAgeFromString(this.userProfile['dob'])
          console.log('Profile fetched:', this.userProfile);
        }

       this.favoritesNo =  this.formatNumber(this.favorites = this.toolService.lengthof(res['engagement']) ? res['engagement']?.['favorites'] || 0 : 0)
        this.love = this.toolService.lengthof(res?.['userfavorite']) ? true : false

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

  selectGift(x) {
    this.selectedGift = x
  }

  async sendGift() {
    await this.writeService.sendGift(
      this.selectedGift,
      this.conversationId,
      this.id,
      this.uid,
      this.currentUser,
      this.userProfile
    ).then((res) => {
      if (res.success) {
        console.log(res);
        console.log('Gift sent successfully.');
        this.openGift = false;
        this.toolService.showToast('Gift sent!', 'success', 'top');
        setTimeout(() => {
          this.navCtrl.navigateForward(`chatroom?id=${this.id}`);
        }, 500);
      } else {
        console.log(res)
        this.toolService.showToast(res.message || 'Error occurred!', 'danger', 'top'); // Show specific error message
        console.error('Error sending message:', res.message);
      }
    }).catch((error) => {
      this.toolService.showToast('Error sending gift', 'danger', 'top');
      console.error('Error sending message:', error);
    });
  }

  formatNumber(num: number): string {
    if (num === 0) return '0';
    console.log(num)
    const units = ['', 'k', 'm', 'b', 't']; // You can add more units as needed
    const order = Math.floor(Math.log10(Math.abs(num)) / 3); // Determine the order of magnitude
    const scaled = num / Math.pow(1000, order); // Scale the number

    // Format the number to have a maximum of three digits
    const formatted = scaled.toFixed(2).replace(/\.00$/, ''); // Keep 2 decimal places or remove if .00
    return `${formatted}${units[order]}`;
  }

  favoriteUser() {

    this.writeService.favoriteThisUser(this.uid, this.id, !this.love).then((res) => {
      if (res.favorite == true) {
        this.love = true;
        this.favorites = (this.favorites || 0) + 1;
      } else {
        this.love = false;
        this.favorites = Math.max(0, (this.favorites || 0) - 1);
      }
      this.favoritesNo = this.formatNumber(this.favorites);
    })


  }
}
