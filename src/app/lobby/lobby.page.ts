import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import firebase from 'firebase'

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  styleUrls: ['./lobby.page.scss'],
})
export class LobbyPage implements OnInit {


  places = [
    {
      photo: '',
      name: 'Tang Ping 躺平',
      address: ' 7, Jalan SS 13/6c Subang Jaya Industrial Estate, Ss 13 Kuala Lumpur, 47500 Subang Jaya, Selangor',
    },
    {
      photo: '',
      name: 'Tang Ping 躺平',
      address: ' 7, Jalan SS 13/6c Subang Jaya Industrial Estate, Ss 13 Kuala Lumpur, 47500 Subang Jaya, Selangor',
    },
    {
      photo: '',
      name: 'Tang Ping 躺平',
      address: ' 7, Jalan SS 13/6c Subang Jaya Industrial Estate, Ss 13 Kuala Lumpur, 47500 Subang Jaya, Selangor',
    }, {
      photo: '',
      name: 'Tang Ping 躺平',
      address: ' 7, Jalan SS 13/6c Subang Jaya Industrial Estate, Ss 13 Kuala Lumpur, 47500 Subang Jaya, Selangor',
    }
  ]

  constructor(private router: IonRouterOutlet,
    private navCtrl: NavController) { }

  ngOnInit() {
    firebase.auth().onAuthStateChanged(()=>{
    // this.convertAnonymousToEmailPassword('batman@heyu.com', '123123')

    })
  }

  lengthof(x) {
    return x ? Object.keys(x).length : 0
  }

  back() {
    this.router.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

  async convertAnonymousToEmailPassword(email: string, password: string) {
    const user = firebase.auth().currentUser;
    console.log(user)

    if (user && user.isAnonymous) {
      try {
        // Create credentials with email and password
        const credential = firebase.auth.EmailAuthProvider.credential(email, password);
        // Link the anonymous account to email/password credentials
        const result = await user.linkWithCredential(credential);

        console.log('Anonymous account successfully linked to email:', result.user);
        return result.user; // The user is now linked with email/password

      } catch (error) {
        console.error('Error linking anonymous account to email/password:', error);
        throw error;
      }
    } else {
      console.log('User is not anonymous or not logged in');
      throw new Error('User is not anonymous or not logged in');
    }
  }
}
