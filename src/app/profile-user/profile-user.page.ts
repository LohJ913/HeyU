import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import Swiper from 'swiper';

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
      thumbnail: 'assets/gifting/g_1.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '002',
      thumbnail: 'assets/gifting/g_2.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '003',
      thumbnail: 'assets/gifting/g_3.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '004',
      thumbnail: 'assets/gifting/g_4.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '005',
      thumbnail: 'assets/gifting/g_5.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '006',
      thumbnail: 'assets/gifting/g_6.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '007',
      thumbnail: 'assets/gifting/g_7.png',
      name: 'Kiss Kiss',
      gem: 300
    },
    {
      id: '008',
      thumbnail: 'assets/gifting/g_8.png',
      name: 'Kiss Kiss',
      gem: 300
    }
  ]
  selectedGift: any = {};

  constructor(
    public router: IonRouterOutlet,
    public navCtrl: NavController
  ) { }

  ngOnInit() {
    this.arrayGift = this.groupArray(this.gifts, 8)
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
}
