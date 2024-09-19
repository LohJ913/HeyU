import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';

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
  ) { }

  ngOnInit() {
  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

}
