import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { DataService } from '../services/data.service';
import { ToolService } from '../services/tool.service';
import firebase from 'firebase';
import { ReadService } from '../services/read.service';
import { WriteService } from '../services/write.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  userSubscribe: Subscription;
  currentUser: any = {};
  loginTrigger: boolean = false;

  firestore = firebase.firestore();
  people: any = [];
  popular: any = [];
  todate = new Date().getTime();
  outlets: any = []
  lat: number;
  lon: number;
  outletInfo: any;
  isCheckedIn = false
  locating = false
  showCheckinPrompt = false

  constructor(
    public navCtrl: NavController,
    public tool: ToolService,
    private dataService: DataService,
    private readService: ReadService,
    private toolService: ToolService,
    private writeService: WriteService,
  ) {

  }

  async ngOnInit() {


    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      console.log(info);
      this.currentUser = info;
      this.checkinChecker()
      //  checkouthour = '6am'

    })
    this.getHotties(this.currentUser?.interested == 'male' ? '' : 'female');
    await this.getPosition()
    this.getNearbyOutlets()

  }

  checkinChecker() {
    if (this.currentUser['visitId']) {
      const checkin_date = this.currentUser?.['visitTime'].toMillis(); // Last check-in timestamp
      const current_time = new Date().getTime(); // Current timestamp
      console.log(checkin_date)
      // Get the most recent 6 AM
      const now = new Date();
      let last6am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0).getTime();
      console.log(last6am)
      // If current time is before 6 AM today, get the 6 AM from the previous day
      if (current_time < last6am) {
        last6am = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 6, 0, 0, 0).getTime();
      }
      // Compare the last check-in date with the last 6 AM
      if (checkin_date < last6am) {
        this.isCheckedIn = false;
        this.showCheckinPrompt = true; // Prompt for a new check-in
      } else {
        this.showCheckinPrompt = false; // User is still checked in
        this.isCheckedIn = true;
      }
    } else {
      this.isCheckedIn = false;
      this.showCheckinPrompt = true; // No visitId, prompt for check-in
    }
  }

  getOutlets() {
    this.readService.getOutlets().subscribe({
      next: (data) => {
        this.outlets = data
        if (this.locating == true) (this.outlets || []).filter((a: any) => (a['distance'] = this.toolService.getDistanceBetweenPoints(this.lat, this.lon, a['latitude'], a['longitude'])));
        console.log('Outlets:', this.outlets);
      },
      error: (error) => {
        console.error('Error fetching outlets:', error);
      },
      complete: () => {
        console.log('Fetching outlets.');
      }
    });
  }

  async getPosition(): Promise<void> {
    return this.dataService.printCurrentPosition().then((data) => {
      console.log(data);
      this.lat = data.latitude;
      this.lon = data.longitude;
      this.locating = true;
    }).catch((err) => {
      console.error(err);
      // In case of error, still resolve the Promise
      this.locating = false;
    });
  }

  getNearbyOutlets() {
    console.log('run');
    this.readService.getNearbyOutlets(this.lat, this.lon).subscribe({
      next: (data) => {
        this.outlets = data;
        let holder = (this.outlets || []).map((a: any) => {
          a['distance'] = this.toolService.getDistanceBetweenPoints(this.lat, this.lon, a['latitude'], a['longitude']);
          return a;
        });
        this.outlets = holder.sort((a: any, b: any) => (a['distance'] - b['distance']))

        console.log('Outlets:', this.outlets);
      },
      error: (error) => {
        console.error('Error fetching outlets:', error);
      },
      complete: () => {
        console.log('Finished fetching outlets.');
      }
    });
  }

  checkinOutlet() {
    if (this.currentUser && this.tool.lengthof(this.outlets)) {
      this.writeService.guestCheckin(this.currentUser['id'], this.outlets[0], { name: this.currentUser.name, picture: this.currentUser.picture, uid: this.currentUser.id }, this.currentUser['visitId'] || '')
        .then((done) => {
          console.log('Check-in completed:', done);
        })
        .catch((err) => {
          console.error('Error during check-in:', err);
        });
    } else {
      console.error('Missing currentUser or outletInfo');
    }
  }

  getHotties(gender?: string) {
    // if find guy ??

    this.readService.getHotPeople('').subscribe({
      next: (data) => {
        let everyone = (data || []).filter((a: any) => this.tool.lengthof(this.currentUser) ? a['id'] !== this.currentUser['id'] : a) // Filter to remove me from the list
        console.log(everyone);

        // this.people = JSON.parse(JSON.stringify(everyone)).sort((a, b) => {
        //   const statusA = a.tag === 'Trending' ? 1 : (a.tag === 'Popular' ? 2 : 3);
        //   const statusB = b.tag === 'Trending' ? 1 : (b.tag === 'Popular' ? 2 : 3);
        //   return statusA - statusB;
        // });
        this.people = JSON.parse(JSON.stringify(everyone)).filter((a: any) => (!a['tag'])).sort(() => Math.random() - 0.5);
        this.popular = JSON.parse(JSON.stringify(everyone)).filter((a: any) => (a['tag'])).sort(() => Math.random() - 0.5)
        console.log('Popular users:', this.popular);
      },
      error: (error) => {
        console.error('Error fetching hot girls:', error);
      },
      complete: () => {
        console.log('Fetching hot girls completed.');
      }
    });
  }

  goLobby() {
    this.navCtrl.navigateForward(`lobby?lat=${this.lat || undefined}&lon=${this.lon || undefined}`);
  }

  goUser(user: any) {
    this.navCtrl.navigateForward(`profile-user?id=${user['id']}`);
  }

  goTopUp() {
    this.navCtrl.navigateForward('topup');
  }

  goEarning() {
    this.navCtrl.navigateForward('earning-list');
  }

}
