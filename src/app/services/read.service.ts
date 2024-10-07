import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import firebase from 'firebase';
import { ToolService } from './tool.service';
import { WriteService } from './write.service';
import { Observable } from 'rxjs';
import { DexieService } from './dexie.service';

@Injectable({
  providedIn: 'root'
})
export class ReadService {

  constructor(
    private toolService: ToolService,
    private writeService: WriteService,
    private dexieService: DexieService,
  ) { }


  private chats: any = []
  private chatsSubject = new BehaviorSubject<any[]>([]);
  public chats$ = this.chatsSubject.asObservable();

  // chats
  setupChatListener(uid: string) {
    const chatsRef = firebase.firestore().collection('users').doc(uid).collection('chats').orderBy('lastMessageDate', 'desc');

    let initialFetchComplete = false;  // Flag to check if initial fetch is complete

    // Step 1: Set up a real-time listener but do not emit until the initial fetch is done
    const unsubscribe = chatsRef.onSnapshot(async (snapshot) => {
      if (initialFetchComplete) {
        const changes: any[] = [];

        for (const change of snapshot.docChanges()) {

          let chatData = change.doc.data();
          console.log(chatData.lastMessageBy, chatData.lastDeliveryDate)
          chatData['lastTime'] = chatData['lastMessageDate']
            ? await this.toolService.makeDateNicer(chatData['lastMessageDate'].toMillis())
            : '';

          if (change.type === 'added') {
            changes.push({ type: 'added', chat: chatData });
          }
          if (change.type === 'modified') {
            changes.push({ type: 'modified', chat: chatData });
          }
          if (change.type === 'removed') {
            changes.push({ type: 'removed', chat: chatData });
          }

          // Handle undelivered messages
          console.log(chatData.lastMessageBy, chatData.delivered)
          if (chatData.lastMessageBy !== uid && !chatData.delivered) {
            this.writeService.updateDelivered([uid, change.doc.id], chatData.lastDeliveryDate || null);
          }
        }

        // Emit only the changes after the initial fetch
        if (changes.length > 0) {
          this.updateLocalChats(changes);
        }
      }
    }, error => {
      console.error('Error listening to chats:', error);
    });

    // Step 2: Fetch existing chats first
    chatsRef.get().then(async snapshot => {
      const chats = await Promise.all(snapshot.docs.map(async doc => {
        let chatData = doc.data();
        chatData['lastTime'] = chatData['lastMessageDate']
          ? await this.toolService.makeDateNicer(chatData['lastMessageDate'].toMillis())
          : '';
        return chatData;
      }));

      // Update the chats list with the initial fetch data
      this.chats = chats;
      this.chatsSubject.next([...this.chats]);  // Emit the fetched chats
      initialFetchComplete = true;  // Now real-time listener can work
    }).catch(error => {
      console.error('Error fetching chats:', error);
    });

    // Step 3: Cleanup on unsubscription
    return () => unsubscribe();
  }

  // This function updates the local chat list with real-time changes
  private updateLocalChats(changes: { type: string, chat: any }[]) {
    changes.forEach(change => {
      if (change.type === 'added') {
        this.chats.push(change.chat);
      }
      if (change.type === 'modified') {
        const index = this.chats.findIndex(c => c.uid === change.chat.uid);
        if (index > -1) {
          this.chats[index] = change.chat;
        }
      }
      if (change.type === 'removed') {
        const index = this.chats.findIndex(c => c.uid === change.chat.uid);
        if (index > -1) {
          this.chats.splice(index, 1);
        }
      }
    });

    // Emit the updated chats array
    this.chatsSubject.next([...this.chats]);
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
  getChats(friend_id: string, uid: string) {
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
        this.listenForNewMessages(uid, friend_id, null);
        return;
      } else {
        const oldMessages = querySnapshot.docs.reverse().map(doc => ({
          id: doc.id,
          date: doc.data()?.timestamp ? doc.data().timestamp.toMillis() : null,
          ...doc.data()
        }));
        this.messages = oldMessages;
        this.messagesSubject.next(this.messages);  // Emit old messages to subscribers
        this.listenForNewMessages(uid, friend_id, oldMessages[oldMessages.length - 1]['timestamp']);
        this.writeService.markMessagesAsRead(this.conversationId, uid, friend_id)

      }
    }).catch((error) => {
      console.error('Error fetching old messages:', error);
    });
  }



  // Listen for new messages and store the unsubscribe function for the current conversation
  listenForNewMessages(uid, friend_id, lastTimestamp: any) {
    const messagesRef = firebase.firestore()
      .collection('chatrooms')
      .doc(this.conversationId)
      .collection('messages');

    let newMessagesQuery;

    if (lastTimestamp) {
      newMessagesQuery = messagesRef
        .orderBy('timestamp', 'asc')
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
          console.log(newMessage)
          this.messagesSubject.next(this.messages);  // Emit new messages
          if (newMessage['senderId'] != uid) this.writeService.markMessagesAsRead(this.conversationId, uid, friend_id)
          newMessage['conversationId'] = this.conversationId
          this.dexieService.putMessage(newMessage)
        }
        if (change.type === 'modified') {
          const modMessage = { id: change.doc.id, ...change.doc.data() };
          modMessage['date'] = modMessage?.['timestamp'].toMillis();
          console.log(change.doc.data())
          modMessage['conversationId'] = this.conversationId
          this.dexieService.putMessage(modMessage)

          const index = this.messages.findIndex(msg => msg.id === modMessage.id);
          if (index !== -1) {
            this.messages[index] = modMessage;
            this.messagesSubject.next(this.messages);  // Emit modified messages
            modMessage['conversationId'] = this.conversationId
            this.dexieService.putMessage(modMessage)
          }
        }
      });
    }, (error) => {
      console.error('Error listening for new messages:', error);
    });

    // Store the unsubscribe function in the map
    this.unsubscribeMap.set(this.conversationId, unsubscribe);
  }

  unsubscribeAll() {
    this.unsubscribeMap.forEach((unsubscribe) => unsubscribe());  // Unsubscribe all listeners
    this.unsubscribeMap.clear();  // Clear the map
    this.messages = [];  // Clear messages globally
    this.messagesSubject.next(this.messages);  // Clear observable data
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


  async getAmbassadorInfo(uid: string, ambassador_id: string) {
    const profileRef = firebase.firestore().collection('profiles').doc(ambassador_id).get();
    const engagementRef = firebase.firestore().collection('users').doc(ambassador_id).collection('engagements').doc('data').get();
    const favoritesRef = firebase.firestore().collection('users').doc(uid).collection('favorites').where('uid', '==', ambassador_id).get();

    const [profileSnapshot, engagementSnapshot, favoritesSnapshot] = await Promise.all([profileRef, engagementRef, favoritesRef]);

    const profile = profileSnapshot.data();
    const engagement = engagementSnapshot.data();
    const userfavorite = favoritesSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    return { profile, engagement, userfavorite }; // Fixed typo in return object
  }


  getUserProfileOnce(userId: string): Promise<any> {
    const profileRef = firebase.firestore().collection('profiles').doc(userId);

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
      const profileRef = firebase.firestore().collection('profiles').doc(userId);

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

  getHotPeople(gender?: string): Observable<any[]> {
    return new Observable(observer => {

      let queryRef = firebase.firestore().collection('profiles').where('verified', '==', true);

      // If gender is provided, add it as a query filter
      if (gender) {
        queryRef = queryRef.where('gender', '==', gender);
      }
      queryRef.get()
        .then(snapshot => {
          const users: any[] = snapshot.docs.map(doc => ({ id: doc.id, age: doc['dob'] ? this.toolService.calculateAge(doc['dob']) : Math.floor(Math.random() * (25 - 18 + 1)) + 18, ...doc.data() }));
          console.log(users);

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
      firebase.firestore().collection('outlets').get()
        .then(snapshot => {
          const outlets: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log(outlets)
          observer.next(outlets);
          observer.complete();
        })
        .catch(error => {
          console.error('Error fetching outlets:', error);
          observer.error(error);
        });
    });
  }

  getNearbyOutlets(lat: number, lon: number) {
    return new Observable(observer => {
      firebase.firestore().collection('outlets')
        // .where("latitude", "<=", lat + 2)
        // .where("latitude", ">=", lat - 2)
        .get()
        .then(snapshot => {
          // Filter longitude manually
          const outlets: any[] = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((outlet: any) => outlet.longitude <= lon + 2 && outlet.longitude >= lon - 2);

          console.log(outlets);
          observer.next(outlets);
          observer.complete();
        })
        .catch(error => {
          console.error('Error fetching outlets:', error);
          observer.error(error);
        });
    });
  }

  getOutletUsers() {
    return new Observable(observer => {
      firebase.firestore().collection('checkins')
        .get()
        .then(snapshot => {
          // Filter longitude manually
          const checkins: any[] = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
          console.log(checkins);
          observer.next(checkins);
          observer.complete();
        })
        .catch(error => {
          console.error('Error fetching users:', error);
          observer.error(error);
        });
    });
  }


  getProfilefromUsername(username: string): Promise<any[]> {
    const profileRef = firebase.firestore()
      .collection('profiles')
      .where('username', '==', username);

    return profileRef
      .get()
      .then(snapshot => {
        const users: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return users; // Return the users array
      })
      .catch(error => {
        console.error('Error fetching profiles:', error);
        throw error; // Throw error so the caller can catch it
      });
  }

  getMyRooms(uid: string) {
    console.log(uid)
    const roomsRef = firebase.firestore()
      .collection('rooms')
      .orderBy('datetime', 'asc')
      .where('datetime', ">=", this.toolService.dateTransform(new Date(), 'yyyyMMdd_hhmm'))
      .where('users', 'array-contains', uid)

    return roomsRef
      .get()
      .then(snapshot => {
        const rooms: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return rooms; // Return the users array
      })
      .catch(error => {
        console.error('Error fetching rooms:', error);
        throw error; // Throw error so the caller can catch it
      });
  }

  subMyHostings(uid: string): Observable<any[]> {
    return new Observable(observer => {
      // Firestore real-time listener using onSnapshot()
      const unsubscribe = firebase.firestore().collection('users').doc(uid).collection('rooms')
        .orderBy('datetime', 'asc')
        .where('datetime', ">=", this.toolService.dateTransform(new Date(), 'yyyyMMdd_hhmm'))
        .onSnapshot(snapshot => {
          const rooms: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          observer.next(rooms);
        }, error => {
          console.error('Error fetching rooms:', error);
          observer.error(error);
        });

      // Return the unsubscribe function in the cleanup
      return () => {
        unsubscribe();  // Unsubscribe from the real-time listener
        console.log('Unsubscribed from Firestore listener');
      };
    });
  }

  async getPartiesAsAmbassador(uid: string, gender) {
    const roomsRef = firebase.firestore().collection('rooms').where('gender', 'array-contains', gender).where('datetime', ">=", this.toolService.dateTransform(new Date(), 'yyyyMMdd_hhmm')).get();
    const invitesRef = firebase.firestore().collection('bookings').where('toUid', '==', uid).where('datetime', ">=", this.toolService.dateTransform(new Date(), 'yyyyMMdd_hhmm')).get();

    const [roomsSnapshot, guestsSnapshot] = await Promise.all([roomsRef, invitesRef]);

    const rooms = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const invites = guestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { rooms, invites };
  }

  getPartyList(gender) {
    const roomsRef = firebase.firestore()
      .collection('rooms')
      .where('gender', 'array-contains', gender)
      .where('datetime', ">=", this.toolService.dateTransform(new Date(), 'yyyyMMdd_hhmm'))

    return roomsRef
      .get()
      .then(snapshot => {
        const rooms: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return rooms; // Return the users array
      })
      .catch(error => {
        console.error('Error fetching rooms:', error);
        throw error; // Throw error so the caller can catch it
      });
  }

  getRoomInfo(roomId: string): Promise<any> {
    return firebase.firestore().collection('rooms').doc(roomId).get().then((doc) => {
      if (doc.exists) {
        return doc.data();
      } else {
        throw new Error('No such profile exists!');
      }
    });
  }

  private notificationsSubject = new BehaviorSubject<{ type: string, notification: any }[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  listenNotifications(uid: string): Observable<{ type: string, notification: any }[]> {
    return new Observable(observer => {
      const notificationsRef = firebase.firestore().collection('users').doc(uid).collection('notifications');

      console.log(uid);

      let initialFetchComplete = false;

      // Step 1: Listen for real-time updates right away but don't emit anything until initial fetch is done
      const unsubscribe = notificationsRef.onSnapshot(snapshot => {
        if (initialFetchComplete) {
          const changes: { type: string, notification: any }[] = [];

          snapshot.docChanges().forEach(change => {
            const notification = { id: change.doc.id, ...change.doc.data() };
            if (change.type === 'added') {
              changes.push({ type: 'added', notification });
            }
            if (change.type === 'modified') {
              changes.push({ type: 'modified', notification });
            }
            if (change.type === 'removed') {
              changes.push({ type: 'removed', notification });
            }
          });

          // Emit only the changes after the initial fetch
          if (changes.length > 0) {
            observer.next(changes);
            this.updateLocalNotifications(changes);  // Update local notifications here
          }
        }
      }, error => {
        console.error('Error listening to notifications:', error);
        observer.error(error);
      });

      // Step 2: Fetch existing notifications first
      notificationsRef.get().then(snapshot => {
        const notifications = snapshot.docs.map(doc => ({
          type: 'existing',
          notification: { id: doc.id, ...doc.data() }
        }));

        // Emit the fetched notifications as an array
        observer.next(notifications);
        this.updateLocalNotifications(notifications);  // Update local notifications with the initial fetch

        // After initial fetch, set the flag to true
        initialFetchComplete = true;
      }).catch(error => {
        console.error('Error fetching notifications:', error);
        observer.error(error);
      });

      // Cleanup on unsubscription
      return () => {
        unsubscribe(); // Unsubscribe from the real-time listener
      };
    });
  }

  private updateLocalNotifications(notifications: { type: string, notification: any }[]) {
    const currentNotifications = this.notificationsSubject.value;

    // Filter out duplicates by checking notification IDs
    const uniqueNotifications = notifications.filter(newNotification =>
      !currentNotifications.some(existingNotification => existingNotification.notification.id === newNotification.notification.id)
    );

    const updatedNotifications = [...currentNotifications, ...uniqueNotifications];  // Append new unique notifications
    this.notificationsSubject.next(updatedNotifications);  // Update the BehaviorSubject
  }


  getLastXTransactions(uid: string, lastVisible?: firebase.firestore.QueryDocumentSnapshot): Promise<any> {
    let transRef = firebase.firestore()
      .collection('users')
      .doc(uid)
      .collection('transactions')
      .orderBy('timestamp', 'desc') // Order by date descending
      .limit(20); // Limit to the last 20 transactions

    if (lastVisible) {
      // If there's a last visible document, start after it (for pagination)
      transRef = transRef.startAfter(lastVisible);
    }

    return transRef.get().then(snapshot => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        date: doc.data().timestamp.toMillis(),
        eightdate: this.toolService.eightdater(doc.data().timestamp.toMillis()),
        polarity: doc.data().type == 'gifting' || doc.data().type == 'deposit' || doc.data().type == 'party' ? -1 : 1,
        ...doc.data()
      }));

      // gifting, depost, refund, reimbursement

      // Return the transactions and the last visible document (for pagination)
      return {
        transactions,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] // Get the last document for next pagination
      };
    });
  }

  async getFavoriteUsers(uid: string): Promise<any[]> {
    const favoritesRef = firebase.firestore().collection('users').doc(uid).collection('favorites');

    try {
      // Fetch the favorite users
      const favoritesSnapshot = await favoritesRef.get();
      const favoriteUids = favoritesSnapshot.docs.map(doc => doc.id); // Get all favorite user UIDs

      if (favoriteUids.length === 0) {
        return []; // Return an empty array if no favorites found
      }

      // Fetch all profile documents in parallel
      const profilePromises = favoriteUids.map(favUid =>
        firebase.firestore().collection('profiles').doc(favUid).get()
      );

      // Wait for all profile fetches to complete
      const profileSnapshots = await Promise.all(profilePromises);

      // Map profiles to an array
      const profiles = profileSnapshots.map(snapshot => ({
        uid: snapshot.id,
        ...snapshot.data()
      }));

      return profiles;
    } catch (error) {
      console.error('Error fetching favorite users:', error);
      throw error;
    }
  }


}

