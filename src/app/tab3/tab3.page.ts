import { Component, OnInit } from '@angular/core';
import firebase from 'firebase';
import 'firebase/auth'
import { DataService } from '../services/data.service';
import { ToolService } from '../services/tool.service';
import { Subscription, distinctUntilChanged } from 'rxjs';

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
    private dataService: DataService
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

}
