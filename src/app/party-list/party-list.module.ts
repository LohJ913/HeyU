import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PartyListPageRoutingModule } from './party-list-routing.module';

import { PartyListPage } from './party-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PartyListPageRoutingModule
  ],
  declarations: [PartyListPage]
})
export class PartyListPageModule {}
