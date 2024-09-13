import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import firebase from 'firebase';
import 'firebase/auth'

@Injectable({
  providedIn: 'root',
})

export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private toastController: ToastController,
  ) { }

  async canActivate(): Promise<boolean> {
    return new Promise((resolve) => {
      firebase.auth().onAuthStateChanged(async user => {
        if (!user) {
          // User is not logged in, show a toast message
          const toast = await this.toastController.create({
            message: 'Please login to access this page.',
            duration: 2000,
            position: 'top',
          });
          toast.present();

          // Redirect to the login page
          this.router.navigate(['/login']);
          
          resolve(false);  // Return false if the user is not logged in
        } else {
          resolve(true);  // Return true if the user is logged in
        }
      });
    });
  }
}

