import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HelpdeskService } from '../../core/services/helpdesk.service';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class ReportsComponent implements OnInit {
  summary = {
    daily: 0,
    monthly: 0,
    yearly: 0,
    total: 0
  };

  isLoading = true;
  errorMessage = '';

  // Filter state
  selectedMonth: number;
  selectedYear: number;
  
  months = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
    { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
  ];
  years: number[] = [];

  // Chart config
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      }
    }
  };

  constructor(private helpdeskService: HelpdeskService) {
    const now = new Date();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
    
    // Generate last 5 years
    for (let i = 0; i < 5; i++) {
      this.years.push(this.selectedYear - i);
    }
  }

  ngOnInit(): void {
    console.log('Cache buster v1.0.1');
    this.loadReports();
  }

  applyFilter() {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.helpdeskService.getTicketReports(this.selectedMonth, this.selectedYear).subscribe({
      next: (data: any) => {
        this.summary = data.summary;
        
        // Build chart data
        const labels = [];
        const counts = [];
        const backgroundColors = [];

        for (const item of data.byStatus) {
          labels.push(item.status);
          counts.push(item.count);
          
          if (item.status === 'OPEN') backgroundColors.push('#3b82f6');
          else if (item.status === 'IN PROGRESS') backgroundColors.push('#eab308');
          else if (item.status === 'RESOLVED') backgroundColors.push('#a855f7');
          else if (item.status === 'CLOSED') backgroundColors.push('#22c55e');
          else backgroundColors.push('#94a3b8');
        }

        this.pieChartData = {
          labels,
          datasets: [{
            data: counts,
            backgroundColor: backgroundColors,
            hoverOffset: 4
          }]
        };

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching reports:', err);
        this.errorMessage = 'Gagal memuat data laporan.';
        this.isLoading = false;
      }
    });
  }
}
