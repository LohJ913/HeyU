import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { DataService } from '../services/data.service';
import { WriteService } from '../services/write.service';
import { ReadService } from '../services/read.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-party-detail',
  templateUrl: './party-detail.page.html',
  styleUrls: ['./party-detail.page.scss'],
})
export class PartyDetailPage implements OnInit {



  participant_list = [
    {
      name: 'Xiao A',
      thumbnail: 'https://img.freepik.com/premium-photo/asian-girls-education-happy-beautiful-asian-girl-is-smilling_911620-8519.jpg'
    },
    {
      name: 'Xiao B',
      thumbnail: 'https://img.freepik.com/premium-photo/asian-girls-education-happy-beautiful-asian-girl-is-smilling_911620-8519.jpg'
    },
    {
      name: 'Xiao C',
      thumbnail: 'https://img.freepik.com/premium-photo/asian-girls-education-happy-beautiful-asian-girl-is-smilling_911620-8519.jpg'
    },
    {
      name: 'Xiao D',
      thumbnail: 'https://img.freepik.com/premium-photo/asian-girls-education-happy-beautiful-asian-girl-is-smilling_911620-8519.jpg'
    },
  ]

  groupChatList = [
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 101',
      message: '<b>Somebody</b> has joined this party',
      type: 'system',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: '001',
      name: 'Girl 1',
      message: 'Hello Everyone!',
      type: 'text',
      date: 1727022599
    },
    {
      id: 'zvEm4ws0JUQrd15xI7eSFSOLRAA2',
      name: 'Girl 1',
      message: 'Hello Everyone! hjk ahsk jdhkas kajshdkj ashkjd kash dkahkjd kjah sdkhasjk kahs kdha',
      type: 'text',
      date: 1727022599
    }
  ]

  requestList = [
    {
      photo: '',
      name: 'Kelly Kerk',
      price: 250,
      status: 'Pending'
    },
    {
      photo: '',
      name: 'Kelly Kerk',
      price: 250,
      status: 'Pending'
    },
    {
      photo: '',
      name: 'Kelly Kerk',
      price: 250,
      status: 'Pending'
    },
    {
      photo: '',
      name: 'Kelly Kerk',
      price: 250,
      status: 'Pending'
    }
  ]

  constructor(
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    public tool: ToolService,
    private dataService: DataService,
    private writeService: WriteService,
    private readService: ReadService,
    private activatedRoute: ActivatedRoute
  ) { }

  joined: boolean = true;
  applied: boolean = true
  rejected: boolean = false
  joinRequest: boolean = false;

  id = '';
  roomInfo: any = {}
  uid = localStorage.getItem('heyu_uid')
  userSubscribe: Subscription;
  currentUser: any = {};

  ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = info
      console.log(this.currentUser);

    })
    this.activatedRoute.queryParams.subscribe(a => {
      this.id = a['id']
      this.readService.getRoomInfo(this.id).then((data) => {
        this.roomInfo = data || {}
        this.roomInfo['roomId'] = this.id.substring(this.id.length - 5)
        this.roomInfo['who_can_join'] = this.whoCanJoin(this.roomInfo['gender'])
        this.applied = this.tool.lengthof(this.roomInfo?.['users']) ? this.roomInfo.users.includes(this.uid) ? true : false : false
        console.log(this.roomInfo)
      }).catch((error) => {
        console.error(error);
      });
    })


  }


  ngOnDestroy() {
    if (this.userSubscribe) this.userSubscribe.unsubscribe();
  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('party-list', { animated: true, animationDirection: 'back' })
  }

  async acceptJoin(item) {
    console.log(item);

    // Show confirmation dialog
    const confirmation = await this.tool.swalConfirm('Confirmation', `${item['rate']} will be deducted?`, 'warning');

    // If the user confirms the action
    if (confirmation) {
      try {
        // Wait for the result of the transaction
        const res = await this.writeService.acceptUserToParty(this.id, this.roomInfo['byUid'], {
          name: item['name'],
          picture: item['picture'],
          rate: item['rate'],
          uid: item['uid']
        });

        // Check if the transaction was successful
        if (res.success) {
          // If the transaction was successful, update the UI
          item.accepted = true;
          this.roomInfo['applicants'] = this.roomInfo['applicants'].filter(a => item.uid != a['uid']);

          // Check if participants array is empty and push new data accordingly
          if (this.tool.lengthof(this.roomInfo['participants'])) {
            this.roomInfo['participants'].push({
              name: item['name'],
              picture: item['picture'],
              rate: item['rate'],
              uid: item['uid']
            });
          } else {
            this.roomInfo['participants'] = [];
            this.roomInfo['participants'].push({
              name: item['name'],
              picture: item['picture'],
              rate: item['rate'],
              uid: item['uid']
            });
            this.roomInfo['balance'] = res['newCredits'] || 0
          }
          console.log(res);

        } else {
          // Handle failure case when success is false
          console.error('Transaction failed: ', res.message);
          this.tool.swal('error', 'Error', 'Failed to accept user into the party: ' + res.message, 5000);
        }

      } catch (error) {
        // Handle the error if the transaction fails
        this.tool.swal('error', 'Error', 'Failed to accept user into the party: ' + error.message, 5000);
      }
    }
  }



  requestJoin() {

    this.tool.swalConfirm('Confirmation', `Would you like to apply for this party room?`, 'warning').then(async (a) => {
      if (a == true) {
        this.writeService.requestJoinParty(this.id, this.roomInfo['byUid'], this.currentUser['id'],
          { name: this.currentUser['name'], picture: this.currentUser['picture'], rate: this.roomInfo['budgetPax'], uid: this.currentUser['id'] }
        ).then((res) => {

          this.tool.swal('success', 'Application sent!', 'Kindly wait for the host to review', 3000)
          this.applied = true
          console.log(res)
        }).catch((err) => {
          console.log(err)
          this.tool.swal('error', 'Application failed!', 'Try again in another time or contact custsomer support for assistance...', 3000)
        })
      }
    })

  }

  whoCanJoin(arr: any) {

    if (!this.tool.lengthof(arr) || this.tool.lengthof(arr) == 3) {
      return "Anyone";
    } else {
      const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

      if (this.tool.lengthof(arr) == 1) {
        let singular = arr[0].toLowerCase() === "others" ? "Others" : capitalizeFirstLetter(arr[0]) + "s";
        return `${singular} Only`;
      } else {
        // Sort array to ensure Male comes first if both are present
        arr = arr.sort();

        let first = arr[0].toLowerCase() === "others" ? "Others" : capitalizeFirstLetter(arr[0]) + "s";
        let second = arr[1].toLowerCase() === "others" ? "Others" : capitalizeFirstLetter(arr[1]) + "s";
        return `${first} & ${second} Only`;
      }
    }
  }

  scanQrCheckin() {

    // QR format = heyu?uid=uid&type=party&
    let holder = {
      id: '',
    }
    let ambassador_id = ''
    let profile = this.roomInfo['participants'][this.roomInfo['participants'].findIndex(a => (a['id'] == ambassador_id))]

    // load
    this.writeService.scanAmbassadorQR(this.id, this.uid, this.currentUser['name'], ambassador_id, profile, { type: 'party', eventId: this.id, eventDate: this.roomInfo['date'] }).then((res) => {
      console.log(res)
      if (res.success == true) {

        this.roomInfo['payments'] = this.roomInfo['payments'] || [];
        this.roomInfo['payments'].push({ uid: ambassador_id, name: profile['name'] });
        this.roomInfo['paid'] = (this.roomInfo['paid'] || 0) + profile.rate;

      }
      else {
        // try again
      }
    })
  }

  goUser(user: any) {
    this.navCtrl.navigateForward(`profile-user?id=${user['uid']}`);
  }


}
