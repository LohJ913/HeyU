import { Component, OnInit } from '@angular/core';
import { ReadService } from '../services/read.service';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  uid = localStorage.getItem('heyu_uid')
  notifications = [];

  constructor(
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    public tool: ToolService,
    private readService: ReadService
  ) {

  }

  ngOnInit() {
    this.subscribeToNotifications(this.uid)
  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab2', { animated: true, animationDirection: 'back' })
  }

  unsubscribe: () => void = () => { };

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

}
