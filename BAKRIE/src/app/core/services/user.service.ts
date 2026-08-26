import { Injectable } from '@angular/core';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  getUserProfile(): UserProfile {
    // Ambil data asli dari localStorage yang disimpan saat login
    const storedData = localStorage.getItem('user_data');
    
    // Default fallback jika belum login atau data kosong
    const defaultUser: UserProfile = {
      name: 'Pengguna',
      division: '-',
      email: '-',
      nip: '-',
      role: 'Karyawan',
      joinDate: '-',
      lastLogin: new Date().toLocaleDateString('id-ID'),
      status: 'ACTIVE'
    };

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        // Gabungkan data dari backend dengan struktur default
        return {
          ...defaultUser,
          name: parsed.nama_lengkap || parsed.name || parsed.email || defaultUser.name,
          nip: parsed.id_karyawan || parsed.nip || parsed.email || defaultUser.nip, // SSMS NIP disimpan di email
          email: parsed.email || defaultUser.email,
          role: (parsed.role && parsed.role.length > 0) ? parsed.role[0] : defaultUser.role,
        };
      } catch (e) {
        return defaultUser;
      }
    }
    
    return defaultUser;
  }
}
