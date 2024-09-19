import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PartyListPage } from './party-list.page';

const routes: Routes = [
  {
    path: '',
    component: PartyListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartyListPageRoutingModule {}
