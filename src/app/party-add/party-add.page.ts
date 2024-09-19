import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';

@Component({
  selector: 'app-party-add',
  templateUrl: './party-add.page.html',
  styleUrls: ['./party-add.page.scss'],
})
export class PartyAddPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    public tool: ToolService,
  ) { }

  gender = [
    {
      icon: 'assets/icon/male.svg',
      icon2: 'assets/icon/male_white.svg',
      name: 'Male',
      value: 'Male'
    },
    {
      icon: 'assets/icon/female.svg',
      icon2: 'assets/icon/female_white.svg',
      name: 'Female',
      value: 'female'
    },
    {
      icon: 'assets/icon/others.svg',
      icon2: 'assets/icon/others_white.svg',
      name: 'Others',
      value: 'others'
    }
  ]

  preferences = ['Sexy', 'Extrovert', '30 and above', 'Willing to drink', 'Below 30']
  paxNumber = ['5','10','20','30']
  selectedPax = ''
  selectedGender = ''
  selectedPreference = ''

  ngOnInit() {
  }

  selectGender(gender) {
    // this.user['gender'] = gender['value']
    this.selectedGender = gender['value']
  }

  selectPreference(prefer){
    this.selectedPreference = prefer
  }

  selectPax(pax){
    this.selectedPax = pax

  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }
}
