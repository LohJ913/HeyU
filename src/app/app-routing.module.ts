import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'otp-verify',
    loadChildren: () => import('./otp-verify/otp-verify.module').then( m => m.OtpVerifyPageModule)
  },
  {
    path: 'set-pass',
    loadChildren: () => import('./set-pass/set-pass.module').then( m => m.SetPassPageModule)
  },
  {
    path: 'login-pass',
    loadChildren: () => import('./login-pass/login-pass.module').then( m => m.LoginPassPageModule)
  },
  {
    path: 'forgot-pass',
    loadChildren: () => import('./forgot-pass/forgot-pass.module').then( m => m.ForgotPassPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'chatroom',
    loadChildren: () => import('./chatroom/chatroom.module').then( m => m.ChatroomPageModule)
  },
  {
    path: 'profile-user',
    loadChildren: () => import('./profile-user/profile-user.module').then( m => m.ProfileUserPageModule)
  },
  {
    path: 'topup',
    loadChildren: () => import('./topup/topup.module').then( m => m.TopupPageModule)
  },
  {
    path: 'gift-sender',
    loadChildren: () => import('./gift-sender/gift-sender.module').then( m => m.GiftSenderPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
