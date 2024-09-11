import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GiftSenderPage } from './gift-sender.page';

const routes: Routes = [
  {
    path: '',
    component: GiftSenderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GiftSenderPageRoutingModule {}
