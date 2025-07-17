import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';



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

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigateByUrl('/tabs/readings', { replaceUrl: true }); 
    } catch (error: any) { 
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          this.presentToast ('Wrong email or password.');
          break;
        case 'auth/invalid-credential':
          this.presentToast('Invalid credentials.');
          break;  
        case 'auth/invalid-email':
          this.presentToast('Invalid email format.') ;
          break;
        case 'auth/too-many-requests':
         this.presentToast ('Too many tries. Please try later.') ;
          break;
        default:
          this.presentToast('Unexpected error. Please try later.');
      }
    }
  }



}
