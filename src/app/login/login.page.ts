import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
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

  constructor() {
    console.log("loginpage");
   }

  ngOnInit() {
  }

   async login() {
    this.errorMessage = null;
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigateByUrl('/readings', { replaceUrl: true }); 
    } catch (error: any) {
      console.error('Error to login:', error.code, error.message);
      console.error(error);
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          this.errorMessage = 'Wrong email or password.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Invalid email format.';
          break;
        case 'auth/too-many-requests':
          this.errorMessage = 'Too many tries. Please try later.';
          break;
        default:
          this.errorMessage = 'Unexpected error. Please try later.';
      }
    }
  }



}
