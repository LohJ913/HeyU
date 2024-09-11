import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';

@Component({
  selector: 'app-topup',
  templateUrl: './topup.page.html',
  styleUrls: ['./topup.page.scss'],
})
export class TopupPage implements OnInit {

  packageList = [
    {
      amount: 5000,
      bonus: 0,
      gem: 500,
      id: 'P001'
    },
    {
      amount: 10000,
      bonus: 10,
      gem: 1000,
      id: 'P002'
    },
    {
      amount: 15000,
      bonus: 15,
      gem: 3500,
      id: 'P003'
    },
    {
      amount: 20000,
      bonus: 30,
      gem: 5000,
      id: 'P004'
    },
    {
      amount: 25000,
      bonus: 50,
      gem: 10500,
      id: 'P005'
    },
    {
      amount: 30000,
      bonus: 75,
      gem: 25000,
      id: 'P006'
    }
  ]

  selectedPackage: any = {};

  constructor(
    public router: IonRouterOutlet,
    public navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  back() {
    this.router.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

  selectPackage(pack) {
    this.selectedPackage = pack;
  }
}
