import { Component } from '@angular/core';
import firebase from 'firebase'
import { FIREBASE_CONFIG } from './app.firebase.config';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
}
