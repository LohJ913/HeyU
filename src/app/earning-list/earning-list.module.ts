import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EarningListPageRoutingModule } from './earning-list-routing.module';

import { EarningListPage } from './earning-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EarningListPageRoutingModule
  ],
  declarations: [EarningListPage]
})
export class EarningListPageModule {}
