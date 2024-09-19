import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PartyAddPageRoutingModule } from './party-add-routing.module';

import { PartyAddPage } from './party-add.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PartyAddPageRoutingModule
  ],
  declarations: [PartyAddPage]
})
export class PartyAddPageModule {}
