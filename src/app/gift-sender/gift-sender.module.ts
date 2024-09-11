import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GiftSenderPageRoutingModule } from './gift-sender-routing.module';

import { GiftSenderPage } from './gift-sender.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GiftSenderPageRoutingModule
  ],
  declarations: [GiftSenderPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GiftSenderPageModule {}
