import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HelpdeskService } from '../../core/services/helpdesk.service';

@Component({
  selector: 'app-helpdesk',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './helpdesk.html',
  styleUrl: './helpdesk.css'
})
export class HelpdeskComponent implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'dashboard';
  expandedMenu: string | null = null;
  loginId: string = '';
  loginError: boolean = false;
  
  activeSurveyId: string | null = null;
  surveyRating: number = 0;
  articleTitle: string = '';

  private helpdeskService = inject(HelpdeskService);
  
  dummyTickets: any[] = [];
  dummyStaff: any[] = [];

  // Model for new ticket
  newTicket = {
    title: '',
    category: '',
    department: '',
    description: '',
    priority: 'P3'
  };

  // Modal State
  isModalOpen = false;
  selectedTicket: any = null;
  activeModalTab: 'DETAIL' | 'HISTORY' | 'ARTICLE' = 'DETAIL';
  actionType: 'ASSIGN' | 'FORWARD' | 'WAIT' | 'HOLD' | 'REJECT' | 'APPROVE' | 'SOLVE' | 'IN_PROGRESS' | 'NONE' = 'NONE';
  actionReason = '';
  assignToStaffId = '';
  forwardToDept = '';
  evidenceText = '';

  // Notifications
  isNotifOpen = false;

  get notifications() { return this.helpdeskService.getNotifications(); }
  get unreadCount() { return this.helpdeskService.getUnreadCount(); }

  toggleNotif() {
    this.isNotifOpen = !this.isNotifOpen;
    if (this.isNotifOpen && this.unreadCount > 0) {
      this.helpdeskService.markAllNotifRead();
    }
  }

  // Bulk Actions
  selectedTicketIds = new Set<string>();

  toggleTicketSelection(id: string) {
    if (this.selectedTicketIds.has(id)) this.selectedTicketIds.delete(id);
    else this.selectedTicketIds.add(id);
  }

  selectAllTickets(event: any) {
    if (event.target.checked) {
      this.filteredTickets.forEach(t => this.selectedTicketIds.add(t.id));
    } else {
      this.selectedTicketIds.clear();
    }
  }

  processBulkAction(type: string) {
    if (this.selectedTicketIds.size === 0) return;
    
    let reason = '';
    if (type === 'WAIT') reason = 'Dimasukkan ke antrean secara massal';
    else if (type === 'HOLD') reason = 'Diberhentikan sementara secara massal';
    
    this.selectedTicketIds.forEach(id => {
      this.helpdeskService.updateTicketStatus(id, type, reason);
    });

    alert(`${this.selectedTicketIds.size} Tiket berhasil diupdate ke status ${type}!`);
    this.selectedTicketIds.clear();
    this.refreshData();
  }

  // --- ANALYTICS ---
  _filterMonth: string = (new Date().getMonth() + 1).toString().padStart(2, '0');
  _filterYear: string = new Date().getFullYear().toString();

  get filterMonth() { return this._filterMonth; }
  set filterMonth(val: string) {
    this._filterMonth = val;
    if (this.isAnalyticsMenu()) this.refreshAnalytics();
  }

  get filterYear() { return this._filterYear; }
  set filterYear(val: string) {
    this._filterYear = val;
    if (this.isAnalyticsMenu()) this.refreshAnalytics();
  }

  // --- KNOWLEDGE BASE ---
  searchQuery = '';
  faqArticles = [
    { title: 'Cara Reset Password Email Perusahaan', category: 'IT Support', views: 342, helpful: 89, content: 'Untuk mereset password, kunjungi portal identity.bakrie.com, lalu klik Lupa Password. Pastikan nomor HP Anda aktif untuk menerima OTP.' },
    { title: 'Panduan Klaim Reimbursement Medis', category: 'HR / GA', views: 812, helpful: 215, content: 'Batas klaim medis adalah tanggal 20 setiap bulannya. Lampirkan kuitansi asli dan isi form klaim dari ESS (Employee Self Service).' },
    { title: 'Printer di Lantai 4 Rusak', category: 'IT Support', views: 156, helpful: 45, content: 'Jika printer menampilkan pesan "Replace Toner", mohon jangan buat tiket. Langsung infokan ke tim GA bagian logistik karena ini terkait supplies.' },
    { title: 'Pengajuan Cuti Tahunan', category: 'HR / GA', views: 950, helpful: 310, content: 'Cuti tahunan harus diajukan minimal H-7 sebelum hari H melalui portal ESS. Pastikan Anda sudah berdiskusi dengan atasan sebelum mengajukan.' },
    { title: 'Cara Koneksi ke VPN Bakrie', category: 'IT Support', views: 620, helpful: 180, content: 'Buka aplikasi FortiClient, masukkan server vpn.bakrie.com, login menggunakan akun AD Anda. Pastikan internet Anda stabil.' }
  ];

  get filteredArticles() {
    if (!this.searchQuery) return this.faqArticles;
    const q = this.searchQuery.toLowerCase();
    return this.faqArticles.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.content.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  }

  private get baseTickets() {
    let result = this.dummyTickets;
    const user = this.helpdeskService.getCurrentUser();
    
    if (this.activeMenu.startsWith('user-')) {
      result = result.filter(t => t.requesterId === user?.id);
    } else if (this.currentRole === 'ADMIN') {
      if (user?.department && user.department !== 'unknown') {
        result = result.filter(t => 
          t.departmentTarget === user.department || 
          (t.departmentTarget === 'IT' && (user.department === 'it_infra' || user.department === 'it_sistem'))
        );
      }
    } else if (this.currentRole === 'STAFF') {
      result = result.filter(t => t.assignedTo === user?.id);
    }
    return result;
  }

  get filteredTickets() {
    let tickets = this.baseTickets;

    // Filter by Menu/Status based on Role
    if (this.activeMenu.startsWith('user-')) {
      if (this.activeMenu === 'user-menunggu-approval') {
        tickets = tickets.filter(t => t.status === 'PENDING_APPROVAL');
      } else if (this.activeMenu === 'user-selesai') {
        tickets = tickets.filter(t => t.status === 'CLOSED');
      }
    } 
    else if (this.currentRole === 'ADMIN') {
      const statusMap: any = {
        'admin-open': 'OPEN',
        'admin-wait': 'WAIT',
        'admin-forwarded': 'FORWARDED',
        'admin-assigned': 'ASSIGNED',
        'admin-inprogress': 'IN_PROGRESS',
        'admin-hold': 'HOLD',
        'admin-pending': 'PENDING_APPROVAL',
        'admin-approved': 'APPROVED',
        'admin-rejected': 'REJECTED',
        'admin-closed': 'CLOSED'
      };
      if (statusMap[this.activeMenu]) {
        tickets = tickets.filter(t => t.status === statusMap[this.activeMenu]);
      }
    }
    else if (this.currentRole === 'STAFF') {
      const statusMap: any = {
        'staff-assigned': 'ASSIGNED',
        'staff-inprogress': 'IN_PROGRESS',
        'staff-hold': 'HOLD',
        'staff-pending': 'PENDING_APPROVAL',
        'staff-rejected': 'REJECTED',
        'staff-closed': 'CLOSED'
      };
      if (statusMap[this.activeMenu]) {
        tickets = tickets.filter(t => t.status === statusMap[this.activeMenu]);
      }
    }

    return tickets;
  }

  get ticketsForSurvey() {
    return this.dummyTickets.filter(t => 
      t.requesterId === this.helpdeskService.getCurrentUser()?.id && 
      t.status === 'CLOSED' && 
      !t.csatRating
    );
  }

  isParentActive(menuId: string): boolean {
    if (menuId === 'user-tiket') return ['buat-tiket', 'user-semua-tiket', 'user-menunggu-approval', 'user-selesai'].includes(this.activeMenu);
    if (menuId === 'user-knowledge') return ['cari-solusi'].includes(this.activeMenu);
    if (menuId === 'user-survey') return ['survey-kepuasan'].includes(this.activeMenu);
    if (menuId === 'admin-tiket') return this.activeMenu.startsWith('admin-') && !['admin-staff', 'admin-laporan'].includes(this.activeMenu) && !['daftar-staff', 'status-staff', 'beban-kerja', 'statistik-tiket', 'rata-waktu', 'rating-staff', 'export-laporan'].includes(this.activeMenu);
    if (menuId === 'admin-staff') return ['daftar-staff', 'status-staff', 'beban-kerja'].includes(this.activeMenu);
    if (menuId === 'admin-laporan') return ['statistik-tiket', 'rata-waktu', 'rating-staff', 'export-laporan'].includes(this.activeMenu);
    if (menuId === 'staff-tiket') return this.activeMenu.startsWith('staff-') && !['rating-saya'].includes(this.activeMenu);
    if (menuId === 'staff-survey') return ['rating-saya'].includes(this.activeMenu);
    return false;
  }

  ngOnInit() {
    this.refreshData();
  }

  doLogin() {
    if (this.helpdeskService.login(this.loginId)) {
      this.loginError = false;
      this.refreshData();
    } else {
      this.loginError = true;
    }
  }

  doLogout() {
    this.helpdeskService.logout();
    this.loginId = '';
  }

  get currentRole() {
    return this.helpdeskService.getCurrentUser()?.role || '';
  }

  setRole(role: 'USER' | 'ADMIN' | 'STAFF') {
    if (role === 'USER') this.helpdeskService.login('1234');
    else if (role === 'ADMIN') this.helpdeskService.login('9999');
    else if (role === 'STAFF') this.helpdeskService.login('8888');
    
    this.refreshData();
    this.activeMenu = 'dashboard';
    this.expandedMenu = null;
  }

  refreshData() {
    this.helpdeskService.getAllTickets().subscribe({
      next: (backendTickets: any[]) => {
        // Map data dari format Backend ke format Dummy Frontend (supaya HTML tidak perlu banyak berubah)
        this.dummyTickets = backendTickets.map(t => {
          let deptName = (t.department?.name || '').toLowerCase();
          let deptTarget = 'it_infra';
          if (deptName.includes('infra')) deptTarget = 'it_infra';
          else if (deptName.includes('sistem') || deptName.includes('system')) deptTarget = 'it_sistem';
          else if (deptName.includes('ga') || deptName.includes('general')) deptTarget = 'ga';
          else if (deptName.includes('hr') || deptName.includes('human')) deptTarget = 'hr';
          else if (deptName.includes('maintenance')) deptTarget = 'maintenance';
          else if (deptName.includes('direksi')) deptTarget = 'direksi';
          else deptTarget = 'it_infra';

          return {
            id: t.id,
            ticketCode: t.ticket_code || t.id, // Untuk display
            title: t.title,
            description: t.description,
            category: t.category,
            // Nama departemen untuk display UI
            department: t.department?.name || 'IT Infra',
            // Mapping balik nama department DB ke value dropdown
            departmentTarget: deptTarget,
            priority: t.priority,
          status: t.status,
            requesterId: t.creator?.id || '',
            requesterName: t.creator?.name || 'Unknown User',
            assignedTo: t.assignee?.id || '',
            assignedToName: t.assignee?.name || '',
            date: new Date(t.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            createdAt: t.createdAt,
            csatRating: t.survey?.rating || 0
          };
        });
        
        this.dummyStaff = this.helpdeskService.getDynamicStaff(this.dummyTickets);
        
        if (this.isAnalyticsMenu()) {
          this.refreshAnalytics();
        }
      },
      error: (err) => {
        console.error('Failed to load tickets from API', err);
        // Fallback or show error
      }
    });
  }
  
  refreshAnalytics() {
    let month: number | undefined = undefined;
    let year: number | undefined = undefined;
    
    if (this.filterMonth && this.filterMonth !== 'all') month = parseInt(this.filterMonth);
    if (this.filterYear && this.filterYear !== 'all') year = parseInt(this.filterYear);
    
    this.helpdeskService.getTicketReports(month, year).subscribe({
      next: (res: any) => {
        let closedCount = 0;
        let inProgressCount = 0;
        let holdCount = 0;
        let openCount = 0;
        
        if (res.byStatus) {
            res.byStatus.forEach((s: any) => {
                if (s.status === 'CLOSED') closedCount += s.count;
                if (['IN_PROGRESS', 'ASSIGNED'].includes(s.status)) inProgressCount += s.count;
                if (['HOLD', 'WAIT', 'PENDING_APPROVAL'].includes(s.status)) holdCount += s.count;
                if (['OPEN', 'FORWARDED'].includes(s.status)) openCount += s.count;
            });
        }
        
        let totalFromStatus = openCount + inProgressCount + holdCount + closedCount;
        let total = totalFromStatus > 0 ? totalFromStatus : (res.summary?.monthly || 0);
        
        // Bulletproof fallback: if backend says 0 but we have tickets in our list, use the list!
        if (total === 0 && this.analyticsTickets.length > 0) {
            closedCount = 0; inProgressCount = 0; holdCount = 0; openCount = 0;
            this.analyticsTickets.forEach(t => {
                if (t.status === 'CLOSED') closedCount++;
                else if (['IN_PROGRESS', 'ASSIGNED'].includes(t.status)) inProgressCount++;
                else if (['HOLD', 'WAIT', 'PENDING_APPROVAL'].includes(t.status)) holdCount++;
                else if (['OPEN', 'FORWARDED'].includes(t.status)) openCount++;
            });
            total = closedCount + inProgressCount + holdCount + openCount;
        }
        
        const getPct = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;
        
        this.dashboardStats = {
          total: total,
          csat: { rating: '4.8', count: 12 }, // Placeholder since API doesn't return CSAT yet
          counts: {
            active: openCount + inProgressCount + holdCount,
            resolved: closedCount
          },
          status: {
            closed: getPct(closedCount),
            inProgress: getPct(inProgressCount),
            hold: getPct(holdCount),
            open: getPct(openCount)
          },
          trend: {
            m1: Math.floor(total * 0.2), m2: Math.floor(total * 0.4), m3: Math.floor(total * 0.3), m4: Math.floor(total * 0.1),
            m1Pct: 40, m2Pct: 80, m3Pct: 60, m4Pct: 20
          }
        };
      },
      error: (err: any) => {
        console.error('Failed to load analytics from API, falling back to local data', err);
        // Fallback for Role Simulator (where JWT token is User but UI is Admin)
        let closed = 0, inprog = 0, hold = 0, open = 0;
        this.analyticsTickets.forEach(t => {
            if (t.status === 'CLOSED') closed++;
            else if (['IN_PROGRESS', 'ASSIGNED'].includes(t.status)) inprog++;
            else if (['HOLD', 'WAIT', 'PENDING_APPROVAL'].includes(t.status)) hold++;
            else if (['OPEN', 'FORWARDED'].includes(t.status)) open++;
        });
        const total = closed + inprog + hold + open;
        const getPct = (c: number) => total > 0 ? Math.round((c / total) * 100) : 0;
        
        this.dashboardStats = {
          total: total,
          csat: { rating: '4.8', count: 12 },
          counts: { active: open + inprog + hold, resolved: closed },
          status: { closed: getPct(closed), inProgress: getPct(inprog), hold: getPct(hold), open: getPct(open) },
          trend: { m1: 0, m2: 0, m3: 0, m4: 0, m1Pct: 0, m2Pct: 0, m3Pct: 0, m4Pct: 0 }
        };
      }
    });
  }

  get analyticsTickets() {
    let base = this.baseTickets;
    
    if (this.filterMonth || this.filterYear) {
      base = base.filter(t => {
        if (!t.createdAt) return true;
        const d = new Date(t.createdAt);
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const y = d.getFullYear().toString();
        
        if (this.filterMonth && this.filterMonth !== 'all' && m !== this.filterMonth) return false;
        if (this.filterYear && this.filterYear !== 'all' && y !== this.filterYear) return false;
        
        return true;
      });
    }
    return base;
  }

  dashboardStats: any = {
    total: 0,
    csat: { rating: '0.0', count: 0 },
    counts: { active: 0, resolved: 0 },
    status: { closed: 0, inProgress: 0, hold: 0, open: 0 },
    trend: { m1: 0, m2: 0, m3: 0, m4: 0, m1Pct: 0, m2Pct: 0, m3Pct: 0, m4Pct: 0 }
  };

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  showWIPAlert(feature: string) {
    if (feature.includes('Export')) {
      alert('Laporan berhasil di-export dan diunduh (Mockup)');
    } else if (feature.includes('Artikel')) {
      this.articleTitle = feature.replace('Baca Artikel ', '');
      this.isModalOpen = true;
      this.activeModalTab = 'ARTICLE';
    } else {
      alert(`Fitur ${feature} sedang diproses...`);
    }
  }

  submitTicket() {
    if (!this.newTicket.title || !this.newTicket.category || !this.newTicket.department || !this.newTicket.description) {
      alert('Mohon lengkapi semua field yang wajib (*)');
      return;
    }
    
    // Convert dropdown value to DB name
    let dbDeptName = 'IT Infrastruktur';
    if (this.newTicket.department === 'it_sistem') dbDeptName = 'IT System';
    else if (this.newTicket.department === 'ga') dbDeptName = 'General Affair';
    else if (this.newTicket.department === 'hr') dbDeptName = 'Human Resources';
    else if (this.newTicket.department === 'maintenance') dbDeptName = 'Maintenance';
    else if (this.newTicket.department === 'direksi') dbDeptName = 'Direksi';

    this.helpdeskService.createTicket({
      title: this.newTicket.title,
      category: this.newTicket.category,
      department_name: dbDeptName,
      description: this.newTicket.description,
      priority: this.newTicket.priority
    }).subscribe({
      next: (res) => {
        // Reset form
        this.newTicket = { title: '', category: '', department: '', description: '', priority: 'P3' };
        
        // Refresh data and navigate to list
        this.refreshData();
        this.setActiveMenu('user-semua-tiket');
      },
      error: (err) => {
        alert('Gagal membuat tiket: ' + (err.error?.message || err.message));
      }
    });
  }

  viewDetail(ticket: any) {
    this.selectedTicket = ticket;
    this.isModalOpen = true;
    this.activeModalTab = 'DETAIL';
    this.actionType = 'NONE';
    this.actionReason = '';
    this.assignToStaffId = '';
  }

  quickAction(ticket: any, action: any) {
    this.selectedTicket = ticket;
    this.actionType = action;
    
    if (action === 'IN_PROGRESS') {
      this.processTicketAction();
    } else {
      this.isModalOpen = true;
      this.activeModalTab = 'DETAIL';
      this.actionReason = '';
      this.assignToStaffId = '';
      this.evidenceText = '';
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedTicket = null;
  }

  openSurveyForm(ticketId: string) {
    this.activeSurveyId = ticketId;
    this.surveyRating = 0;
    this.actionReason = '';
  }

  setRating(rating: number) {
    this.surveyRating = rating;
  }

  submitSurvey() {
    if (this.surveyRating === 0) {
      alert('Silakan pilih rating bintang terlebih dahulu!');
      return;
    }
    this.helpdeskService.submitSurvey(this.activeSurveyId!, this.surveyRating, this.actionReason).subscribe({
      next: () => {
        alert(`Terima kasih! Survey untuk tiket ${this.activeSurveyId} berhasil dikirim.`);
        this.activeSurveyId = null;
        this.refreshData();
      },
      error: (err) => {
        alert('Gagal mengirim survey: ' + err.message);
      }
    });
  }

  processTicketAction() {
    if (!this.selectedTicket) return;

    let targetStatus: string = '';
    let notes: string = '';
    let assignedTo: string | undefined = undefined;
    let forwardDept: string | undefined = undefined;

    if (this.actionType === 'ASSIGN') {
      if (!this.assignToStaffId) {
        alert('Pilih teknisi terlebih dahulu!');
        return;
      }
      targetStatus = 'ASSIGNED';
      notes = `Ditugaskan kepada teknisi (ID: ${this.assignToStaffId})`;
      assignedTo = this.assignToStaffId;
    } 
    else if (this.actionType === 'WAIT') {
      targetStatus = 'WAIT';
      notes = 'Dimasukkan ke antrean karena teknisi penuh';
    }
    else if (this.actionType === 'FORWARD') {
      if (!this.forwardToDept) {
        alert('Pilih departemen tujuan terlebih dahulu!');
        return;
      }
      targetStatus = 'FORWARDED';
      notes = `Diteruskan ke departemen ${this.forwardToDept}`;
      forwardDept = this.forwardToDept;
    }
    else if (this.actionType === 'HOLD') {
      if (!this.actionReason) {
        alert('Alasan HOLD wajib diisi sesuai SOP!');
        return;
      }
      targetStatus = 'HOLD';
      notes = `Menunggu / Hold: ${this.actionReason}`;
    }
    else if (this.actionType === 'IN_PROGRESS') {
      targetStatus = 'IN_PROGRESS';
      notes = 'Teknisi mulai mengerjakan tiket';
    }
    else if (this.actionType === 'SOLVE') {
      if (!this.actionReason) {
        alert('Evidence / Deskripsi perbaikan wajib diisi sesuai SOP!');
        return;
      }
      targetStatus = 'PENDING_APPROVAL';
      notes = `Pekerjaan Selesai: ${this.actionReason}`;
    }
    else if (this.actionType === 'APPROVE') {
      targetStatus = 'CLOSED';
      notes = 'Tiket disetujui dan ditutup oleh Pelapor';
    }
    else if (this.actionType === 'REJECT') {
      if (!this.actionReason) {
        alert('Alasan penolakan wajib diisi!');
        return;
      }
      targetStatus = 'REJECTED';
      notes = `Ditolak oleh Pelapor: ${this.actionReason}`;
    }

    this.helpdeskService.updateTicketStatus(this.selectedTicket.id, targetStatus, notes, assignedTo, forwardDept).subscribe({
      next: () => {
        if (this.actionType === 'APPROVE') {
          alert('Tiket berhasil ditutup! Mohon isi Survey Kepuasan di menu Survey.');
        } else {
          alert(`Tiket berhasil diproses!`);
        }
        
        this.refreshData(); // Refresh list to get updated data from API
        
        // Auto-redirect to the corresponding tab so the user sees the ticket didn't vanish
        if (this.currentRole === 'STAFF') {
          if (this.actionType === 'IN_PROGRESS') this.setActiveMenu('staff-inprogress');
          else if (this.actionType === 'HOLD') this.setActiveMenu('staff-hold');
          else if (this.actionType === 'SOLVE') this.setActiveMenu('staff-pending');
        } else if (this.currentRole === 'ADMIN') {
          if (this.actionType === 'ASSIGN') this.setActiveMenu('admin-assigned');
          else if (this.actionType === 'FORWARD') this.setActiveMenu('admin-forwarded');
          else if (this.actionType === 'WAIT') this.setActiveMenu('admin-wait');
        }

        this.closeModal();
      },
      error: (err) => {
        alert('Gagal mengupdate tiket: ' + (err.error?.message || err.message));
      }
    });
  }

  toggleAccordion(menu: string) {
    if (this.expandedMenu === menu) {
      this.expandedMenu = null;
    } else {
      this.expandedMenu = menu;
    }
  }

  deleteTicket(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus tiket ini? Tindakan ini tidak dapat dibatalkan.')) return;
    
    this.helpdeskService.deleteTicket(id).subscribe({
      next: () => {
        alert('Tiket berhasil dihapus!');
        this.refreshData();
      },
      error: (err) => {
        alert('Gagal menghapus tiket: ' + (err.error?.message || err.message));
      }
    });
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (this.isAnalyticsMenu()) {
      this.refreshAnalytics();
    }
  }

  // Helper functions to categorize the current active menu
  isTicketListMenu(): boolean {
    const listMenus = [
      'user-semua-tiket', 'user-menunggu-approval', 'user-selesai',
      'admin-semua', 'admin-open', 'admin-wait', 'admin-forwarded', 'admin-assigned', 'admin-inprogress', 'admin-hold', 'admin-pending', 'admin-approved', 'admin-rejected', 'admin-closed',
      'staff-assigned', 'staff-inprogress', 'staff-hold', 'staff-pending', 'staff-rejected', 'staff-closed'
    ];
    return listMenus.includes(this.activeMenu);
  }

  isStaffMenu(): boolean {
    const staffMenus = ['daftar-staff', 'status-staff', 'beban-kerja'];
    return staffMenus.includes(this.activeMenu);
  }

  isAnalyticsMenu(): boolean {
    const analyticsMenus = ['statistik-tiket', 'rata-waktu', 'rating-staff', 'export-laporan', 'rating-saya'];
    return analyticsMenus.includes(this.activeMenu);
  }

  isKnowledgeBaseMenu(): boolean {
    return this.activeMenu === 'cari-solusi';
  }

  isSurveyMenu(): boolean {
    return this.activeMenu === 'survey-kepuasan';
  }
}
