import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PartyDetailPageRoutingModule } from './party-detail-routing.module';

import { PartyDetailPage } from './party-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PartyDetailPageRoutingModule
  ],
  declarations: [PartyDetailPage]
})
export class PartyDetailPageModule {}
