import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import firebase from 'firebase';
import { DatePipe } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ReadService } from '../services/read.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {


  constructor(
    public navCtrl: NavController,
    private datePipe: DatePipe,
    private readService: ReadService,
  ) { }

  uid = 'user01'
  limit = 20;
  filteredChat: any = []
  search: any = ''
  currentTime: any = new Date().getTime()

  chats: any[] = [];
  private unsubscribe$ = new Subject<void>();

  ngOnDestroy(): void {

  }

  async ngOnInit() {
    localStorage.setItem('heyu_uid', 'user01')

    this.readService.chats$
      .pipe(takeUntil(this.unsubscribe$))  // Use takeUntil to auto-unsubscribe
      .subscribe((chats) => {
        this.chats = chats;
        this.filterChats();  // Or any other post-processing logic
      });

    // Start listening for Firestore changes
    this.readService.setupListener(this.uid);
  }

  ionViewWillEnter() {
    this.currentTime = new Date().getTime()
  }

  filterChats() {
    let filterChats = JSON.parse(JSON.stringify(this.chats) || '[]').filter((item: any) => (item.name.toLowerCase().includes(this.search.toLowerCase())))
    this.filteredChat = filterChats
  }

  chatDetail(item: any) {
    this.navCtrl.navigateForward(`chatroom?id=${item['uid']}`)
  }

}
