import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-topup-modal',
  templateUrl: './topup-modal.page.html',
  styleUrls: ['./topup-modal.page.scss'],
})
export class TopupModalPage implements OnInit {

  constructor() { }
  selectedPackage = 1

  ngOnInit() {
  }

  selectPackage(pack) {
    this.selectedPackage = pack

  }

  topUp() {

  }
}
