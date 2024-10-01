import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, ModalController, NavController } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import { CountryListPage } from '../country-list/country-list.page';
import interestjson from '../../assets/json/interest.json'
import { distinctUntilChanged, Subscription } from 'rxjs';
import { DataService } from '../services/data.service';
import { DatePipe } from '@angular/common';
import { WriteService } from '../services/write.service';
import getUnicodeFlagIcon from 'country-flag-icons/unicode'

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage implements OnInit {

  userSubscribe: Subscription;
  tempImage = '';
  tempPhoto = [];

  currentUser: any = {
    id: '',
    username: '',
    name: '',
    picture: '',
    description: '',
    gender: '',
    dob: '',
    language: [],
    height: null,
    weight: null,
    country: {},
    interests: [],
    albums: []
  };

  languageList = [
    {
      label: "English",
      value: "english"
    },
    {
      label: "日本語",
      value: "japanese"
    },
    {
      label: "ไทย",
      value: "thai"
    },
    {
      label: "中文",
      value: "chinese"
    }
  ];

  newProPicTrigger: boolean = false;
  interestTrigger: boolean = false;
  interestList: any[] = interestjson;
  selectedInterest = [];
  countryList = [];
  keyword = '';
  birthDate = null;

  constructor(
    private nav: NavController,
    private ionRouter: IonRouterOutlet,
    private dataService: DataService,
    public tool: ToolService,
    public modalCtrl: ModalController,
    public datePipe: DatePipe,
    private writeService: WriteService
  ) { }

  ngOnInit() {
    this.birthDate = this.getBirthDateForAge(18)
    console.log(this.birthDate);

    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = this.transformUserData(info)
      console.log(this.currentUser);

      this.tempImage = this.currentUser['picture']
      this.tempPhoto = this.currentUser['albums'][0]['photos'].map(v => ({ url: v, new_added: false }))
      // .map(v => ({ ...v, new_added: false }))
      console.log(this.tempPhoto);
    })
  }

  transformUserData(dbUser) {
    console.log(dbUser);

    const currentUser = {
      id: dbUser.id,
      username: dbUser.username,
      name: dbUser.name || 'Unknown',
      picture: dbUser.picture,
      description: dbUser.description || '', // Static placeholder
      gender: dbUser.gender || 'Unknown',
      dob: this.formatDOB(dbUser.dob || this.birthDate),  // Assuming dob needs formatting
      language: dbUser.language || [],   // Placeholder
      height: dbUser.height || 0,  // Static placeholder
      weight: dbUser.weight || 0,  // Static placeholder
      country: dbUser.country || {},
      interests: dbUser.interests || [],
      albums: [
        {
          date: Date.now(), // Current timestamp for placeholder album
          title: "first",
          photos: dbUser?.albums?.[0]?.['photos'] || []
        }
      ]
    };

    return currentUser;
  };

  getBirthDateForAge(age) {
    const today = new Date();
    const birthDate = new Date(today.setFullYear(today.getFullYear() - age)).toISOString(); // Subtract age from the full date
    return birthDate;
  }

  formatDOB(dob) {
    return new Date(dob).toISOString()
  };

  toInterest() {
    this.nav.navigateForward('profile-tags')
  }

  photoPicker() {
    this.tool.uploadPhoto().then((url) => {
      this.newProPicTrigger = true
      this.tempImage = url
    })
  }

  back() {
    this.ionRouter.canGoBack() ? this.nav.pop() : this.nav.navigateRoot('tabs/tab1')
  }

  async showCountry() {
    const modal = await this.modalCtrl.create({
      component: CountryListPage,
      initialBreakpoint: 0.8,
      breakpoints: [0, 0.8]
    });

    modal.onDidDismiss()
      .then((data) => {
        const country = data['data']; // Here's your selected user!
        if (this.tool.lengthof(country)) {
          console.log(country['data']);

          if (country['data']['code'] == 'TW') {
            country['data']['name'] = 'Taiwan'
          }

          console.log(getUnicodeFlagIcon(country['data']['code']));

          let selectedCountry = country['data']
          let code: string = selectedCountry['code']

          selectedCountry['lower_code'] = code.toLowerCase()
          console.log(selectedCountry);

          this.currentUser['country_code'] = country['data']['code']
          this.currentUser['country'] = selectedCountry
        }
      });


    return await modal.present();
  }

  logScrolling(ev) {
    let header = document.getElementById('header')
    let scrollTop = ev.detail.scrollTop
    var opacity = (scrollTop / 370);
    header.style.background = `linear-gradient(180deg, rgba(9,7,44,${opacity}) 0%, rgba(9,7,44,0) 100%)`;
  }

  openHobby() {
    this.interestTrigger = true
    this.selectedInterest = this.currentUser['interests']
    console.log(this.selectedInterest);

  }

  checkselect(x) {
    return Object.values(this.selectedInterest || {}).some((a) => (x['key'] == a['key']))
  }

  selectHobby(x) {
    if (!Array.isArray(this.currentUser['interests'])) {
      this.selectedInterest = [];
    }

    const exists = Object.values(this.selectedInterest || {}).some(a => x == a);

    if (exists) {
      // Filter out the element if it already exists
      this.selectedInterest = this.selectedInterest.filter(a => a != x);
    } else {
      // Push the element if it doesn't exist
      this.selectedInterest.push(x);
    }
  }

  saveHobby() {
    console.log(this.selectedInterest)
    this.currentUser.interests = this.selectedInterest
    this.selectedInterest = []
    console.log(this.currentUser);

    this.modalCtrl.dismiss()
  }

  addPhoto() {
    let cap = 9 - (this.tempPhoto || []).length

    this.tool.uploadMultiPhoto(this.currentUser['uid'], cap).then((res) => {
      let arr = [];
      arr = Object.values(res)
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];

        let obj = {
          url: element,
          new_added: true
        }

        this.tempPhoto.push(obj)
      }
    })
  }

  removePhoto(i) {
    this.tempPhoto.splice(i, 1)
  }

  async updateProfile() {
    const proceed = await this.tool.swalButton('info', 'Ready to update your profile info?', '');

    if (proceed) {
      await this.tool.showLoading('Updating...');

      // Filter the new photos
      const arrPhotos = this.tempPhoto.filter(photo => photo['new_added'] === true);
      console.log(arrPhotos);

      // Update the profile picture if necessary
      if (this.tempImage && this.newProPicTrigger) {
        try {
          const pictureData = await this.tool.pictureToLink(this.tempImage, this.currentUser.id);
          this.currentUser['picture'] = pictureData['link'];
        } catch (error) {
          console.error("Failed to upload profile picture", error);
        }
      }

      // If there are new photos, upload them in parallel
      if (arrPhotos.length > 0) {
        try {
          const photoUploadPromises = arrPhotos.map(photo =>
            this.tool.pictureToLink(photo.url, this.currentUser.id)
          );

          const uploadedPhotos = await Promise.all(photoUploadPromises);
          uploadedPhotos.forEach(photoData => {
            this.currentUser['albums'][0]['photos'].push(photoData['link']);
          });
        } catch (error) {
          console.error("Failed to upload one or more photos", error);
        }
      }

      console.log(this.currentUser);

      try {
        const res = await this.writeService.updateProfile(this.currentUser['id'], this.currentUser);
        console.log(res);
        await this.tool.dismissLoading();
        this.tool.showToast('Profile updated.', 'success', 'bottom');
      } catch (err) {
        await this.tool.dismissLoading();
        console.error("Failed to update profile", err);
      }
    }
  }

}


// name: 'Coleslaw',
//   description: 'I like goofy',
//     gender: 'Female',
//       dob: '17 Mar 1998',
//         language: ['english', 'japanese'],
//           height: 175,
//             weight: 50,
//               country: {
//   name: "Malaysia",
//     flag: "",
//       code: "MY",
//         dial_code: "+60"
// },
// interests: [
//   {
//     "value": "🧶 Crafting",
//     "key": "crafting"
//   },
//   {
//     "value": "💄 Make-up",
//     "key": "make-up"
//   },
//   {
//     "value": "💃🏻 Dancing",
//     "key": "dancing"
//   }
// ],
//   albums: [
//     {
//       date: 1231223123,
//       title: "first",
//       photos: [
//         "https://www.shutterstock.com/image-photo/fashion-concept-young-asian-woman-600nw-2070956018.jpg",
//         "https://www.shutterstock.com/image-photo/fashion-concept-young-asian-woman-600nw-2070956018.jpg",
//         "https://www.shutterstock.com/image-photo/fashion-concept-young-asian-woman-600nw-2070956018.jpg",
//         "https://www.shutterstock.com/image-photo/fashion-concept-young-asian-woman-600nw-2070956018.jpg"
//       ]
//     }
//   ]