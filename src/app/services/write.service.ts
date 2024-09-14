import { Injectable } from '@angular/core';
import firebase from 'firebase'
import { ToolService } from './tool.service';

@Injectable({
  providedIn: 'root'
})
export class WriteService {

  constructor(
    private toolService: ToolService,

  ) { }

  firestore = firebase.firestore()
  uid = localStorage.getItem('heyu_uid') || ''

  getUid() {
    const uid = localStorage.getItem('heyu_uid') || '';
    if (!uid) {
      console.error('User ID is not available.');
      return null;
    }
    return uid;
  }

  // ~ chats ~


  updateDelivered(participants, timestamp) {
    const batch = this.firestore.batch();

    const uid = this.getUid();  // Get uid dynamically each time
    if (!uid) return;  // Return if uid is not available

    const chatRef = this.firestore.collection('users').doc(uid).collection('chats').doc();
    batch.update(chatRef, { delivered: true });

    const conversationId = participants.sort().join('_');
    const messagesRef = this.firestore.collection('chatrooms').doc(conversationId).collection('messages')
      .where('delivered', '==', false)
      .where('lastDeliveryDate', '<=', timestamp)
      .where('senderId', '!=', uid);

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

  async sendMessage(message: string, conversationId: string, friend_id: string, uid: string, user_profile: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (message.trim()) {
        const firestore = firebase.firestore();
        const batch = firestore.batch();

        // Document references
        const conversationRef = firestore.collection('chatrooms').doc(conversationId);
        const messagesRef = conversationRef.collection('messages').doc(); // Auto-generate a unique ID
        const userChatRef = firestore.collection('users').doc(uid).collection('chats').doc(friend_id);
        const otherUserChatRef = firestore.collection('users').doc(friend_id).collection('chats').doc(uid);

        // Prepare new message data
        const newMessage = {
          senderId: uid,
          text: message,
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
          participants: [friend_id, uid],
          lastMessage: {
            text: newMessage.text,
            type: newMessage.type,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          },
          lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          isDeleted: {
            user01: false,
            user02: false,
          },
        };

        batch.set(conversationRef, conversationData, { merge: true });

        // Set for the other user
        batch.set(otherUserChatRef, {
          lastMessage: newMessage.text,
          lastMessageType: "text",
          lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
          lastMessageBy: uid,
          picture: user_profile['picture'],
          name: user_profile['name'],
          uid: uid,
          unreadCount: 0,
          delivered: false,
        }, { merge: true });

        // Set for the current user
        batch.set(userChatRef, {
          lastMessage: newMessage.text,
          lastMessageType: newMessage.type,
          lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
          lastMessageBy: uid,
          unreadCount: firebase.firestore.FieldValue.increment(1),
          delivered: false,
        }, { merge: true });

        // Commit the batch
        await batch.commit()
          .then(() => {
            console.log('Batch write successful.');
            resolve(); // Resolve the promise when successful
          })
          .catch((error) => {
            console.error('Error in batch write:', error);
            reject(error); // Reject the promise if there's an error
          });
      } else {
        reject('Message cannot be empty'); // Reject if the message is empty
      }
    });
  }

  async sendGift(giftDetails: { giftId: string, giftPrice: number, giftName: string, giftPicture: string }, conversationId: string, friend_id: string, uid: string, user_profile: any): Promise<void> {
    const firestore = firebase.firestore();

    try {
      await firestore.runTransaction(async (transaction) => {
        const userRef = firestore.collection('profiles').doc(uid);
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.data();

        if (!userData || userData.credits < giftDetails.giftPrice) {
          throw new Error('Insufficient credits');
        }

        const batch = firestore.batch();
        const conversationRef = firestore.collection('chatrooms').doc(conversationId);
        const messagesRef = conversationRef.collection('messages').doc(); // Auto-generate a unique ID
        const userChatRef = firestore.collection('users').doc(uid).collection('chats').doc(friend_id);
        const otherUserChatRef = firestore.collection('users').doc(friend_id).collection('chats').doc(uid);

        // Prepare new gift data
        const newGift = {
          senderId: uid,
          giftId: giftDetails.giftId,
          giftPrice: giftDetails.giftPrice,
          giftName: giftDetails.giftName,
          giftPicture: giftDetails.giftPicture,
          type: "gift",
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          localTimestamp: new Date().getTime(),
          isDelivered: false,
        };

        // Add the new gift to the messages subcollection
        batch.set(messagesRef, newGift);

        // Prepare conversation data update
        const conversationData = {
          participants: [friend_id, uid],
          lastMessage: {
            text: `Gift: ${giftDetails.giftId}`, // gift message
            type: "gift",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          },
          lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          isDeleted: {
            user01: false,
            user02: false,
          },
        };

        batch.set(conversationRef, conversationData, { merge: true });

        // Set for the other user
        batch.set(otherUserChatRef, {
          lastMessage: `Gift: ${giftDetails.giftName}`,// gift message
          lastMessageType: "gift",
          lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
          lastMessageBy: uid,
          picture: user_profile['picture'],
          name: user_profile['name'],
          uid: uid,
          unreadCount: 0,
          delivered: false,
        }, { merge: true });

        // Set for the current user
        batch.set(userChatRef, {
          lastMessage: `Gift: ${giftDetails.giftName}`,// gift message
          lastMessageType: "gift",
          lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
          lastMessageBy: uid,
          unreadCount: firebase.firestore.FieldValue.increment(1),
          delivered: false,
        }, { merge: true });

        // Deduct the credits from the user's account
        transaction.update(userRef, {
          credits: firebase.firestore.FieldValue.increment(-giftDetails.giftPrice)
        });

        // Commit the transaction
        return Promise.resolve(); // Transaction is committed when returning successfully
      });

      console.log('Transaction successful.');
    } catch (error) {
      console.error('Error in transaction:', error);
    }
  }

  updateProfile(uid: string, profileData: any): Promise<void> {
    return this.firestore.collection('profiles').doc(uid).update(profileData)
      .then(() => {
        console.log('Profile updated successfully.');
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
      });
  }

  async topUpCredits(uid: string, topUpAmount: number): Promise<void> {
    const userRef = this.firestore.collection('users').doc(uid);

    // Use Firestore's increment method to add credits atomically
    return userRef.update({
      credits: firebase.firestore.FieldValue.increment(topUpAmount)
    })
      .then(() => {
        'Topup success'
      })
      .catch((error) => {
        console.error('Error topping up credits:', error);
        throw error; 
      });
  }

}
