import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavController, IonRouterOutlet, IonContent } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase';
import { ReadService } from '../services/read.service';
import { WriteService } from '../services/write.service';
import { ToolService } from '../services/tool.service';
import Swiper from 'swiper';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { DataService } from '../services/data.service';
import { DexieService } from '../services/dexie.service';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.page.html',
  styleUrls: ['./chatroom.page.scss'],
})
export class ChatroomPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content: IonContent;
  @ViewChild("swiper") swiper?: ElementRef<{ swiper: Swiper }>

  constructor(
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    private activatedRoute: ActivatedRoute,
    private readService: ReadService,
    private writeService: WriteService,
    public tool: ToolService,
    private dataService: DataService,
    private dexieService: DexieService

  ) { }

  sendGift: boolean = false
  selectedGift = {}
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
      gem: 33300
    }
  ]
  arrayGift = [];
  messages: any = []
  uid = localStorage.getItem('heyu_uid') || ''
  fid = ''
  messageText: any
  conversationId: any = ''
  conversationRef: any;
  userChatRef: any;
  friendProfile: any = {}
  private messagesSub: Subscription;
  profileSubscription: any;
  today = new Date().getTime()
  currentIndex = null;

  userSubscribe: any;
  currentUser: any;

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab2', { animated: true, animationDirection: 'back' })
  }

  lengthof(x: any) {
    return Object.keys(x || {}).length
  }

  ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = info;
    });
    this.arrayGift = this.tool.groupArray(this.gifts, 4)
    this.activatedRoute.queryParams.subscribe(a => {
      this.fid = a['id']
      if (this.fid && this.uid) {
        this.conversationId = [this.uid, this.fid].sort().join('|');
        this.readService.setConversationId(this.conversationId);

        // Fetch old messages and listen for new ones
        this.readService.getChats(this.fid, this.uid);

        // Subscribe to messages observable
        this.messagesSub = this.readService.messages$.subscribe((messages) => {
          console.log(messages)
          this.messages = messages;
          // Update your UI here
        });
      }
    })

    this.profileSubscription = this.readService.getUserProfileWithListener(this.fid)
      .subscribe({
        next: (profileData) => {
          this.friendProfile = profileData;
          this.friendProfile['age'] = this.tool.calculateAge(this.friendProfile['dob'])

          console.log('Profile updated:', this.friendProfile);
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          console.log('Profile listener completed.');
        }
      });
  }

  ionViewDidEnter() {
    this.scrollToBottomOnInit()
  }

  ngOnDestroy() {
    // Unsubscribe from both the messages observable and Firestore listener
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
    }
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
      console.log('unsubscribe')
    }

    if (this.userSubscribe) this.userSubscribe.unsubscribe();


    this.readService.unsubscribeFromChat(this.conversationId);  // Unsubscribe from current chat listener only
  }

  selectGift(gift) {
    this.selectedGift = gift
  }

  async sendingGift() {
    let giftInfo: any = {};
    giftInfo = this.selectedGift;

    const res = await this.writeService.sendGift(
      giftInfo,
      this.conversationId,
      this.fid,
      this.uid,
      this.currentUser,
      this.friendProfile
    );

    if (res.success) {
      console.log(res)
      console.log('Message sent successfully.');
      console.log(giftInfo);
      this.tool.showToast('Gift sent!', 'success', 'bottom')
      this.scrollToBottomOnInit();
    } else {
      console.error('Error sending message:', res.message);
    }
  }

  async sendMessage(ev) {

    console.log(this.messageText);
    if (!ev) return
    // if (ev.keyCode === 13) { // keyCode for the Enter key is 13
    this.writeService.sendMessage(
      this.messageText,
      this.conversationId,
      this.fid,
      this.uid,
      this.currentUser,
      this.friendProfile
    ).then(() => {
      console.log('Message sent successfully.');
      this.messageText = ''
      this.scrollToBottomOnInit()
    })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
    // }
  }

  scrollToBottomOnInit() {
    this.content.scrollToBottom(300);
  }

  giftSender() {
    if (this.sendGift == true) {
      this.sendingGift()
    } else {
      this.sendGift = true
    }
  }

  logActiveIndex() {
    let i = this.swiper?.nativeElement.swiper.activeIndex
    this.currentIndex = i
  }
}
