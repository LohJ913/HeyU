import { Injectable } from '@angular/core';
import firebase from 'firebase'
import { ToolService } from './tool.service';
import { timestamp } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WriteService {

  constructor(
    private toolService: ToolService,

  ) { }

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


  updateDelivered(participants: string[], timestamp: any) {
    const batch = firebase.firestore().batch();

    const uid = this.getUid();  // Get uid dynamically each time
    if (!uid) return;  // Return if uid is not available
    console.log(timestamp)
    const conversationId = participants.sort().join('_');  // Sort participants
    const messagesRef = firebase.firestore().collection('chatrooms').doc(conversationId).collection('messages')
      .where('delivered', '==', false)
    // .where('lastDeliveryDate', '<=', timestamp);

    // Update the `delivered` status for the chat and messages
    messagesRef.get().then((querySnapshot) => {
      const filteredMessages = querySnapshot.docs.filter(doc => doc.data().senderId !== uid);
      filteredMessages.forEach((doc) => {
        batch.update(doc.ref, { delivered: true, lastDeliveryDate: firebase.firestore.FieldValue.serverTimestamp() });
      });

      if (filteredMessages.length > 0) {
        batch.commit().then(() => {
          console.log('Delivered status updated for chat and messages.');
        });
      }
    }).catch((error) => {
      console.error('Error retrieving messages for update: ', error);
    });
  }


  markMessagesAsRead(conversationId: string, userId: string, friendId: string): Promise<void> {
    // console.log('User ID:', userId);
    // console.log('Conversation ID:', conversationId);
    const messagesRef = firebase.firestore()
      .collection('chatrooms')
      .doc(conversationId)
      .collection('messages')
      .where('senderId', '==', friendId)
      .where('isRead', '==', false);

    return messagesRef.get().then((querySnapshot) => {
      const batch = firebase.firestore().batch();

      // console.log(`Found ${querySnapshot.size} unread messages.`);  // Log number of unread messages

      querySnapshot.forEach((doc) => {
        console.log('Marking message as read:', doc.id);  // Log each message being updated
        batch.update(doc.ref, { isRead: true });
      });

      // If there are no messages to update, log this fact
      if (querySnapshot.size === 0) {
        console.log('No messages to mark as read.');
        return Promise.resolve(); // No messages to update, resolve immediately
      }

      return batch.commit().then(() => {
        // console.log('Messages marked as read');
        // Update chat summary (reset unread count)
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
    const chatSummaryRef = firebase.firestore()
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

  async sendGift(
    giftDetails: { id: string; gem: number; name: string; picture: string },
    conversationId: string,
    friend_id: string,
    uid: string,
    user_profile: any,
    friend_profile: any
  ): Promise<{ success: boolean; message?: string }> {
    const firestore = firebase.firestore();

    try {
      const result = await firestore.runTransaction(async (transaction) => {
        const userRef = firestore.collection('profiles').doc(uid);
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.data();

        if (!userData) {
          throw new Error('User not found');
        }

        if (userData.credits < giftDetails.gem) {
          throw new Error('Insufficient credits');
        }

        const conversationRef = firestore.collection('chatrooms').doc(conversationId);
        const messagesRef = conversationRef.collection('messages').doc(); // Auto-generate a unique ID
        const userChatRef = firestore.collection('users').doc(uid).collection('chats').doc(friend_id);
        const otherUserChatRef = firestore.collection('users').doc(friend_id).collection('chats').doc(uid);
        const giftTransactionRef = firestore.collection('gift_transactions').doc();

        // Prepare new gift data
        const newGift = {
          senderId: uid,
          giftId: giftDetails.id || '',
          giftPrice: giftDetails.gem,
          giftName: giftDetails.name,
          giftPicture: giftDetails.picture,
          type: "gift",
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          localTimestamp: new Date().getTime(),
          isDelivered: false,
          isRead: false,
          isDeleted: false,
        };

        // Perform operations inside transaction
        transaction.set(messagesRef, newGift);

        const conversationData = {
          participants: [friend_id, uid],
          lastMessage: {
            text: `Gift: ${giftDetails.name}`, // gift message
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

        transaction.set(conversationRef, conversationData, { merge: true });

        transaction.set(otherUserChatRef, {
          lastMessage: `Gift: ${giftDetails.name}`, // gift message
          lastMessageType: "gift",
          lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
          lastMessageBy: uid,
          picture: user_profile['picture'],
          name: user_profile['name'],
          uid: uid,
          unreadCount: 0,
          delivered: false,
        }, { merge: true });

        transaction.set(userChatRef, {
          lastMessage: `Gift: ${giftDetails.name}`, // gift message
          lastMessageType: "gift",
          lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
          lastMessageBy: uid,
          picture: friend_profile['picture'] || '',
          name: friend_profile['name'] || '',
          uid: friend_id,
          unreadCount: firebase.firestore.FieldValue.increment(1),
          delivered: false,
        }, { merge: true });

        transaction.set(giftTransactionRef, {
          giftPrice: giftDetails.gem,
          giftId: giftDetails.id,
          giftName: giftDetails.name,
          giftPicture: giftDetails.picture,
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
      });

      return { success: true };
    } catch (error) {
      console.error('Error in transaction:', error);
      return { success: false, message: error.message };
    }
  }

  updateProfile(uid: string, profileData: any): Promise<void> {
    return firebase.firestore().collection('profiles').doc(uid).update(profileData)
      .then(() => {
        console.log('Profile updated successfully.');
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
      });

    let profile = {
      gender: "",
      picture: "",
      name: "",
      album: "",
      uid: "",
      guest: true,
      password: "",
      username: "",
      credits: 0,
      id: 'xx',
      age: "",
      weight: 0,
      height: 0,
      language: [],
      description: "",
      rate: 1.50,
      verified: true,
      interests: [],
      country: "",
    }
  }

  async topUpCredits(uid: string, topupPackage: { amount: number, bonus: string, gem: number }, method: string): Promise<void> {
    console.log(uid, topupPackage)
    const firestore = firebase.firestore();
    const userRef = firestore.collection('profiles').doc(uid);
    const transactionsRef = firestore.collection('transactions').doc(); // Auto-generate transaction ID

    const topUpAmount = topupPackage['gem']; // Total credits (amount + bonus)
    // Prepare transaction data
    const transactionData = {
      amount: topupPackage.amount,
      bonus: topupPackage.bonus,
      credits: topupPackage.gem,
      method: method || 'online',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      type: 'topup',
      uid: uid
    };

    // Run transaction to update user's credits and record the transaction
    return firestore.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error("User does not exist!");
      }

      // Increment the user's credits
      transaction.update(userRef, {
        credits: firebase.firestore.FieldValue.increment(topUpAmount)
      });

      // Record the transaction
      transaction.set(transactionsRef, transactionData);
    }).then(() => {
    }).catch((error) => {
      throw error; // Rethrow the error for further handling
    });
  }

  async createRoom(uid: string, roomData: any): Promise<{ success: boolean; roomId?: string; transactionId?: string; newCredits?: number; message?: string }> {
    const roomRef = firebase.firestore().collection('rooms').doc(); // Create a new room document
    const transactionRef = firebase.firestore().collection('transactions').doc(); // Create a new transaction document
    const userRef = firebase.firestore().collection('profiles').doc(uid); // Reference to the user's profile (where credits are stored)

    console.log(uid, roomData);
    try {
      const result = await firebase.firestore().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists) {
          throw new Error('User not found');
        }

        const userCredits = userDoc.data().credits;
        const totalCost = roomData.total;

        // Check if the user has enough credits
        if (userCredits < totalCost) {
          throw new Error('Insufficient credits');
        }

        // Deduct the total cost from the user's credits
        const newCredits = userCredits - totalCost;
        transaction.update(userRef, { credits: newCredits });

        // Add room data to 'rooms' collection
        transaction.set(roomRef, {
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          byName: roomData['byName'] || '',
          byUid: uid || '',
          byPicture: roomData['byPicture'] || '',
          status: "pending",
          deposit: roomData['deposit'],
          fee: roomData['fee'] || 0,
          total_initial: roomData['total'],
          balance: roomData['total'] - roomData['fee'],
          title: roomData['title'] || "",
          description: roomData['description'] || "",
          locationId: roomData.locationId,
          locationName: roomData.locationName,
          date: roomData.date,
          datetime: roomData.datetime,
          time_start: roomData['time_start'],
          time_end: roomData['time_end'],
          duration: roomData['duration'],
          gender: roomData['gender'] || ['female'],
          preferences: roomData['preferences'],
          users: roomData['users'] || [uid],
        });

        // Add transaction data to 'transactions' collection
        transaction.set(transactionRef, {
          byName: roomData.byName,
          byUid: roomData.uid,
          event_id: roomRef.id,
          event_date: roomData.date,
          status: "pending",
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          total: roomData.total || 0,
          fee: roomData.fee || 0,
          type: 'party',
          deposit: roomData.deposit || 0,
        });

        // Add room reference under user's rooms
        const userRoomsRef = firebase.firestore().collection('users').doc(uid).collection('rooms').doc(roomRef.id);
        transaction.set(userRoomsRef, {
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          byName: roomData['byName'] || '',
          byUid: uid || '',
          status: "pending",
          deposit: roomData['deposit'],
          fee: roomData['fee'] || 0,
          total_initial: roomData['total'],
          balance: roomData['total'] - roomData['fee'],
          title: roomData['title'] || "",
          description: roomData['description'] || "",
          locationId: roomData.locationId,
          locationName: roomData.locationName,
          date: roomData.date,
          datetime: roomData.datetime,
          time_start: roomData['time_start'],
          time_end: roomData['time_end'],
          duration: roomData['duration'],
          gender: roomData['gender'] || ['female'],
          preferences: roomData['preferences'],
          users: roomData['users'] || [uid],
        });

        // type = party gift transfer topup

        // Add transaction reference under user's transactions
        const userTransRef = firebase.firestore().collection('users').doc(uid).collection('transactions').doc(transactionRef.id);
        transaction.set(userTransRef, {
          transactionId: transactionRef.id,
          event_id: roomRef.id,
          event_date: roomData.date,
          total: roomData.total || 0,
          fee: roomData.fee || 0,
          type: 'party',
          deposit: roomData.deposit || 0,
          status: "pending",
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });

        return { roomId: roomRef.id, transactionId: transactionRef.id, newCredits };
      });

      console.log('Room, transaction, and credit deduction successful:', result);
      return { success: true, ...result };
    } catch (error) {
      console.error('Transaction failed: ', error);
      return { success: false, message: error.message };
    }
  }

  requestJoinParty(roomId: string, hostId: string, uid: string, profile: { name: string; picture: string; rate: number, uid: string }): Promise<any> {
    const roomRef = firebase.firestore().collection('rooms').doc(roomId);
    const userRef = firebase.firestore().collection('users').doc(hostId); // Reference to user's document

    const batch = firebase.firestore().batch(); // Initialize batch

    // Step 1: Update the room (add user to the room and profile to applicants)
    batch.update(roomRef, {
      users: firebase.firestore.FieldValue.arrayUnion(uid),
      applicants: firebase.firestore.FieldValue.arrayUnion(profile)
    });

    // Step 2: Update the user's document (add room to the user's rooms collection)
    const userRoomsRef = userRef.collection('rooms').doc(roomId);
    batch.set(userRoomsRef, {
      users: firebase.firestore.FieldValue.arrayUnion(uid),
      applicants: firebase.firestore.FieldValue.arrayUnion(profile)
    });

    // Commit the batch
    return batch.commit()
      .then(() => {
        // Return a custom response after the batch commit
        return { success: true, message: 'Successfully joined the party', roomId, uid };
      })
      .catch((error) => {
        console.error('Error updating room and user profile:', error);
        throw error; // Optionally re-throw the error if needed
      });
  }

  async acceptUserToParty(roomId: string, hostId: string, profile: { name: string; picture: string; rate: number, uid: string }): Promise<any> {
    const roomRef = firebase.firestore().collection('rooms').doc(roomId);
    const hostRef = firebase.firestore().collection('users').doc(hostId); // Host's user document

    try {
      // Run Firestore transaction
      const result = await firebase.firestore().runTransaction(async (transaction) => {
        const roomDoc = await transaction.get(roomRef);

        // Check if the user exists and has sufficient credits

        const roomBalance = roomDoc.data().balance;
        const userRate = profile['rate']
        if (userRate < roomBalance) {
          throw new Error('Insufficient credits');
        }

        // Deduct the credits from the user
        const newCredits = roomBalance - userRate;
        transaction.update(roomRef, {
          balance: newCredits,
          participants: firebase.firestore.FieldValue.arrayUnion(profile.uid),
          applicants: firebase.firestore.FieldValue.arrayRemove(profile),
          subtotal: firebase.firestore.FieldValue.increment(userRate),
        });


        const hostRoomRef = hostRef.collection('rooms').doc(roomId);
        transaction.update(hostRoomRef, {
          balance: newCredits,
          subtotal: firebase.firestore.FieldValue.increment(userRate),
          participants: firebase.firestore.FieldValue.arrayUnion(profile.uid),
          applicants: firebase.firestore.FieldValue.arrayRemove(profile)
        });

        // *** need to update girls side for jobs and send notification to the girl ***

        return { newCredits, roomId, profile };
      });

      console.log('Transaction successful:', result);
      return { success: true, ...result };
    } catch (error) {
      console.error('Transaction failed:', error);
      return { success: false, message: error.message };
    }
  }

  async rejectUserFromParty(roomId: string, hostId: string, profile: { name: string; picture: string; rate: number, uid: string }): Promise<any> {
    const roomRef = firebase.firestore().collection('rooms').doc(roomId);
    const hostRef = firebase.firestore().collection('users').doc(hostId).collection('rooms').doc(roomId);

    // Create a Firestore batch
    const batch = firebase.firestore().batch();

    // Step 1: Update the room (remove user from applicants)
    batch.update(roomRef, {
      applicants: firebase.firestore.FieldValue.arrayRemove(profile),
      rejections: firebase.firestore.FieldValue.arrayUnion(profile),
    });

    // Step 2: Update the host's room data
    batch.update(hostRef, {
      applicants: firebase.firestore.FieldValue.arrayRemove(profile),
      rejections: firebase.firestore.FieldValue.arrayUnion(profile),
    });

    try {
      // Commit the batch operation
      await batch.commit();
      console.log(`User ${profile.uid} rejected successfully from room ${roomId}`);
      return { success: true, roomId, profile };
    } catch (error) {
      console.error('Batch update failed:', error);
      return { success: false, message: error.message };
    }
  }


  async guestCheckin(uid: string, outlet: { name: string; id: string }, profile: { name: string; picture: string; uid: string }, old_outlet): Promise<any> {
    console.log(uid, outlet, old_outlet)
    const firestore = firebase.firestore();
    const batch = firestore.batch();

    const checkinRef = firestore.collection('checkins').doc(outlet.id);
    const locationRef = firestore.collection('profiles').doc(uid);

    // Check if the documents exist
    if (outlet.id != old_outlet && old_outlet) firestore.collection('checkins').doc(old_outlet).set({ guest: firebase.firestore.FieldValue.arrayRemove(profile), users: firebase.firestore.FieldValue.arrayRemove(uid) }, { merge: true });
    checkinRef.set({ guest: firebase.firestore.FieldValue.arrayUnion(profile), users: firebase.firestore.FieldValue.arrayUnion(uid) }, { merge: true });

    // Prepare the location update in the batch
    batch.set(locationRef, {
      visitTime: firebase.firestore.FieldValue.serverTimestamp(), // Correctly use serverTimestamp
      visitId: outlet.id,
      visitName: outlet.name
    }, { merge: true }); // Merge the new data with existing data

    // Commit the batch
    return batch.commit()
      .then(() => {
        console.log('Batch commit successful');
        return { success: true, message: 'Successfully checked in as guest' };
      })
      .catch((error) => {
        console.error('Error updating room check-in and user profile:', error);
        throw error; // Optionally re-throw the error if needed
      });
  }


  scarAmbassadorQR(partyId: string, uid: string) {
    // set job
    // set transaction
    // set room
    // set girl
    // set user
  }

}
