import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone:false
})
export class RegisterPage implements OnInit {

  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
 // errorMessage: string | null = null;

   private authService = inject(AuthService);
  private router = inject(Router);
 private toastController = inject(ToastController);
  constructor() { }

  ngOnInit() {
  }

async presentToast(message: string) {
  const toast = await this.toastController.create({
    message,
    duration: 3000,
    position: 'middle',
    color: 'danger'
  });
  await toast.present();
}

   async register() {
  if (!this.firstName || !this.lastName || !this.email || !this.password) {
    this.presentToast('Please fill in all fields.');
    return;
  }
  if (this.password.length < 5) {
    this.presentToast('Password must be at least 5 characters long.');
    return;
  }
    try {
      await this.authService.register(this.email, this.password);
      this.router.navigateByUrl('/tabs/readings', { replaceUrl: true }); 
    } catch (error: any) {
      // console.error('Error to login:', error.code, error.message);
      // console.error(error);
      switch (error.code) {
        case 'auth/invalid-email':
          this.presentToast('Invalid email format.');
          break;
          case 'auth/email-already-in-use':
           this.presentToast('Email is already in use.');
           break;
        default:
          this.presentToast('Unexpected error. Please try later.');
      }
    }
  }

}
