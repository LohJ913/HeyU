import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-party-detail',
  templateUrl: './party-detail.page.html',
  styleUrls: ['./party-detail.page.scss'],
})
export class PartyDetailPage implements OnInit {

  userSubscribe: Subscription;
  currentUser: any = {};

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

  groupChatList = [
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 101',
      message: '<b>Somebody</b> has joined this party',
      type: 'system',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: 'zvEm4ws0JUQrd15xI7eSFSOLRAA2',
      name: 'Girl 1',
      message: 'Hello Everyone! hjk ahsk jdhkas kajshdkj ashkjd kash dkahkjd kjah sdkhasjk kahs kdha',
      type: 'text',
      date: 1727022599
    }
  ]

  joined: boolean = false;

  constructor(
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    public tool: ToolService,
    private dataService: DataService,
  ) { }

  ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = info
      console.log(this.currentUser);
      
    })
  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('party-list', { animated: true, animationDirection: 'back' })
  }
}
