import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import firebase from 'firebase'
import Swal from 'sweetalert2';
import { Subscription, distinctUntilChanged, timestamp } from 'rxjs';
import { ToolService } from '../services/tool.service';
import { ReadService } from '../services/read.service';
import { DataService } from '../services/data.service';
import { WriteService } from '../services/write.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  styleUrls: ['./lobby.page.scss'],
})
export class LobbyPage implements OnInit {


  places = [
    {
      photo: '',
      name: 'Tang Ping 躺平',
      address: ' 7, Jalan SS 13/6c Subang Jaya Industrial Estate, Ss 13 Kuala Lumpur, 47500 Subang Jaya, Selangor',
    },
    {
      photo: '',
      name: 'Tang Ping 躺平',
      address: ' 7, Jalan SS 13/6c Subang Jaya Industrial Estate, Ss 13 Kuala Lumpur, 47500 Subang Jaya, Selangor',
    },
    {
      photo: '',
      name: 'Tang Ping 躺平',
      address: ' 7, Jalan SS 13/6c Subang Jaya Industrial Estate, Ss 13 Kuala Lumpur, 47500 Subang Jaya, Selangor',
    }, {
      photo: '',
      name: 'Tang Ping 躺平',
      address: ' 7, Jalan SS 13/6c Subang Jaya Industrial Estate, Ss 13 Kuala Lumpur, 47500 Subang Jaya, Selangor',
    }
  ]
  outlets: any = []
  userSubscribe: any;
  currentUser: any = {};
  lat: number;
  lon: number;
  isCheckedIn = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: IonRouterOutlet,
    private readService: ReadService,
    private dataService: DataService,
    public toolService: ToolService,
    private writeService: WriteService,
    private navCtrl: NavController) { }

  async ngOnInit() {

    this.activatedRoute.queryParams.subscribe(a => {
      this.lat = a['lat'] || undefined
      this.lon = a['lon'] || undefined
    })

    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      console.log(info);
      this.currentUser = info;
      this.checkinChecker()
    });
    if (this.lat && this.lon) await this.getPosition()
    await this.getOutlets()
    this.getCheckins()
  }

  ngOnDestroy() {
    if (this.userSubscribe) this.userSubscribe.unsubscribe();
  }
  getOutlets(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.readService.getOutlets().subscribe({
        next: (data: any) => {
          console.log(data);
          this.outlets = data.filter((a: any) => (a['distance'] = this.toolService.getDistanceBetweenPoints(this.lat, this.lon, a['latitude'], a['longitude'])));;
          console.log('Outlets:', this.outlets);
          resolve(); // Resolve the promise once outlets are fetched
        },
        error: (error) => {
          console.error('Error fetching outlets:', error);
          reject(error); // Reject the promise in case of error
        },
        complete: () => {
          console.log('Fetching outlets complete.');
        }
      });
    });
  }

  async getPosition(): Promise<void> {
    return this.dataService.printCurrentPosition().then((data) => {
      console.log(data);
      this.lat = data.latitude;
      this.lon = data.longitude;
    }).catch((err) => {
      console.error(err);
      // In case of error, still resolve the Promise
    });
  }

  getCheckins() {
    this.readService.getOutletUsers().subscribe({
      next: (data: any) => {
        console.log(data);
        console.log('Users:', data);

        if (data && this.lengthof(this.outlets)) {
          const outlets = data.map(outlet => {
            const matchingOutlet = this.outlets.find(o => o.id === outlet.id);

            // Combine guests and checkins into a single 'users' array
            const users = [
              ...(outlet.guest || []),
              ...(outlet.checkins || [])
            ].map(user => ({
              uid: user.uid,
              name: user.name,
              picture: user.picture,
            })).sort(() => Math.random() - 0.5);

            // Return the transformed outlet object, using name from this.outlets
            return {
              id: outlet.id,
              name: matchingOutlet ? matchingOutlet.name : 'Unnamed Outlet',
              users,
              picture: matchingOutlet ? matchingOutlet.picture : '',
              latitude: matchingOutlet ? matchingOutlet.latitude : undefined,
              longitude: matchingOutlet ? matchingOutlet.longitude : undefined,
              distance: matchingOutlet ? matchingOutlet.distance : undefined,
              address: matchingOutlet ? matchingOutlet.address : 'This place is well hidden :)',
            };
          });

          this.outlets = outlets
          console.log(this.outlets)
        }
      },
      error: (error) => {
        console.error('Error fetching users at outlet:', error);
      },
      complete: () => {
        console.log('Fetching users at outlet complete.');
      }
    });
  }

  checkinOutlet(outletInfo: any) {
    if (this.currentUser && this.toolService.lengthof(outletInfo)) {
      this.writeService.guestCheckin(this.currentUser['id'], outletInfo, { name: this.currentUser.name, picture: this.currentUser.picture, uid: this.currentUser.id }, this.currentUser['visitId'] || '')
        .then((done) => {
          console.log('Check-in completed:', done);
          this.getCheckins()
        })
        .catch((err) => {
          console.error('Error during check-in:', err);
        });
    } else {
      console.error('Missing currentUser or outletInfo');
    }
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
        console.log('test1')
      } else {
        this.isCheckedIn = true;
        console.log('test2')
      }
    } else {
      this.isCheckedIn = false;
      console.log('test3')
    }
  }

  lengthof(x) {
    return x ? Object.keys(x).length : 0
  }

  back() {
    this.router.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

  async convertAnonymousToEmailPassword(email: string, password: string) {
    const user = firebase.auth().currentUser;
    console.log(user)

    if (user && user.isAnonymous) {
      try {
        // Create credentials with email and password
        const credential = firebase.auth.EmailAuthProvider.credential(email, password);
        // Link the anonymous account to email/password credentials
        const result = await user.linkWithCredential(credential);

        console.log('Anonymous account successfully linked to email:', result.user);
        return result.user; // The user is now linked with email/password

      } catch (error) {
        console.error('Error linking anonymous account to email/password:', error);
        throw error;
      }
    } else {
      console.log('User is not anonymous or not logged in');
      throw new Error('User is not anonymous or not logged in');
    }
  }
}
