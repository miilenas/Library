import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; 
import { User } from '@angular/fire/auth';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone:false
})
export class ProfilePage implements OnInit {

   userProfile$!: Observable<any>;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.userProfile$ = this.authService.user$.pipe(
      switchMap((user: User | null) => {
        if (user) {
          return this.authService.getUserProfile(user.uid);
        } else {
          return new Observable(observer => observer.next(null));
        }
      })  
    );
  }

}
