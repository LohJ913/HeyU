import { Component, OnInit } from '@angular/core';
import { ToolService } from '../services/tool.service';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import firebase from 'firebase';
import 'firebase/auth'

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

  guestLogin() {
    firebase.auth().signInAnonymously().then(() => {

    })
  }
}
