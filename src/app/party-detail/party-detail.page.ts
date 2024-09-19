import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';

@Component({
  selector: 'app-party-detail',
  templateUrl: './party-detail.page.html',
  styleUrls: ['./party-detail.page.scss'],
})
export class PartyDetailPage implements OnInit {

  participant_list = [
    {
      name: 'Xiao A',
      thumbnail: 'https://img.freepik.com/premium-photo/asian-girls-education-happy-beautiful-asian-girl-is-smilling_911620-8519.jpg'
    },
    {
      name: 'Xiao B',
      thumbnail: 'https://img.freepik.com/premium-photo/asian-girls-education-happy-beautiful-asian-girl-is-smilling_911620-8519.jpg'
    },
    {
      name: 'Xiao C',
      thumbnail: 'https://img.freepik.com/premium-photo/asian-girls-education-happy-beautiful-asian-girl-is-smilling_911620-8519.jpg'
    },
    {
      name: 'Xiao D',
      thumbnail: 'https://img.freepik.com/premium-photo/asian-girls-education-happy-beautiful-asian-girl-is-smilling_911620-8519.jpg'
    },
    {},
    {},
    {},
    {}
  ]

  constructor(
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    public tool: ToolService,
  ) { }

  ngOnInit() {
  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('party-list', { animated: true, animationDirection: 'back' })
  }
}
