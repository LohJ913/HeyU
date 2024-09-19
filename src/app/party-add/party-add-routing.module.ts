import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PartyAddPage } from './party-add.page';

const routes: Routes = [
  {
    path: '',
    component: PartyAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartyAddPageRoutingModule {}
