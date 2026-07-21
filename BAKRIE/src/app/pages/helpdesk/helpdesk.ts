import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-helpdesk',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './helpdesk.html',
  styleUrl: './helpdesk.css'
})
export class HelpdeskComponent {
  isSidebarOpen = true;
  activeMenu = 'dashboard';
  expandedMenu: string | null = null;
  currentRole: 'USER' | 'ADMIN' | 'STAFF' = 'USER';

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleAccordion(menu: string) {
    if (this.expandedMenu === menu) {
      this.expandedMenu = null;
    } else {
      this.expandedMenu = menu;
    }
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
  }

  setRole(role: 'USER' | 'ADMIN' | 'STAFF') {
    this.currentRole = role;
    this.activeMenu = 'dashboard';
    this.expandedMenu = null;
  }
}
