import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Swiper from 'swiper';

@Component({
  selector: 'app-gift-sender',
  templateUrl: './gift-sender.page.html',
  styleUrls: ['./gift-sender.page.scss'],
})
export class GiftSenderPage implements OnInit {

  @ViewChild("swiper") swiper?: ElementRef<{ swiper: Swiper }>

  currentIndex = null;
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

  constructor() { }

  ngOnInit() {
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
