import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import { ReadService } from '../services/read.service';
import { WriteService } from '../services/write.service';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-party-list',
  templateUrl: './party-list.page.html',
  styleUrls: ['./party-list.page.scss'],
})
export class PartyListPage implements OnInit {

  tabList = [
    {
      label: 'All Party',
      value: 'all_party',
      status: true,
      qty: null
    },
    {
      label: 'Invitation',
      value: 'invitation',
      status: true,
      qty: 10
    },
    {
      label: 'My Party',
      value: 'my_party',
      status: true,
      qty: null
    }
  ]
  tab = "all_party";
  partyrooms: any = []

  userSubscribe: Subscription;
  currentUser: any = {};

  constructor(
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    public tool: ToolService,
    private readService: ReadService,
    private writeService: WriteService,
    private dataService: DataService,
  ) { }

  ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = info
      console.log(this.currentUser);
    })

    this.readService.getPartyList().then((data) => {
      console.log(data)
      this.partyrooms = data || []
    })

  }

  get activeTabs() {
    if (!this.currentUser['verified'] || this.currentUser['verified'] == false) {
      this.tabList[0]['status'] = false
      this.tabList[1]['status'] = false
      this.tab = this.tabList[2]['value']
    }

    return this.tabList.filter(tab => tab.status)
  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

  viewParty(item: any) {
    this.navCtrl.navigateForward(`party-detail?id=${item.id}`)
  }
}
