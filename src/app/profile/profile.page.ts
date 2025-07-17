import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; 
import { User } from '@angular/fire/auth';
import { Observable, of, switchMap } from 'rxjs';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone:false
})
export class ProfilePage implements OnInit {

   userProfile$!: Observable<any>;
  constructor(private authService: AuthService, 
    private navCtrl: NavController) { }

ngOnInit() {
  this.authService.user$.subscribe(user => {
  });

  this.userProfile$ = this.authService.user$.pipe(
    switchMap((user: User | null) => {
      if (user) {
        return this.authService.getUserProfile(user.uid);
      } else {
        return of(null);
      }
    })
  );
}

 async logout() {
    try {
      await this.authService.logout();
      this.navCtrl.navigateRoot('/first'); 
    } catch (error) {
      console.error('Logout failed', error);
    }
  }

}
