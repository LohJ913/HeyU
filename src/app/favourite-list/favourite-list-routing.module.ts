import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FavouriteListPage } from './favourite-list.page';

const routes: Routes = [
  {
    path: '',
    component: FavouriteListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FavouriteListPageRoutingModule {}
