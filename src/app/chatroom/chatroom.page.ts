import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase';
import { ReadService } from '../services/read.service';
import { WriteService } from '../services/write.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.page.html',
  styleUrls: ['./chatroom.page.scss'],
})
export class ChatroomPage implements OnInit, OnDestroy {

  constructor(
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    private activatedRoute: ActivatedRoute,
    private readService: ReadService,
    private writeService: WriteService,
  ) { }

  sendGift: boolean = false
  selectedGift = {}
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

  messages: any = []
  uid = localStorage.getItem('heyu_uid') || 'user01'
  myProfile = JSON.parse(localStorage.getItem('heyu_profile') || '{}')
  fid = ''
  messageText: any

  conversationId: any = ''
  conversationRef: any;

  userChatRef: any;


  friendProfile: any = {}
  private messagesSub: Subscription;
  profileSubscription: any;

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab2', { animated: true, animationDirection: 'back' })
  }

  lengthof(x: any) {
    return Object.keys(x || {}).length
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(a => {
      this.fid = a['id']
      if (this.fid && this.uid) {
        this.conversationId = [this.uid, this.fid].sort().join('|');
        this.readService.setConversationId(this.conversationId);

        // Fetch old messages and listen for new ones
        this.readService.getChats();

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
          console.log('Profile updated:', this.friendProfile);
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          console.log('Profile listener completed.');
        }
      });

    this.readService.getUserProfileOnce('user01')
      .then((profileData) => {
        this.myProfile = profileData;
        console.log('Profile fetched:', this.myProfile);
      })
      .catch((error) => {
        console.error(error);
      });
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

    this.readService.unsubscribeFromChat(this.conversationId);  // Unsubscribe from current chat listener only
  }

  selectGift(gift) {
    this.selectedGift = gift
  }

  async sendingGift() {
    let giftInfo: any = {}

    this.writeService.sendGift(
      giftInfo,
      this.conversationId,
      this.fid,
      this.uid,
      this.myProfile
    )
      .then(() => {
        console.log('Message sent successfully.');
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  }

  async sendMessage() {
    this.writeService.sendMessage(
      this.messageText,
      this.conversationId,
      this.fid,
      this.uid,
      this.myProfile
    )
      .then(() => {
        console.log('Message sent successfully.');
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
    this.messageText = ''
  }

  markMessagesAsRead(conversationId, userId, friendId) {
    const messagesRef = firebase.firestore()
      .collection('chatrooms')
      .doc(conversationId)
      .collection('messages')
      .where('senderId', '==', this.uid)
      .where('isRead', '==', false);

    messagesRef.get().then((querySnapshot) => {
      const batch = firebase.firestore().batch();
      let unreadCount = 0;

      querySnapshot.forEach((doc) => {
        unreadCount++;
        batch.update(doc.ref, { isRead: true });
      });

      return batch.commit().then(() => {
        console.log('Messages marked as read');

        // Update chat summary (reset unreadCount)
        this.updateChatSummary(userId, friendId, { unreadCount: 0, delivered: true, read: true });
      });
    }).catch((error) => {
      console.error('Error updating message read status:', error);
    });
  }

  updateChatSummary(userId, friendId, statusUpdate) {
    const chatSummaryRef = firebase.firestore()
      .collection('users')
      .doc(friendId)
      .collection('chats')
      .doc(userId);

    chatSummaryRef.update(statusUpdate)
      .then(() => {
        console.log('Chat summary updated');
      })
      .catch((error) => {
        console.error('Error updating chat summary:', error);
      });
  }

}
