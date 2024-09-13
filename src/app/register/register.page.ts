import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(
    public tool: ToolService,
    private navCtrl: NavController,
    public route: IonRouterOutlet,
  ) { }


  user = {
    name: '',
    gender: '',
    dob: ''
  }
  gender = [
    {
      icon: 'assets/icon/male.svg',
      icon2: 'assets/icon/male_white.svg',
      name: 'Male'
    },
    {
      icon: 'assets/icon/female.svg',
      icon2: 'assets/icon/female_white.svg',
      name: 'Female'
    },
    {
      icon: 'assets/icon/others.svg',
      icon2: 'assets/icon/others_white.svg',
      name: 'Others'
    }
  ]
  selectedGender = ''
  errorText = ''

  ngOnInit() {

  }

  register() {
    this.checkField()
  }

  checkField() {
    let isValid = true;

    for (const key in this.user) {
      const element = document.getElementById('error_' + key);

      if (element) {

        if (this.user[key] === "") {
          let errorMessage = "";

          if (key === 'name') {
            errorMessage = 'Username is required';
          } else if (key === 'gender') {
            errorMessage = 'Please select your gender ';
          } else if (key === 'dob') {
            errorMessage = 'Please select your date of birth';
          }
          element.innerHTML = `<div style="font-size: 11px; color: #ff5050; margin-top: 10px;">${errorMessage}</div>`;
          isValid = false;
        } else {
          element.innerHTML = ""; // Clear any previous error message
        }
      }
    }

    return isValid;
  }

  selectGender(gender) {
    this.user['gender'] = gender['name']
    this.selectedGender = gender['name']
  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('login', { animated: true, animationDirection: 'back' })
  }
}
