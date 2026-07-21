import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserService } from '../core/services/user.service';
import { UserProfile } from '../core/models/user.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent implements OnInit {
  user!: UserProfile;
  isMenuOpen = false;
  isNotifOpen = false;
  activeNotifTab = 'belum'; // 'belum' | 'semua'
  isLogoutModalOpen = false; // State untuk modal logout
  
  constructor(private router: Router, private userService: UserService) {
    // Menutup menu otomatis setiap kali rute/halaman berpindah
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isMenuOpen = false;
      this.isNotifOpen = false;
    });
  }

  ngOnInit() {
    this.user = this.userService.getUserProfile();
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (!this.isMenuOpen) {
      this.isNotifOpen = false;
    }
  }

  get isBpiOnlineRoute(): boolean {
    return this.router.url === '/bpi-online';
  }

  toggleNotif() {
    this.isNotifOpen = !this.isNotifOpen;
  }

  markAllAsRead(event: Event) {
    event.preventDefault(); // Mencegah reload / pindah halaman
  }

  showLogoutConfirm(event: Event) {
    event.preventDefault();
    this.isLogoutModalOpen = true;
    this.isMenuOpen = false; // Tutup menu dropdown saat modal terbuka
  }

  cancelLogout() {
    this.isLogoutModalOpen = false;
  }

  confirmLogout() {
    this.isLogoutModalOpen = false;
    this.router.navigate(['/login']);
  }
}
