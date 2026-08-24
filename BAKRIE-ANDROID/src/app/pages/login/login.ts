import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../config';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  isPasswordVisible = false;
  username = '';
  password = '';
  errorMessage = '';
  isSplash = true; // State untuk animasi splash screen

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Jalankan animasi splash screen selama 5 detik
    setTimeout(() => {
      this.isSplash = false;
      this.cdr.detectChanges(); // Paksa Angular memperbarui UI
    }, 5000);
  }

  togglePassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  hasUsernameError(): boolean {
    return this.errorMessage.includes('Username');
  }

  hasPasswordError(): boolean {
    return this.errorMessage.includes('Kata sandi');
  }

  onLogin(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.cdr.detectChanges();

    const isUsernameEmpty = !this.username.trim();
    const isPasswordEmpty = !this.password;

    if (isUsernameEmpty && isPasswordEmpty) {
      this.errorMessage = 'Username dan Kata sandi tidak boleh kosong.';
      this.cdr.detectChanges();
      return;
    }

    if (isUsernameEmpty) {
      this.errorMessage = 'Username tidak boleh kosong.';
      this.cdr.detectChanges();
      return;
    }

    if (isPasswordEmpty) {
      this.errorMessage = 'Kata sandi tidak boleh kosong.';
      this.cdr.detectChanges();
      return;
    }



    // Memanggil API Backend (SSMS via Node.js)
    // Di SSMS, username (NIP) seperti '1000', '1001', '0000' disimpan di kolom 'email'
    this.http.post(`http://${AppConfig.apiServerIp}:3001/api/auth/login`, {
      email: this.username.trim(),
      password: this.password
    }).subscribe({
      next: (response: any) => {
        // Simpan token & role
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          // Backend mengirim array roles, simpan role pertamanya
          const userRole = (response.user && response.user.role && response.user.role.length > 0)
            ? response.user.role[0] : 'user';
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }

        // Sukses -> Masuk ke Dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        alert('DEBUG ERROR: ' + JSON.stringify(error) + '\n\nMessage: ' + error.message);
        if (error.status === 401) {
          this.errorMessage = 'Username atau Password salah';
        } else {
          this.errorMessage = 'Gagal terhubung ke server (Error ' + error.status + ')';
        }
        this.cdr.detectChanges(); // WAJIB ada agar UI HP me-refresh teks error-nya
      }
    });
  }
}
