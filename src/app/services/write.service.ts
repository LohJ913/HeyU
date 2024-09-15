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

  markMessagesAsRead(conversationId: string, userId: string, friendId: string): Promise<void> {
    const messagesRef = this.firestore
      .collection('chatrooms')
      .doc(conversationId)
      .collection('messages')
      .where('senderId', '==', userId)
      .where('isRead', '==', false);

    return messagesRef.get().then((querySnapshot) => {
      const batch = this.firestore.batch();
      let unreadCount = 0;

      querySnapshot.forEach((doc) => {
        unreadCount++;
        batch.update(doc.ref, { isRead: true });
      });

      return batch.commit().then(() => {
        console.log('Messages marked as read');
        // Update chat summary (reset unreadCount)
        return this.updateChatSummary(userId, friendId, {
          unreadCount: 0,
          delivered: true,
          read: true
        });
      });
    }).catch((error) => {
      console.error('Error updating message read status:', error);
      throw error;  // Re-throw the error for handling elsewhere
    });
  }

  // Function to update the chat summary
  updateChatSummary(userId: string, friendId: string, statusUpdate: any): Promise<void> {
    const chatSummaryRef = this.firestore
      .collection('users')
      .doc(friendId)
      .collection('chats')
      .doc(userId);

    return chatSummaryRef.update(statusUpdate)
      .then(() => {
        console.log('Chat summary updated');
      })
      .catch((error) => {
        console.error('Error updating chat summary:', error);
        throw error;  // Re-throw the error for handling elsewhere
      });
  }

  async sendMessage(message: string, conversationId: string, friend_id: string, uid: string, user_profile: any, friend_profile: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      console.log(message, conversationId, friend_id, uid, user_profile, friend_profile)
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
          picture: user_profile['picture'] || '',
          name: user_profile['name'] || '',
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
          picture: friend_profile['picture'] || '',
          name: friend_profile['name'] || '',
          uid: friend_id,
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

  async sendGift(giftDetails: { giftId: string, gem: number, giftName: string, giftPicture: string }, conversationId: string, friend_id: string, uid: string, user_profile: any, friend_profile: any): Promise<void> {
    const firestore = firebase.firestore();

    console.log(giftDetails, conversationId, friend_id, uid, user_profile, friend_profile)

    try {
      await firestore.runTransaction(async (transaction) => {
        const userRef = firestore.collection('profiles').doc(uid);
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.data();

        if (!userData || userData.coin < giftDetails.gem) {
          throw new Error('Insufficient credits');
        }

        const batch = firestore.batch();
        const conversationRef = firestore.collection('chatrooms').doc(conversationId);
        const messagesRef = conversationRef.collection('messages').doc(); // Auto-generate a unique ID
        const userChatRef = firestore.collection('users').doc(uid).collection('chats').doc(friend_id);
        const otherUserChatRef = firestore.collection('users').doc(friend_id).collection('chats').doc(uid);
        const giftTransactionRef = firestore.collection('gift_transactions').doc()

        // Prepare new gift data
        const newGift = {
          senderId: uid,
          giftId: giftDetails.giftId,
          giftPrice: giftDetails.gem,
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
          picture: friend_profile['picture'] || '',
          name: friend_profile['name'] || '',
          uid: friend_id,
          unreadCount: firebase.firestore.FieldValue.increment(1),
          delivered: false,
        }, { merge: true });


        // Push gift transactions
        batch.set(giftTransactionRef, {
          giftPrice: giftDetails.gem,
          giftId: giftDetails.giftId,
          giftName: giftDetails.giftName,
          giftPicture: giftDetails.giftPicture,
          recipientId: friend_id,
          recipientName: friend_profile['name'] || '',
          senderId: uid,
          senderName: user_profile['name'] || '',
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Deduct the credits from the user's account
        transaction.update(userRef, {
          credits: firebase.firestore.FieldValue.increment(-giftDetails.gem)
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

  async topUpCredits(uid: string, topupPackage: { amount: number, bonus: string, credits: number }, method: string): Promise<void> {
    console.log(uid, topupPackage, method)
    const firestore = this.firestore;
    const userRef = firestore.collection('profiles').doc(uid);
    const transactionsRef = firestore.collection('transactions').doc(); // Auto-generate transaction ID

    const topUpAmount = topupPackage['gem']; // Total coins (amount + bonus)
    // Prepare transaction data
    const transactionData = {
      amount: topupPackage.amount,
      bonus: topupPackage.bonus,
      credits: topupPackage.credits,
      method: method || 'online',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      type: 'topup',
      uid: uid
    };

    // Run transaction to update user's coins and record the transaction
    return firestore.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error("User does not exist!");
      }

      // Increment the user's coins
      transaction.update(userRef, {
        coin: firebase.firestore.FieldValue.increment(topUpAmount)
      });

      // Record the transaction
      transaction.set(transactionsRef, transactionData);
    }).then(() => {
    }).catch((error) => {
      throw error; // Rethrow the error for further handling
    });
  }

}
