import { Injectable } from '@angular/core';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: UserProfile = {
    name: 'Darrel Khayru Adityansah',
    division: 'IT Division',
    email: 'DarrelKhayruadityansah@bakrie.ac.id',
    nip: '1234',
    role: 'Karyawan',
    joinDate: '12/12/2012',
    lastLogin: '01/07/2026',
    status: 'ACTIVE'
  };

  getUserProfile(): UserProfile {
    return { ...this.user };
  }
}
