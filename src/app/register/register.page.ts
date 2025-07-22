import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

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
          const userData = {
            email: this.email,
            password: this.password,
            firstName: this.firstName, 
            lastName: this.lastName
          };
      await firstValueFrom(this.authService.register(userData));
      this.router.navigateByUrl('/tabs/books', { replaceUrl: true }); 
    } catch (error: any) {
      const firebaseError=error?.message;
        switch (firebaseError) {
    case 'INVALID_EMAIL':
      this.presentToast('Invalid email format.');
      break;
    case 'INVALID_LOGIN_CREDENTIALS':
      this.presentToast('Invalid credentials, try again.');
      break;
    case 'EMAIL_EXISTS':
        this.presentToast('Email is taken.');   
        break;  
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      this.presentToast('Too many tries. Please try later.');
      break;
    default:
      this.presentToast('Unexpected error. Please try later.');
      }
    }
  }

}
