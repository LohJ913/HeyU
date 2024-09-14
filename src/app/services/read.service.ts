import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import firebase from 'firebase';
import { ToolService } from './tool.service';
import { WriteService } from './write.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReadService {

  constructor(
    private toolService: ToolService,
    private writeService: WriteService,
  ) { }

  firestore = firebase.firestore()
  private chats: any = []
  private chatsSubject = new BehaviorSubject<any[]>([]);
  public chats$ = this.chatsSubject.asObservable();

  // chats
  setupListener(uid: string) {
    this.firestore.collection('users').doc(uid).collection('chats')
      .orderBy('lastMessageDate', 'desc')
      .onSnapshot((snapshot) => {

        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            console.log('New chat added: ', change.doc.data());
            let newchat = change.doc.data()
            newchat['lastTime'] = newchat['lastMessageDate'] ? await this.toolService.makeDateNicer(newchat['lastMessageDate'].toMillis()) : ''
            this.chats.push(newchat)
            // this.filterChats()
            console.log(this.chats)
            this.chatsSubject.next([...this.chats]);  // Emit the updated chats array to subscribers

          }
          if (change.type === 'modified') {
            console.log('Chat modified: ', change.doc.data());
            let updatedchat = change.doc.data()
            updatedchat['lastTime'] = updatedchat['lastMessageDate'] ? await this.toolService.makeDateNicer(updatedchat['lastMessageDate'].toMillis()) : ''
            this.chats[this.chats.findIndex((a: any) => (a['uid'] == updatedchat.uid))] = updatedchat
            // this.filterChats()
            this.chatsSubject.next([...this.chats]);  // Emit the updated chats array to subscribers

          }
          if (change.type === 'removed') {
            console.log('Chat removed: ', change.doc.data());
            this.chatsSubject.next([...this.chats]);  // Emit the updated chats array to subscribers
          }
          if (change.doc.data().lastMessageBy !== uid && !change.doc.data().delivered) {
            this.writeService.updateDelivered([uid, change.doc.id], (change.doc.data().lastDeliveryDate) || null);
          }
        });
      });
    console.log(this.chats)
    console.log(this.chats$)
  }


  private messagesSubject = new BehaviorSubject<any[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private conversationId: string = '';
  private unsubscribeMap: Map<string, (() => void)> = new Map(); // Map to store unsubscribe functions for different listeners
  private messages: any[] = [];

  // Set the conversation ID for a new chat and handle unsubscription
  setConversationId(conversationId: string) {
    if (this.unsubscribeMap.has(this.conversationId)) {
      this.unsubscribeMap.get(this.conversationId)!();  // Unsubscribe from the old listener
      this.unsubscribeMap.delete(this.conversationId);  // Remove it from the map
      this.messages = [];  // Reset messages for the new chatroom
      this.messagesSubject.next(this.messages);  // Clear messages in the UI
    }

    this.conversationId = conversationId;  // Update the conversation ID
  }

  // Get old messages and set up a listener for the new chatroom
  getChats() {
    const messagesRef = firebase.firestore()
      .collection('chatrooms')
      .doc(this.conversationId)
      .collection('messages');

    const oldMessagesQuery = messagesRef
      .orderBy('timestamp', 'desc')
      .limit(20);

    oldMessagesQuery.get().then(async (querySnapshot) => {
      if (querySnapshot.empty) {
        console.log('No messages found.');
        this.listenForNewMessages(null);
        return;
      } else {
        const oldMessages = querySnapshot.docs.reverse().map(doc => ({
          id: doc.id,
          date: doc.data()?.timestamp ? doc.data().timestamp.toMillis() : null,
          ...doc.data()
        }));
        this.messages = oldMessages;
        this.messagesSubject.next(this.messages);  // Emit old messages to subscribers
        this.listenForNewMessages(oldMessages[oldMessages.length - 1]['timestamp']);
      }
    }).catch((error) => {
      console.error('Error fetching old messages:', error);
    });
  }

  // Listen for new messages and store the unsubscribe function for the current conversation
  listenForNewMessages(lastTimestamp: any) {
    const messagesRef = firebase.firestore()
      .collection('chatrooms')
      .doc(this.conversationId)
      .collection('messages');

    let newMessagesQuery;

    if (lastTimestamp) {
      newMessagesQuery = messagesRef
        .orderBy('timestamp')
        .startAfter(lastTimestamp);
    } else {
      newMessagesQuery = messagesRef.orderBy('timestamp');
    }

    // Set up the new listener and store its unsubscribe function
    const unsubscribe = newMessagesQuery.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const newMessage = { id: change.doc.id, ...change.doc.data() };
          newMessage['date'] = newMessage?.['timestamp'] ? newMessage['timestamp'].toMillis() : null;
          this.messages.push(newMessage);
          this.messagesSubject.next(this.messages);  // Emit new messages
        }
        if (change.type === 'modified') {
          const modMessage = { id: change.doc.id, ...change.doc.data() };
          modMessage['date'] = modMessage?.['timestamp'].toMillis();
          const index = this.messages.findIndex(msg => msg.id === modMessage.id);
          if (index !== -1) {
            this.messages[index] = modMessage;
            this.messagesSubject.next(this.messages);  // Emit modified messages
          }
        }
      });
    }, (error) => {
      console.error('Error listening for new messages:', error);
    });

    // Store the unsubscribe function in the map
    this.unsubscribeMap.set(this.conversationId, unsubscribe);
  }

  // Unsubscribe from a specific conversation listener, not affecting others
  unsubscribeFromChat(conversationId: string) {
    if (this.unsubscribeMap.has(conversationId)) {
      this.unsubscribeMap.get(conversationId)!();  // Unsubscribe from Firestore listener
      this.unsubscribeMap.delete(conversationId);  // Remove it from the map
      this.messages = [];  // Clear messages related to that conversation
      this.messagesSubject.next(this.messages);  // Clear the observable data
    }
  }

  // Manually unsubscribe all listeners if needed (optional)
  unsubscribeAll() {
    this.unsubscribeMap.forEach((unsubscribe) => unsubscribe());  // Unsubscribe all listeners
    this.unsubscribeMap.clear();  // Clear the map
    this.messages = [];  // Clear messages globally
    this.messagesSubject.next(this.messages);  // Clear observable data
  }

  getUserProfileOnce(userId: string): Promise<any> {
    const profileRef = this.firestore.collection('profiles').doc(userId);

    return profileRef.get().then((doc) => {
      if (doc.exists) {
        return doc.data();
      } else {
        throw new Error('No such profile exists!');
      }
    });
  }

  getUserProfileWithListener(userId: string): Observable<any> {
    return new Observable((observer) => {
      const profileRef = this.firestore.collection('profiles').doc(userId);

      // Firestore real-time listener
      const unsubscribe = profileRef.onSnapshot((doc) => {
        if (doc.exists) {
          const profileData = doc.data();
          observer.next(profileData); // Emit the updated profile data
        } else {
          observer.error('No such profile exists!');
        }
      }, (error) => {
        observer.error(`Error fetching profile snapshot: ${error}`);
      });

      return unsubscribe;
    });
  }

  getHotGirls(): Observable<any[]> {
    return new Observable(observer => {
      this.firestore.collection('profiles')
        .where('gender', '==', 'female')
        .where('verified', '==', true)
        .get()
        .then(snapshot => {
          const users: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          observer.next(users);
          observer.complete();
        })
        .catch(error => {
          console.error('Error fetching profiles:', error);
          observer.error(error);
        });
    });
  }

  getOutlets() {
    return new Observable(observer => {
      this.firestore.collection('outlets')
        .where('gender', '==', 'female')
        .where('verified', '==', true)
        .get()
        .then(snapshot => {
          const users: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          observer.next(users);
          observer.complete();
        })
        .catch(error => {
          console.error('Error fetching profiles:', error);
          observer.error(error);
        });
    });
  }

}

