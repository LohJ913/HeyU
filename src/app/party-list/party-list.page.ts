import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import { ReadService } from '../services/read.service';
import { WriteService } from '../services/write.service';
import { Subscription, distinctUntilChanged, filter } from 'rxjs';
import { DataService } from '../services/data.service';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase'

@Component({
  selector: 'app-party-list',
  templateUrl: './party-list.page.html',
  styleUrls: ['./party-list.page.scss'],
})
export class PartyListPage implements OnInit {
  activeTabs: any[] = [];
  tabList = [
    {
      label: 'My Party',
      value: 'my_party',
      status: true,
      qty: 0
    },
    {
      label: 'All Party',
      value: 'all_party',
      status: false,
      qty: 0
    },
    {
      label: 'Invitation',
      value: 'invitation',
      status: false,
      qty: 0
    },
  ]
  tab = "my_party";
  partyrooms: any = []
  filteredrooms: any = []
  userSubscribe: Subscription;
  currentUser: any = {};


  constructor(
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    public tool: ToolService,
    private readService: ReadService,
    private activatedRoute: ActivatedRoute,
    private writeService: WriteService,
    private dataService: DataService,
  ) { }
  rooms: any = []
  roomsSubscription: Subscription;
  uid = localStorage.getItem('heyu_uid')
  ngOnInit() {

    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = info
      console.log(this.currentUser);
      this.getPartyMode(this.currentUser['verified'] ? 'verified' : 'normal')
      this.updateActiveTabs()
    })
  }

  ngOnDestroy(): void {
    // Clean up the subscription to avoid memory leaks
    if (this.roomsSubscription) {
      this.roomsSubscription.unsubscribe();
      console.log('Unsubscribed from Firestore listener');
    }
  }


  getPartyMode(type: any) {
    switch (type) {
      case "verified":
        console.log('yes')
        this.subMyParties()
        this.getPartyRocking()
        break;
      case "normal":
        console.log('no')
        this.subMyParties()
        break
    }
  }

  subMyParties() {
    this.roomsSubscription = this.readService.subMyHostings(this.currentUser['id'] || this.uid).subscribe(
      (rooms) => {
        let myparties: any = rooms.filter((a) => (a['localtype'] = 'my_party', a['roomId'] = a['id'].substring(a['id'].length - 5))).sort((a: any, b: any) => (a['datetime'] - b['datetime']));  // Update rooms data when Firestore sends updates
        if (this.partyrooms.length === 0) {
          // If partyrooms is empty, assign myparties directly
          this.tabList[0].qty += this.tool.lengthof(rooms)
          this.partyrooms = [...myparties];
          this.filterList()
        } else {
          // Efficiently update or replace rooms in partyrooms if it's not empty
          for (let i = 0; i < myparties.length; i++) {
            const party = myparties[i];
            const existingIndex = this.partyrooms.findIndex(p => p.id === party.id);

            if (existingIndex !== -1) {
              // Room already exists, replace it
              this.partyrooms[existingIndex] = party;
            } else {
              // Room is new, add it
              this.tabList[0].qty++
              this.partyrooms.push(party);
            }
          }
          this.filterList()
        }
      },
      (error) => {
        console.error('Error in subscription:', error);
      }
    );
  }

  getPartyRocking() {
    this.readService.getPartiesAsAmbassador(this.uid, this.currentUser['gender'] || 'female').then((parties) => {
      console.log(parties)

      if (this.tool.lengthof(parties?.['rooms'])) {
        console.log(parties?.['rooms'])
        let pubparties: any = parties?.['rooms'].filter((a) => (a['localtype'] = 'all_party', a['roomId'] = a['id'].substring(a['id'].length - 5)) && a['byUid'] != (this.currentUser['id'] || this.uid)).sort((a: any, b: any) => (a['datetime'] - b['datetime']));  // Update rooms data when Firestore sends updates
        if (this.partyrooms.length === 0) {
          // If partyrooms is empty, assign myparties directly
          this.partyrooms = [...pubparties];
          this.tabList[1].qty += this.tool.lengthof(parties?.['rooms'])
          this.filterList()
        } else {
          // Efficiently update or replace rooms in partyrooms if it's not empty
          for (let i = 0; i < pubparties.length; i++) {
            const party = pubparties[i];
            const existingIndex = this.partyrooms.findIndex(p => p.id === party.id);

            if (existingIndex !== -1) {
              // Room already exists, replace it
              this.partyrooms[existingIndex] = party;
            } else {
              // Room is new, add it
              this.tabList[1].qty++
              this.partyrooms.push(party);
            }
          }
          this.filterList()
        }
      }

      if (this.tool.lengthof(parties?.['invites'])) {
        let pubparties: any = parties?.['invites'].filter((a) => (a['localtype'] = 'invitation', a['roomId'] = a['id'].substring(a['id'].length - 5))).sort((a: any, b: any) => (a['datetime'] - b['datetime']));  // Update rooms data when Firestore sends updates
        if (this.partyrooms.length === 0) {
          // If partyrooms is empty, assign myparties directly
          this.partyrooms = [...pubparties];
          this.tabList[1].qty += this.tool.lengthof(parties?.['invites'])
          this.filterList()
        } else {
          // Efficiently update or replace rooms in partyrooms if it's not empty
          for (let i = 0; i < pubparties.length; i++) {
            const party = pubparties[i];
            const existingIndex = this.partyrooms.findIndex(p => p.id === party.id);
            console.log(party)
            if (existingIndex !== -1) {
              // Room already exists, replace it
              this.partyrooms[existingIndex] = party;
            } else {
              // Room is new, add it
              this.tabList[1].qty++
              this.partyrooms.push(party);
            }
          }
          this.filterList()
        }
      }


    })
  }

  updateActiveTabs() {
    if (this.currentUser['verified']) {
      this.tabList.filter((a: any) => (a['status'] = true))
    }
    else {
      this.tabList[0]['status'] = true;
      this.tabList[1]['status'] = false;
      this.tabList[2]['status'] = false;
    }

    // Filter the tab list and update activeTabs
    this.activeTabs = this.tabList.filter(tab => tab.status);
  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

  viewParty(item: any) {
    this.navCtrl.navigateForward(`party-detail?id=${item.id}`)
  }

  filterList() {
    let holder: any = JSON.parse(JSON.stringify(this.partyrooms))
    this.filteredrooms = holder.filter(a => (a['localtype'] == this.tab))
  }

  reducer(obj: any, type: string) {
    return Object.values(obj).reduce((a: any, b: any) => a + (b['localtype'] === type ? 1 : 0), 0);
  }

  checkUidinArray(arr: any) {
    return (arr || []).some(a => a['uid'] == this.uid)
  }

}
