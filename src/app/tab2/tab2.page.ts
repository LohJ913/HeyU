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
    private datePipe:DatePipe
  ) { }

  uid = 'user01'
  limit = 20;
  chats: any = []

  currentTime:any = firebase.firestore.Timestamp.now().toMillis()

  ngOnInit() {

    let userChatsRef = this.firestore.collection('users').doc(this.uid).collection('chats')
      .orderBy('lastMessageDate', 'desc')
      .limit(this.limit);

    userChatsRef.get().then((snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Process the loaded chats
      console.log('Initial chats:', chats);
      this.chats = chats
      // After loading, set up the listener
      this.setupListener(snapshot.docs[snapshot.docs.length - 1]);
    });
  }

  setupListener(lastDoc) {
    // Continue listening for changes after the last loaded chat
    this.firestore.collection('users').doc(this.uid).collection('chats')
      .orderBy('lastMessageDate', 'desc')
      .startAfter(lastDoc)
      .onSnapshot((snapshot) => {

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            console.log('New chat added: ', change.doc.data());
          }
          if (change.type === 'modified') {
            console.log('Chat modified: ', change.doc.data());
          }
          if (change.type === 'removed') {
            console.log('Chat removed: ', change.doc.data());
          }
        });
      });
  }

  chatDetail() {
    this.navCtrl.navigateForward('chatroom')
  }

  eightdater(){
    return this.datePipe
  }
}
