import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileTagsPage } from './profile-tags.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileTagsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileTagsPageRoutingModule {}
