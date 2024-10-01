import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import firebase from 'firebase';
import { DatePipe } from '@angular/common';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { ReadService } from '../services/read.service';
import { DataService } from '../services/data.service';
import { ToolService } from '../services/tool.service';

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
    private dataService: DataService,
    public tool: ToolService,
  ) { }

  userSubscribe: Subscription;
  currentUser: any = {};
  uid = localStorage.getItem('heyu_uid') || ''
  limit = 20;
  filteredChat: any = []
  search: any = ''
  currentTime: any = new Date().getTime()

  chats: any[] = [];
  private unsubscribe$ = new Subject<void>();

  ngOnDestroy(): void {

  }

  async ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      console.log(info);
      this.currentUser = info;
      // this.uid = info['id']
      // localStorage.setItem('heyu_uid', this.currentUser['id'])


      // Start listening for Firestore changes
    });

    this.readService.chats$
      .pipe(takeUntil(this.unsubscribe$))  // Use takeUntil to auto-unsubscribe
      .subscribe((chats) => {
        this.chats = chats;
        console.log(chats)
        this.filterChats();  // Or any other post-processing logic
      });
    this.readService.setupChatListener(this.uid);

  }

  ionViewWillEnter() {
    this.currentTime = new Date().getTime()
  }

  filterChats() {
    console.log(this.chats);

    let filterChats = JSON.parse(JSON.stringify(this.chats) || '[]').filter((item: any) => (item.name.toLowerCase().includes(this.search.toLowerCase())))
    this.filteredChat = filterChats
  }

  chatDetail(item: any) {
    this.navCtrl.navigateForward(`chatroom?id=${item['uid']}`)
  }

}
