import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileTagsPageRoutingModule } from './profile-tags-routing.module';

import { ProfileTagsPage } from './profile-tags.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileTagsPageRoutingModule
  ],
  declarations: [ProfileTagsPage]
})
export class ProfileTagsPageModule {}
