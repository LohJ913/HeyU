import { Component } from '@angular/core';
import firebase from 'firebase'
import { FIREBASE_CONFIG } from './app.firebase.config';
import { register } from 'swiper/element/bundle';
import { DataService } from './services/data.service';
import { ToolService } from './services/tool.service';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private dataService: DataService,
    public tool: ToolService,
  ) {
    firebase.initializeApp(FIREBASE_CONFIG);

    firebase.auth().onAuthStateChanged(user => {
      console.log(user);

      if (user) {
        firebase.firestore().collection('profiles').doc(user.uid).onSnapshot((doc) => {
          if (doc.exists) {
            console.log(doc.data());

            dataService.updateUser(doc.data())
          }
        })
      } else {
        this.tool.navRoot('tabs/tab1', 'back')
        this.dataService.updateUser({})
      }

    })
  }
}
