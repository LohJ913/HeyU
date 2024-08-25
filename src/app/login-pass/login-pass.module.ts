import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPassPageRoutingModule } from './login-pass-routing.module';

import { LoginPassPage } from './login-pass.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPassPageRoutingModule
  ],
  declarations: [LoginPassPage]
})
export class LoginPassPageModule {}
