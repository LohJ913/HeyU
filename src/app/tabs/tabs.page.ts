import { Component, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  @ViewChild('myTabs')
  tabs!: IonTabs;

  currentTab = 'tab1' as any;

  constructor() { }

  getSelectedTab(): void {
    this.currentTab = this.tabs.getSelected();
  }


}
