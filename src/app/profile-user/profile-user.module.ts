import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileUserPageRoutingModule } from './profile-user-routing.module';

import { ProfileUserPage } from './profile-user.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileUserPageRoutingModule
  ],
  declarations: [ProfileUserPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfileUserPageModule { }
