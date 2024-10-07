import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import { ReadService } from '../services/read.service';
import { WriteService } from '../services/write.service';
import { DataService } from '../services/data.service';
import { Subscription, distinctUntilChanged } from 'rxjs';
import firebase from 'firebase'
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-favourite-list',
  templateUrl: './favourite-list.page.html',
  styleUrls: ['./favourite-list.page.scss'],
})
export class FavouriteListPage implements OnInit {

  constructor(private ionRouter: IonRouterOutlet,
    private navCtrl: NavController,
    public toolService: ToolService,
    private readService: ReadService,
    private writeService: WriteService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,

  ) { }
  userSubscribe;
  uid = localStorage.getItem('heyu_uid')
  currentUser: any;
  id: any = ''
  people: any = []
  todate = new Date().getTime();

  ngOnInit() {

    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = info
    })

    this.readService.getFavoriteUsers(this.uid).then((res) => {
      console.log(res)
      this.people = (res).filter(a => (a['favorite'] = true)) || []
    })


    // this.activatedRoute.queryParams.subscribe(a => {
    //   this.id = a['id']
    // })


  }


  ngOnDestroy(): void {
    // Clean up the subscription to avoid memory leaks
    if (this.userSubscribe) {
      this.userSubscribe.unsubscribe();
    }
  }

  back() {
    this.ionRouter.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab3')
  }



  goUser(user: any) {
    this.navCtrl.navigateForward(`profile-user?id=${user['id']}`);
  }


  unfavorite(item: any, event: MouseEvent): void {
    event.stopPropagation(); // Prevents click on heart from triggering 'goUser'

    this.writeService.favoriteThisUser(this.uid, item.id, !item.favorite).then((res) => {
      item.favorite = res.favorite
      this.toolService.showToast(res.favorite == true ? 'User has been added back to list' : 'User has been removed from list', 'dark', 'bottom')
    })

  }
}
