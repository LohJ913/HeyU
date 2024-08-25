import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetPassPageRoutingModule } from './set-pass-routing.module';

import { SetPassPage } from './set-pass.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetPassPageRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [SetPassPage]
})
export class SetPassPageModule {}
