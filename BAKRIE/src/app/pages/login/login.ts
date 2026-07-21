import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  isPasswordVisible = false;
  username = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) {}

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

    const isUsernameEmpty = !this.username.trim();
    const isPasswordEmpty = !this.password;

    // Validasi 1: Keduanya Kosong
    if (isUsernameEmpty && isPasswordEmpty) {
      this.errorMessage = 'Username dan Kata sandi tidak boleh kosong.';
      return;
    }
    
    // Validasi 2: Salah satu Kosong
    if (isUsernameEmpty) {
      this.errorMessage = 'Username tidak boleh kosong.';
      return;
    }
    
    if (isPasswordEmpty) {
      this.errorMessage = 'Kata sandi tidak boleh kosong.';
      return;
    }

    const isUsernameWrong = this.username !== '1234';
    const isPasswordWrong = this.password !== '5678';

    // Validasi 3: Keduanya Salah
    if (isUsernameWrong && isPasswordWrong) {
      this.errorMessage = 'Username dan Kata sandi yang Anda masukkan salah.';
      return;
    }

    // Validasi 4: Salah satu Salah
    if (isUsernameWrong) {
      this.errorMessage = 'Username tidak terdaftar di sistem.';
      return;
    }

    if (isPasswordWrong) {
      this.errorMessage = 'Kata sandi yang Anda masukkan salah.';
      return;
    }

    // Sukses -> Masuk ke Dashboard
    this.router.navigate(['/dashboard']);
  }
}
