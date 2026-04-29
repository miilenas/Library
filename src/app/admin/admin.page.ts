import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
 standalone: true,
  imports: [IonicModule, FormsModule, CommonModule] 
})
export class AdminPage {
  
 email: string = '';
  constructor(
    private authService: AuthService,
    private toastController: ToastController) { }

    makeAdmin() {
    if (!this.email) return;

    this.authService.makeAdmin(this.email).subscribe({
      next: () => this.showToast('User is now admin!', 'success'),
      error: (err) => this.showToast(err.message, 'danger')
    });
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }

}
