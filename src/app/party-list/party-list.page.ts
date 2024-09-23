import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import { ReadService } from '../services/read.service';
import { WriteService } from '../services/write.service';

@Component({
  selector: 'app-party-list',
  templateUrl: './party-list.page.html',
  styleUrls: ['./party-list.page.scss'],
})
export class PartyListPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    public tool: ToolService,
    private readService: ReadService,
    private writeService: WriteService,
  ) { }

  partyrooms: any = []

  ngOnInit() {

    this.readService.getPartyList().then((data) => {
      console.log(data)
      this.partyrooms = data || []
    })

  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

  viewParty(item: any) {
    this.navCtrl.navigateForward(`party-detail?id=${item.id}`)
  }

}
