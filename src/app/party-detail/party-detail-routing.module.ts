import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PartyDetailPage } from './party-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PartyDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartyDetailPageRoutingModule {}
