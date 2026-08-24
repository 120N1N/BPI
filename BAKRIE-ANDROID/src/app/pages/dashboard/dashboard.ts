import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { ModuleItem } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  showSubModules = false;
  mainModules: ModuleItem[] = [];
  subModules: ModuleItem[] = [];

  constructor(private dashboardService: DashboardService, private router: Router) {}

  ngOnInit() {
    this.mainModules = this.dashboardService.getMainModules();
    this.subModules = this.dashboardService.getSubModules();
  }

  toggleSubModules() {
    this.showSubModules = !this.showSubModules;
  }

  navigateToModule(moduleName: string) {
    if (moduleName.toUpperCase() === 'HELPDESK') {
      this.router.navigate(['/helpdesk']);
    }
  }
}

