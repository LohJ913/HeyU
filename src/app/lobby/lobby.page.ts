import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';

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
  }

  lengthof(x) {
    return x ? Object.keys(x).length : 0
  }

  back() {
    this.router.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

}
