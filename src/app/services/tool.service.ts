import { Injectable, Optional } from '@angular/core';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToolService {

  constructor(
    private navCtrl: NavController
  ) { }

  lengthof(x) {
    return x ? Object.keys(x).length : 0
  }

  navTo(path) {
    this.navCtrl.navigateForward(path)
  }
}
