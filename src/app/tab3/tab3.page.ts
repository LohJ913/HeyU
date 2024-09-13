import { Component } from '@angular/core';
import firebase from 'firebase';
import 'firebase/auth'

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor() { }

  logout() {
    firebase.auth().signOut()
  }

}
