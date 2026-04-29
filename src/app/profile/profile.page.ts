import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; 
import { Observable, of, switchMap } from 'rxjs';
import { NavController } from '@ionic/angular';
import { User } from '../models/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone:false
})
export class ProfilePage implements OnInit {

   userProfile$!: Observable<User | null>;
   userId: string | null = null;
   isAdmin: boolean = false;

  constructor(private authService: AuthService, private navCtrl: NavController) { }
  

ngOnInit() {
   this.authService.isAdmin$.subscribe(admin => {
    this.isAdmin = admin;
  });
  const storedUser = localStorage.getItem('userData');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      this.userId = parsedUser.id || null;
    } catch (e) {
      console.error('Greška pri parsiranju localStorage user-a:', e);
    }
  }

  if (!this.userId) {
    console.warn('Nema userId, prekidam.');
    this.userProfile$ = of(null);
    return;
  }

  this.userProfile$ = this.authService.getUserProfile(this.userId);
}


 async logout() {
    try {
      this.authService.logout();
      this.navCtrl.navigateRoot('/first'); 
    } catch (error) {
      console.error('Logout failed', error);
    }
  }

}
