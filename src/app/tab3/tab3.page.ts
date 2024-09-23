import { Component, OnInit } from '@angular/core';
import firebase from 'firebase';
import 'firebase/auth'
import { DataService } from '../services/data.service';
import { ToolService } from '../services/tool.service';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  userSubscribe: Subscription;
  currentUser: any = {};

  constructor(
    public tool: ToolService,
    private dataService: DataService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = info
    })
  }

  logout() {
    firebase.auth().signOut().then(() => {
      this.userSubscribe.unsubscribe()
    })
  }

  bindAccount() {
    console.log(this.currentUser);

    let body = {
      uid: this.currentUser['id'],
      email: 'heytest003@heyu.com',
      password: '123123123'
    }

    this.http.post('https://us-central1-heyu-bed49.cloudfunctions.net/requests/bindUserAccount', body).subscribe(res => {
      console.log(res);

    })
  }
}
