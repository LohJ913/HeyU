import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

export interface ChatMessage {
  id?: number;
  conversationId: string;
  senderId: string;
  timestamp: number;
  message: string;
  type: string,
  picture: '',
  localTimestamp: number,
  isRead: boolean,
  isDelivered: boolean,
  isDeleted: boolean,
}

export interface UserProfile {
  id: string;  // Unique identifier for the user
  picture: string;  // Optional picture field
  name: string;     // Optional name field
}

@Injectable({
  providedIn: 'root'
})
export class DexieService extends Dexie {

  chatMessages: Table<ChatMessage>; // Define your chatMessages table
  userProfile: any;

  constructor() {
    super('HeyuAppDB'); // Call the parent constructor with the database name

    // Define tables and indexes
    this.version(1).stores({
      chatMessages: '++id, conversationId, senderId, timestamp, localTimestamp, isDeleted, isRead, date, type', // Define indexes
      userProfile: ' ++id, picture, name'
    });

    this.chatMessages = this.table('chatMessages');
  }

  // Add a chat message
  async addMessage(message: ChatMessage) {
    try {
      console.log(message);

      // Add the message to the chatMessages table
      await this.chatMessages.add(message);

      // Retrieve the messages after the message is added
      const messages = await this.getMessagesByConversation(message['conversationId']);

      // Log the array of messages (resolved)
      console.log(messages);  // This should log an array of message objects

    } catch (error) {
      console.error('Error adding or retrieving messages:', error);
    }
  }

  // Get all chat messages by conversationId
  async getMessagesByConversation(conversationId: string): Promise<ChatMessage[]> {
    return this.chatMessages
      .where('conversationId')
      .equals(conversationId)
      .toArray();
  }

  // Clear all messages for a conversation
  clearMessages(conversationId: string) {
    return this.chatMessages
      .where('conversationId')
      .equals(conversationId)
      .delete();
  }

  putMessage(message: ChatMessage) {
    console.log(message);
    return this.chatMessages.put(message)  // Use put() to add or update
      .then(() => {
        console.log(`Message with id ${message.id} added or updated.`);
      })
      .catch(error => {
        console.error('Error saving message:', error);
      });
  }


  bulkAddOrUpdateMessages(messages: ChatMessage[]) {
    return this.chatMessages.bulkPut(messages)
      .then(() => {
        console.log(`Bulk added/updated ${messages.length} messages.`);
      })
      .catch(error => {
        console.error('Error performing bulk add/update in Dexie:', error);
      });
  }

  // Clear all chat messages from the table
  clearAllData() {
    return this.chatMessages.clear(); // Clears all entries in the chatMessages table
  }

  // Clear the entire database
  clearDatabase() {
    return this.delete(); // This will delete the entire Dexie database
  }


  saveUserProfile(userProfile: UserProfile) {
    console.log(userProfile)
    return this.userProfile
      .put(userProfile)  // This will create or update based on the uid
      .then(() => {
        console.log(`User profile for uid ${userProfile.id} saved or updated.`);
      })
      .catch((error) => {
        console.error('Error saving user profile:', error);
      });
  }

  getUserProfile(uid: string): Promise<UserProfile | undefined> {
    console.log(uid)
    return this.userProfile
      .where('id')  // Use 'uid' instead of 'id'
      .equals(uid)   // Find by uid
      .first()       // Return the first match (since uid should be unique)
      .then((profile) => {
        if (profile) {
          console.log(`User profile retrieved for uid ${uid}:`, profile);
          return profile;  // Return the retrieved profile
        } else {
          console.log(`User profile with uid ${uid} not found.`);
          return undefined;  // Return undefined if not found
        }
      })
      .catch((error) => {
        console.error('Error retrieving user profile:', error);
        throw error;  // Re-throw the error for handling elsewhere
      });
  }

}
