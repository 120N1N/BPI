import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { UserProfile } from '../../core/models/user.model';

@Component({
  selector: 'app-bpi-online',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './bpi-online.html',
  styleUrl: './bpi-online.css'
})
export class BpiOnlineComponent implements OnInit {
  user!: UserProfile;

  quickActions = [
    { name: 'Absen', icon: 'fingerprint', isSvg: false },
    { name: 'Log', icon: 'history', isSvg: false },
    { name: 'Approval', icon: 'done_all', isSvg: false },
    { name: 'Bantuan', icon: 'whatsapp', isSvg: true }
  ];

  applications = [
    { name: 'Profile', icon: 'person' },
    { name: 'Career', icon: 'trending_up' },
    { name: 'Training', icon: 'menu_book' },
    { name: 'Cuti', icon: 'calendar_today' },
    { name: 'Izin', icon: 'assignment_ind' },
    { name: 'Kotak Saran', icon: 'mail' },
    { name: 'SPL', icon: 'task' },
    { name: 'Tracking PR', icon: 'shopping_cart' },
    { name: 'PR Online', icon: 'sell' },
    { name: 'Goods Rcv', icon: 'inventory_2' },
    { name: 'Goods Insp', icon: 'visibility' },
    { name: 'Cash Adv', icon: 'payments' },
    { name: 'Petty Cash', icon: 'account_balance_wallet' },
    { name: 'WO Job', icon: 'work' },
    { name: 'Tracking WO', icon: 'assignment' },
    { name: 'WH Stock', icon: 'warehouse' },
    { name: 'Project Actual', icon: 'show_chart' },
    { name: 'Dir. Payment', icon: 'compare_arrows' },
    { name: 'Track Project', icon: 'map' },
    { name: 'Reimbursement', icon: 'receipt' }
  ];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.user = this.userService.getUserProfile();
  }
}
