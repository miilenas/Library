import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone:false
})
export class LoginPage implements OnInit {

  email!: string;
  password!: string;
  errorMessage: string | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);
  private toastController = inject(ToastController);


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

   async login() {
    this.errorMessage = null;
  
  
      if (!this.email || !this.password) {
     this.presentToast ('Email and password are required.');
    return;
    }
    if (this.password.length < 5) {
    this.presentToast('Password must be at least 5 characters long.');
    return;
  }

    try {
      const userData = {
        email: this.email,
        password: this.password
      };
      await firstValueFrom(this.authService.login(userData));
      this.router.navigateByUrl('/tabs/books', { replaceUrl: true }); 
    } catch (error: any) {
      
       const firebaseError =error?.message; 
      switch (firebaseError) {
         case 'EMAIL_NOT_FOUND':
    case 'INVALID_PASSWORD':
      this.presentToast('Wrong email or password.');
      break;
    case 'INVALID_EMAIL':
      this.presentToast('Invalid email format.');
      break;
    case 'INVALID_LOGIN_CREDENTIALS':
      this.presentToast('Invalid credentials, try again.');
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
