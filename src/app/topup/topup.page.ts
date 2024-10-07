import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import { MaskitoOptions, MaskitoElementPredicate, maskitoTransform } from '@maskito/core';
import { ReadService } from '../services/read.service';
import { WriteService } from '../services/write.service';
import { DataService } from '../services/data.service';
import { Subscription, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-topup',
  templateUrl: './topup.page.html',
  styleUrls: ['./topup.page.scss'],
})
export class TopupPage implements OnInit {

  readonly cardMask: MaskitoOptions = {
    mask: [
      ...Array(4).fill(/\d/),
      ' ',
      ...Array(4).fill(/\d/),
      ' ',
      ...Array(4).fill(/\d/),
      ' ',
      ...Array(4).fill(/\d/),
      ' ',
      ...Array(3).fill(/\d/),
    ],
  };

  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();

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
  paymentTrigger: boolean = false;
  tabs = ['Card', 'FPX', 'Cash']
  tab = 'Card'
  savedCards = [
    {
      id: 1,
      type: 'Mastercard',
      name: 'IOI Mastercard',
      number: 1234,
      default: true
    },
    {
      id: 2,
      type: 'Mastercard',
      name: 'IOI Mastercard',
      number: 5678
    }
  ]

  uid = localStorage.getItem('heyu_uid') || ''

  constructor(
    public router: IonRouterOutlet,
    public navCtrl: NavController,
    private readService: ReadService,
    private writeService: WriteService,
    private dataService: DataService,
  ) { }

  currentUser: any = {}
  userSubscribe: any;

  ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = info
      console.log(info)
    })
  }


  selectTab(ev) {
    this.tab = ev.detail.value
  }

  makePayment() {

    this.writeService.topUpCredits(this.uid, this.selectedPackage, 'online')
      .then(() => {
        console.log('Credits successfully topped up!');
        // swal it 
      })
      .catch((error) => {
        console.error('Error during top-up:', error);
      });
  }

  compareWith(o1, o2) {
    return o1.id === o2.id;
  }

  handleChange(ev) {
    console.log('Current value:', JSON.stringify(ev.target.value));
  }

  trackItems(index: number, item: any) {
    return item.id;
  }

  setDefault(cardId: number) {
    this.savedCards.forEach(card => {
      card.default = card.id === cardId;
    });

  }

  back() {
    this.router.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

  goHistory() {
    this.navCtrl.navigateForward('transaction-list')
  }

}



