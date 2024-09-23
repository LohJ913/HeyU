import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TopupModalPageRoutingModule } from './topup-modal-routing.module';

import { TopupModalPage } from './topup-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TopupModalPageRoutingModule
  ],
  declarations: [TopupModalPage]
})
export class TopupModalPageModule {}
