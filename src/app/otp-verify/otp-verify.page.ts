import { Component, OnInit } from '@angular/core';
import { ToolService } from '../services/tool.service';
import { IonRouterOutlet, NavController } from '@ionic/angular';

@Component({
  selector: 'app-otp-verify',
  templateUrl: './otp-verify.page.html',
  styleUrls: ['./otp-verify.page.scss'],
})
export class OtpVerifyPage implements OnInit {

  counter = 0;
  interval;

  constructor(
    public tool: ToolService,
    private navCtrl: NavController,
    public route: IonRouterOutlet,
  ) { }

  ngOnInit() {
    this.counter = 300
    this.startCountdown()
  }

  ionViewWillLeave() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  back() {
    this.route.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('login', { animated: true, animationDirection: 'back' })
  }

  handleInput(inputNumber) {
    const currentInput = document.querySelector(`.passcode_box:nth-child(${inputNumber})`) as HTMLInputElement;
    const nextInput = document.querySelector(`.passcode_box:nth-child(${inputNumber + 1})`) as HTMLInputElement;

    if (currentInput.value.length === 1 && nextInput) {
      nextInput.disabled = false;
      nextInput.focus();
    }

    const allInputsFilled = Array.from(document.querySelectorAll('.passcode_box')).every(input => (input as HTMLInputElement).value.length === 1);

    if (allInputsFilled) {
      const code = Array.from(document.querySelectorAll('.passcode_box'))
        .map(input => (input as HTMLInputElement).value)
        .join('');

      console.log(code);

    }
  }

  async handleBackspace(inputNumber, ev) {
    if (ev.key === "Backspace") {
      ev.preventDefault(); // Prevent default backspace behavior

      const currentInput = document.querySelector(`.passcode_box:nth-child(${inputNumber})`) as HTMLInputElement;
      const prevInput = document.querySelector(`.passcode_box:nth-child(${inputNumber - 1})`) as HTMLInputElement;

      if (currentInput && prevInput) {
        if (currentInput.value.length === 0) {
          // Clear previous input and focus on it
          prevInput.value = '';
          currentInput.disabled = true;
          prevInput.focus();
        } else if (currentInput.value.length === 1) {
          // If current input has value, clear it and prevent action on previous input
          currentInput.value = '';
        }
      }
    }
  }

  updateDisplay() {
    const minutes = Math.floor(this.counter / 60);
    const seconds = this.counter % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

    let timer = document.getElementById('timer')
    if (timer) {
      timer.innerHTML = `
      <div style="width: 100%; text-align: center; color: #9D9AF9; font-size: 14px; padding: 14px 0;">
      Resend in:&nbsp;&nbsp;<span style="color: #ffffff;">${formattedTime}</span></div>
      `
    }
  }

  startCountdown() {
    this.updateDisplay();
    this.interval = setInterval(() => {
      this.counter--;
      this.updateDisplay();
      if (this.counter <= 0) {
        clearInterval(this.interval);

        let timer = document.getElementById('timer')
        if (timer) {
          timer.innerHTML = `
            <div id="resendButton" style="width: 100%; text-align: center; color: #FFFFFF; font-size: 14px; padding: 14px 0;">Resend code</div>
          `
          document.getElementById('resendButton').addEventListener('click', () => {
            // this.send();
          });
        }
      }
    }, 1000);
  }
}
