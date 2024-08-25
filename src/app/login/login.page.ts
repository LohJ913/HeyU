import { Component, OnInit } from '@angular/core';
import { ToolService } from '../services/tool.service';
import { IonRouterOutlet, NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    public tool: ToolService
  ) { }

  ngOnInit() {
  }

}
