import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import { DataService } from '../services/data.service';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { ReadService } from '../services/read.service';

@Component({
  selector: 'app-earning-list',
  templateUrl: './earning-list.page.html',
  styleUrls: ['./earning-list.page.scss'],
})
export class EarningListPage implements OnInit {

  transactionList = [
    {
      date: 1727716857000,
      desc: "Gifting from MR OH",
      amount: 1000
    },
    {
      date: 1727716857000,
      desc: "Withdrawal",
      amount: -1000
    },
    {
      date: 1727716857000,
      desc: "Party room AB001",
      amount: 1000
    }
  ]

  constructor(
    private router: IonRouterOutlet,
    private navCtrl: NavController,
    public tool: ToolService,
    private dataService: DataService,
    private readService: ReadService,
  ) { }

  userSubscribe;
  currentUser: any;
  ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = info
      // console.log(info)
    })
  }


  ngOnDestroy() {
    if (this.userSubscribe) this.userSubscribe.unsubscribe();
  }

  back() {
    this.router.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

  logScrolling(ev) {
    let header = document.getElementById('header')
    let scrollTop = ev.detail.scrollTop
    var opacity = (scrollTop / 100);

    header.style.background = `linear-gradient(180deg, rgba(6,6,14,${opacity}) 0%, rgba(6,6,14,0) 100%)`;
  }

}
