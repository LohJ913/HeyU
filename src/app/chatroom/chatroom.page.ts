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
  uid = localStorage.getItem('heyu_uid') || 'user01'
  myProfile = JSON.parse(localStorage.getItem('heyu_profile') || '{}')
  fid = ''
  messageText: any

  conversationId: any = ''
  conversationRef: any;

  userChatRef: any;


  friendProfile: any = {}

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
        this.conversationId = [this.uid, this.fid].sort().join('|')
        this.conversationRef = this.firestore.collection('chatCollections').doc(this.conversationId);
        // this.getChats()
        this.getUserProfile(this.uid, 'myProfile'); // if already ahve local storage << skip this
        this.getUserProfile(this.fid, 'friendProfile');
        this.getChats()
      }
    })
    // test
    // firebase.firestore().collection('test').get().then((d => {
    //   firebase.firestore().collection('test').orderBy('n').startAfter('4').get().then((snapshot) => {
    //     snapshot.forEach(document => { console.log(document.id + " " + document.get('n')); })
    //   })
    // }))

  }

  selectGift(gift) {
    this.selectedGift = gift
  }

  getChats() {
    const messagesRef = firebase.firestore()
      .collection('chatrooms')
      .doc(this.conversationId)
      .collection('messages');

    // Query to fetch existing messages, ordered by timestamp, and limited to 20 messages
    const oldMessagesQuery = messagesRef
      .orderBy('timestamp', 'desc')
      .limit(20);

    oldMessagesQuery.get().then(async (querySnapshot) => {
      if (querySnapshot.empty) {
        console.log('No messages found.');
        // Listen for new messages if there are no old messages
        this.listenForNewMessages(null);
        return;
      }
      else {

        // Reverse the documents to show them in chronological order
        const oldMessages = querySnapshot.docs.reverse().map(doc => ({ id: doc.id, date: doc.data()?.timestamp ? doc.data().timestamp.toMillis() : null, ...doc.data() }));
        this.messages = oldMessages
        this.listenForNewMessages(oldMessages[this.lengthof(oldMessages) - 1]['timestamp'])

      }
    }).catch((error) => {
      console.error('Error fetching old messages:', error);
    });
  }

  listenForNewMessages(lastTimestamp: any) {
    const messagesRef = firebase.firestore()
      .collection('chatrooms')
      .doc(this.conversationId)
      .collection('messages');

    let newMessagesQuery;

    if (lastTimestamp) {
      // Start listening after the last fetched document
      newMessagesQuery = messagesRef
        .orderBy('timestamp')
        .startAfter(lastTimestamp); // Use startAfter to get documents after the last one
    } else {
      // Start listening from the beginning
      newMessagesQuery = messagesRef.orderBy('timestamp');
    }

    // Set up the new listener
    newMessagesQuery.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const newMessage = { id: change.doc.id, ...change.doc.data() };
          console.log('New message:', newMessage);
          newMessage['date'] = newMessage?.['timestamp'] ? newMessage?.['timestamp'].toMillis() : null
          this.messages.push(newMessage)
          // Handle new messages (e.g., update UI)
        }
        if (change.type === 'modified') {
          const modMessage = { id: change.doc.id, ...change.doc.data() };
          modMessage['date'] = modMessage?.['timestamp'].toMillis()
          this.messages[this.messages.findIndex((a: any) => (a['id'] == modMessage.id))] = modMessage
          console.log('Chat modified: ', modMessage);

        }
      });
    }, (error) => {
      console.error('Error listening for new messages:', error);
    });
  }

  sendMessage() {
    console.log('here')
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
        localTimestamp: new Date().getTime(),
        isRead: false,
        isDeleted: false,
        isDelivered: false,
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
        unreadCount: 0,
        delivered: false,
      }, { merge: true });

      // Set the conversation document with merge to create if it doesn’t exist

      batch.set(userChatRef, {
        lastMessage: newMessage.text,
        lastMessageType: newMessage.type,
        lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessageBy: this.uid,
        unreadCount: firebase.firestore.FieldValue.increment(1),
        delivered: false,
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
