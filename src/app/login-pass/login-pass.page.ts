import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';

@Component({
  selector: 'app-login-pass',
  templateUrl: './login-pass.page.html',
  styleUrls: ['./login-pass.page.scss'],
})
export class LoginPassPage implements OnInit {

  constructor(
    public tool: ToolService,
    private navCtrl: NavController,
    public route: IonRouterOutlet,
  ) { }

  ngOnInit() {
  }

  back() {
    this.navCtrl.pop()
  }
}
