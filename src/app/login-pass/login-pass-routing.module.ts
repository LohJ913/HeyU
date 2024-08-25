import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPassPage } from './login-pass.page';

const routes: Routes = [
  {
    path: '',
    component: LoginPassPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPassPageRoutingModule {}
