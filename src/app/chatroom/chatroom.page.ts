import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.page.html',
  styleUrls: ['./chatroom.page.scss'],
})
export class ChatroomPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    private activatedRoute: ActivatedRoute
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
  firestore = firebase.firestore()

  message: string = '';  // Use this to bind to the input field
  messages: any = []
  uid = ''
  fid = ''
  messageText: any

  conversationId: any = ''
  conversationRef: any;

  userChatRef: any;

  myProfile: any;
  friendProfile: any = {}

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab2', { animated: true, animationDirection: 'back' })
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(a => {
      this.fid = a['id']
      this.uid = a['uid']
      if (this.fid && this.uid) {
        this.conversationId = [this.uid, this.fid].sort().join('|')
        this.conversationRef = this.firestore.collection('chatCollections').doc(this.conversationId);
        this.getChats()
        this.getUserProfile(this.uid, 'myProfile');
        this.getUserProfile(this.fid, 'friendProfile');
      }
    })
  }

  selectGift(gift) {
    this.selectedGift = gift
  }

  getChats() {
    const messagesRef = firebase.firestore()
      .collection('chatrooms')
      .doc(this.conversationId)
      .collection('messages');
  
    console.log(firebase.firestore.Timestamp.now().toMillis());
  
    // Step 1: Fetch old messages (limit or by a certain timestamp)
    const oldMessagesQuery = messagesRef
      .where('timestamp', '>=', firebase.firestore.Timestamp.fromMillis(Date.now() - (24 * 60 * 60 * 1000)))
      .orderBy('timestamp', 'desc')
      .limit(20);
  
    oldMessagesQuery.get().then((querySnapshot) => {
      if (querySnapshot.empty) {
        // If there are no old messages, still listen for new ones
        this.listenForNewMessages();
        return;
      }
  
      const lastVisibleMessage = querySnapshot.docs[querySnapshot.docs.length - 1];
  
      // Reverse messages to display them in the correct order (oldest first)
      this.messages = querySnapshot.docs.reverse().map(doc => doc.data());
  
      console.log('Fetched old messages:', this.messages);
  
      // Step 2: Listen for new messages (after the last fetched message)
      this.listenForNewMessages(lastVisibleMessage);
    }).catch((error) => {
      console.error('Error fetching old messages:', error);
    });
  }
  
  listenForNewMessages(lastVisibleMessage: any = null) {
    const messagesRef = firebase.firestore()
      .collection('chatrooms')
      .doc(this.conversationId)
      .collection('messages');
  
    // Step 2: Listen for new messages
    let newMessagesQuery;
  
    if (lastVisibleMessage) {
      // Start listening after the last fetched message
      newMessagesQuery = messagesRef
        .orderBy('timestamp')
        .startAfter(lastVisibleMessage);
    } else {
      // Start listening for new messages without any old messages
      newMessagesQuery = messagesRef
        .orderBy('timestamp');
    }
  
    newMessagesQuery.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newMessage = change.doc.data();
          console.log('New message:', newMessage);
          // Handle new messages and update the UI
          this.messages.push(newMessage);
        }
      });
    });
  }

  sendMessage() {
    if (this.messageText.trim()) {
      const firestore = firebase.firestore();
      const batch = firestore.batch();

      // Document references
      const conversationRef = firestore.collection('chatrooms').doc(this.conversationId);
      const messagesRef = conversationRef.collection('messages').doc(); // Auto-generate a unique ID
      const userChatRef = firestore.collection('users').doc(this.uid).collection('chats').doc(this.fid);
      const otherUserChatRef = firestore.collection('users').doc(this.fid).collection('chats').doc(this.uid);

      // Prepare new message data
      const newMessage = {
        senderId: this.uid,
        text: this.messageText,
        type: "text",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        isRead: false,
        isDeleted: false
      };

      // Add the new message to the messages subcollection
      batch.set(messagesRef, newMessage);

      // Prepare conversation data update
      const conversationData = {
        participants: [this.fid, this.uid],
        lastMessage: {
          text: newMessage.text,
          type: newMessage.type,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        },
        lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        isDeleted: {
          user01: false,
          user02: false
        }
      };
      batch.set(conversationRef, conversationData, { merge: true });


      batch.set(otherUserChatRef, {
        lastMessage: newMessage.text,
        lastMessageType: "text",
        lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessageBy: this.uid,
        picture: this.myProfile['picture'],
        name: this.myProfile['name'],
        uid: this.uid,
        unreadCount: firebase.firestore.FieldValue.increment(1) // Increment unread count
      }, { merge: true });

      // Set the conversation document with merge to create if it doesn’t exist

      batch.set(userChatRef, {
        lastMessage: newMessage.text,
        lastMessageType: newMessage.type,
        lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessageBy: this.uid,
        unreadCount: firebase.firestore.FieldValue.increment(0)
      }, { merge: true });

      // Commit the batch
      batch.commit().then(() => {
        console.log('Batch write successful.');
      }).catch((error) => {
        console.error('Error in batch write:', error);
      });

      this.messageText = ''; // Clear the input field
    }
  }

  getUserProfile(userId: string, profileType: string) {
    const profileRef = this.firestore.collection('profiles').doc(userId);

    profileRef.onSnapshot((doc) => {
      if (doc.exists) {
        const profileData = doc.data();
        console.log(`${profileType} Profile updated:`, profileData);

        // Update profile data in real-time
        if (profileType === 'myProfile') {
          this.myProfile = profileData;
        } else {
          this.friendProfile = profileData;
        }
      } else {
        console.log("No such profile exists!");
      }
    }, (error) => {
      console.log("Error fetching profile snapshot:", error);
    });
  }


  lengthof(x: any) {
    return Object.keys(x || {}).length
  }

}
