import { Component } from '@angular/core';
import firebase from 'firebase'
import { FIREBASE_CONFIG } from './app.firebase.config';
import { register } from 'swiper/element/bundle';
import { DataService } from './services/data.service';
import { DexieService } from './services/dexie.service';
import { ToolService } from './services/tool.service';
import { ReadService } from './services/read.service';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private dataService: DataService,
    public tool: ToolService,
    private readService: ReadService,
    private dexieService: DexieService,
  ) {
    firebase.initializeApp(FIREBASE_CONFIG);

    firebase.auth().onAuthStateChanged(user => {
      console.log(user);

      if (user) {
        // Fetch the user's profile in real-time
        firebase.firestore().collection('profiles').doc(user.uid).onSnapshot((doc: any) => {
          if (doc.exists) {
            console.log(user.uid)
            localStorage.setItem('heyu_uid',user.uid)
            console.log(doc.data());

            // Save user ID in localStorage
            // localStorage.setItem('heyu_uid', user.uid);
            console.log(user.uid)
            let holder = {
              id: user.uid,
              picture: doc.data().picture || '',
              name: doc.data().name || ""
            }
            console.log(holder)
            // this.dexieService.saveUserProfile(holder)
            // Update user data in the service
            this.dataService.updateUser(doc.data());

            // Subscribe to notifications (only once)
            this.subscribeToNotifications(user.uid);
          }
        }, error => {
          console.error('Error fetching user profile:', error);
        });
      } else {
        // Handle logout or unauthenticated state
        this.tool.navRoot('tabs/tab1', 'back');
        this.dataService.updateUser({});

        // Unsubscribe if there's an active listener
        this.unsubscribeIfActive();
      }
    });
  }

  unsubscribe: () => void = () => { };
  notifications = [];

  subscribeToNotifications(uid: string) {
    // Unsubscribe any previous listener to avoid multiple listeners
    this.unsubscribeIfActive();

    // Subscribe to notifications for the current user
    const subscription = this.readService.listenNotifications(uid).subscribe(
      notifications => {
        console.log('Received notifications:', notifications);
        // Update notifications array or handle notifications here
        this.notifications = notifications;
      },
      error => {
        console.error('Error listening to notifications:', error);
      }
    );

    // Store the unsubscribe method
    this.unsubscribe = () => subscription.unsubscribe();
  }

  unsubscribeIfActive() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  // Ensure unsubscription on component destruction
  ngOnDestroy() {
    this.unsubscribeIfActive();
  }

  // Ensure unsubscription when user logs out manually
  whenLogout() {
    this.unsubscribeIfActive();
  }

}