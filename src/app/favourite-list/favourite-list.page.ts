import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';

@Component({
  selector: 'app-favourite-list',
  templateUrl: './favourite-list.page.html',
  styleUrls: ['./favourite-list.page.scss'],
})
export class FavouriteListPage implements OnInit {

  constructor(private ionRouter: IonRouterOutlet,
    private nav: NavController
  ) { }

  ngOnInit() {
  }

  back(){
    this.ionRouter.canGoBack() ? this.nav.pop() : this.nav.navigateRoot('tabs/tab3')
  }

}
