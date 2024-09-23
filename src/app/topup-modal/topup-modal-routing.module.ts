import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TopupModalPage } from './topup-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TopupModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TopupModalPageRoutingModule {}
