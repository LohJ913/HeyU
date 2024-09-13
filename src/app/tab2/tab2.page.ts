import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import firebase from 'firebase';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {


  firestore = firebase.firestore()

  constructor(
    public navCtrl: NavController,
    private datePipe: DatePipe
  ) { }

  uid = 'user01'
  limit = 20;
  chats: any = []
  filteredChat: any = []
  search: any = ''
  currentTime: any = new Date().getTime()

  async ngOnInit() {
    localStorage.setItem('heyu_uid', 'user01')
    // let userChatsRef = this.firestore.collection('users').doc(this.uid).collection('chats')
    //   .orderBy('lastMessageDate', 'desc')
    //   .limit(this.limit);

    // userChatsRef.get().then(async (snapshot) => {
    //   const chats: any = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    //   // Process the loaded chats
    //   console.log('Initial chats:', chats);
    //   this.chats = await Promise.all(chats.map(async (a: any) => {
    //     a['lastTime'] = await this.makeDateNicer(a['lastMessageDate'].toMillis());
    //     return a;
    //   }));
    //   // After loading, set up the listener
    //   console.log(this.chats)
    // });

    this.setupListener();
  }

  ionViewWillEnter() {
    this.currentTime = new Date().getTime()
  }

  setupListener() {
    // Continue listening for changes after the last loaded chat
    this.firestore.collection('users').doc(this.uid).collection('chats')
      .orderBy('lastMessageDate', 'desc')
      .onSnapshot((snapshot) => {

        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            console.log('New chat added: ', change.doc.data());
            let newchat = change.doc.data()
            newchat['lastTime'] = newchat['lastMessageDate'] ? await this.makeDateNicer(newchat['lastMessageDate'].toMillis()) : ''
            this.chats.push(newchat)
            this.filterChats()
          }
          if (change.type === 'modified') {
            console.log('Chat modified: ', change.doc.data());
            let updatedchat = change.doc.data()
            updatedchat['lastTime'] = updatedchat['lastMessageDate'] ? await this.makeDateNicer(updatedchat['lastMessageDate'].toMillis()) : ''
            this.chats[this.chats.findIndex((a: any) => (a['uid'] == updatedchat.uid))] = updatedchat
            this.filterChats()
          }
          if (change.type === 'removed') {
            console.log('Chat removed: ', change.doc.data());
          }
          if (change.doc.data().lastMessageBy !== this.uid && !change.doc.data().delivered) {
            this.updateDelivered(change.doc.id, [this.uid, change.doc.id], (change.doc.data().lastDeliveryDate) || null);
          }
        });
      });
  }

  filterChats() {
    let filterChats = JSON.parse(JSON.stringify(this.chats) || '[]').filter((item: any) => (item.name.toLowerCase().includes(this.search.toLowerCase())))
    this.filteredChat = filterChats
  }

  chatDetail(item: any) {
    this.navCtrl.navigateForward(`chatroom?id=${item['uid']}`)
  }

  makeDateNicer(dater: any): Promise<string> {
    let today = new Date().getTime();
    return new Promise((resolve) => {
      if (this.datePipe.transform(dater, 'yyyyMMdd') == this.datePipe.transform(today, 'yyyyMMdd')) {
        resolve('Today');
      } else if (this.datePipe.transform(dater, 'yyyyMMdd') < this.datePipe.transform(today, 'yyyyMMdd')) {
        console.log('here')
        if (this.datePipe.transform(dater, 'yyyyMMdd') >= this.datePipe.transform(new Date(new Date(today).getFullYear(), new Date(today).getMonth(), new Date(today).getDate() - 1, 0, 0, 0), 'yyyyMMdd')) {
          resolve('Yesterday');
        } else if (this.datePipe.transform(dater, 'yyyyMMdd') >= this.datePipe.transform(new Date(new Date(today).getFullYear(), new Date(today).getMonth(), new Date(today).getDate() - 6, 0, 0, 0), 'yyyyMMdd')) {
          resolve(this.datePipe.transform(dater, 'EEEE'));
        } else {
          resolve(this.datePipe.transform(dater, 'dd/MM/yyyy'));
        }
      } else {
        resolve(this.datePipe.transform(dater, 'dd/MM/yyyy'));
      }
    });
  }

  updateDelivered(friendId, participants, timestamp) {
    const batch = this.firestore.batch();

    // Update delivered in 'users > uid > chats'
    const chatRef = this.firestore.collection('users').doc(this.uid).collection('chats').doc();
    batch.update(chatRef, { delivered: true });

    // Update delivered for each message in 'chatrooms > user01-user02 > messages'
    const conversationId = participants.sort().join('_');  // Unique conversation ID based on participants
    const messagesRef = this.firestore.collection('chatrooms').doc(conversationId).collection('messages')
      .where('delivered', '==', false)
      .where('lastDeliveryDate', '<=', timestamp)
      .where('senderId', '!=', this.uid);

    messagesRef.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { delivered: true, lastDeliveryDate: firebase.firestore.FieldValue.serverTimestamp() });
      });

      // Commit the batch write if there are changes
      if (!querySnapshot.empty) {
        batch.commit()
          .then(() => {
            console.log('Delivered status updated for chat and messages.');
          })
          .catch((error) => {
            console.error('Error updating delivered status: ', error);
          });
      }
    }).catch((error) => {
      console.error('Error retrieving messages for update: ', error);
    });
  }
}
