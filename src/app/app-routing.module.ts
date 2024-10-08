import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; // Import the guard

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'login',
  //   pathMatch: 'full'
  // },
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
    loadChildren: () => import('./profile-user/profile-user.module').then( m => m.ProfileUserPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'topup',
    loadChildren: () => import('./topup/topup.module').then( m => m.TopupPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gift-sender',
    loadChildren: () => import('./gift-sender/gift-sender.module').then( m => m.GiftSenderPageModule)
  },
  {
    path: 'login-modal',
    loadChildren: () => import('./login-modal/login-modal.module').then( m => m.LoginModalPageModule)
  },
  {
    path: 'lobby',
    loadChildren: () => import('./lobby/lobby.module').then( m => m.LobbyPageModule)
  },
  {
    path: 'party-list',
    loadChildren: () => import('./party-list/party-list.module').then( m => m.PartyListPageModule)
  },
  {
    path: 'party-add',
    loadChildren: () => import('./party-add/party-add.module').then( m => m.PartyAddPageModule)
  },
  {
    path: 'party-detail',
    loadChildren: () => import('./party-detail/party-detail.module').then( m => m.PartyDetailPageModule)
  },
  {
    path: 'topup-modal',
    loadChildren: () => import('./topup-modal/topup-modal.module').then( m => m.TopupModalPageModule)
  },
  {
    path: 'profile-edit',
    loadChildren: () => import('./profile-edit/profile-edit.module').then( m => m.ProfileEditPageModule)
  },
  {
    path: 'profile-tags',
    loadChildren: () => import('./profile-tags/profile-tags.module').then( m => m.ProfileTagsPageModule)
  },
  {
    path: 'favourite-list',
    loadChildren: () => import('./favourite-list/favourite-list.module').then( m => m.FavouriteListPageModule)
  },
  {
    path: 'country-list',
    loadChildren: () => import('./country-list/country-list.module').then( m => m.CountryListPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'earning-list',
    loadChildren: () => import('./earning-list/earning-list.module').then( m => m.EarningListPageModule)
  },  {
    path: 'transaction-list',
    loadChildren: () => import('./transaction-list/transaction-list.module').then( m => m.TransactionListPageModule)
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
