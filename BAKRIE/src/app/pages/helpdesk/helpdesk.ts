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
  isSidebarOpen = true;
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

  get filteredTickets() {
    let tickets = this.dummyTickets;

    // Filter by Role
    if (this.currentRole === 'USER') {
      tickets = tickets.filter(t => t.requesterId === this.helpdeskService.getCurrentUser()?.id);
      
      if (this.activeMenu === 'user-menunggu-approval') {
        tickets = tickets.filter(t => t.status === 'PENDING_APPROVAL');
      } else if (this.activeMenu === 'user-selesai') {
        tickets = tickets.filter(t => t.status === 'CLOSED');
      }
    } 
    else if (this.currentRole === 'ADMIN') {
      // Admin sees all by default, filter by status based on menu
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
      // Staff typically sees tickets assigned to their department or themselves
      // For this dummy, we just filter by status for the staff menus
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
    this.dummyTickets = this.helpdeskService.getAllTickets();
    this.dummyStaff = [
      { name: 'Teknisi A', dept: 'IT Support', status: 'FREE', load: 0 },
      { name: 'Teknisi B', dept: 'IT Support', status: 'BUSY', load: 3 },
      { name: 'Staff GA 1', dept: 'General Affair', status: 'BUSY', load: 1 },
      { name: 'Staff HR', dept: 'Human Resources', status: 'FREE', load: 0 }
    ];
  }

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

    this.helpdeskService.createTicket({
      title: this.newTicket.title,
      category: this.newTicket.category,
      department: this.newTicket.department,
      description: this.newTicket.description,
      priority: this.newTicket.priority
    });

    // Reset form
    this.newTicket = { title: '', category: '', department: '', description: '', priority: 'P3' };
    
    // Refresh data and navigate to list
    this.refreshData();
    this.setActiveMenu('user-semua-tiket');
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
    // Update status tiket jadi CLOSED di backend
    this.helpdeskService.updateTicketStatus(this.activeSurveyId!, 'CLOSED', `Survey diisi dengan rating ${this.surveyRating} bintang. Komentar: ${this.actionReason}`);
    
    alert(`Terima kasih! Survey untuk tiket ${this.activeSurveyId} berhasil dikirim.`);
    this.activeSurveyId = null;
    this.refreshData();
  }

  processTicketAction() {
    if (!this.selectedTicket) return;

    if (this.actionType === 'ASSIGN') {
      if (!this.assignToStaffId) {
        alert('Pilih teknisi terlebih dahulu!');
        return;
      }
      this.helpdeskService.updateTicketStatus(
        this.selectedTicket.id, 
        'ASSIGNED', 
        `Ditugaskan kepada ${this.assignToStaffId}`, 
        this.assignToStaffId
      );
    } 
    else if (this.actionType === 'WAIT') {
      this.helpdeskService.updateTicketStatus(this.selectedTicket.id, 'WAIT', 'Dimasukkan ke antrean karena teknisi penuh');
    }
    else if (this.actionType === 'FORWARD') {
      if (!this.forwardToDept) {
        alert('Pilih departemen tujuan terlebih dahulu!');
        return;
      }
      this.helpdeskService.updateTicketStatus(this.selectedTicket.id, 'FORWARDED', `Diteruskan ke departemen ${this.forwardToDept}`);
      // In real backend, this would update the departmentTarget field
    }
    else if (this.actionType === 'HOLD') {
      if (!this.actionReason) {
        alert('Alasan HOLD wajib diisi sesuai SOP!');
        return;
      }
      this.helpdeskService.updateTicketStatus(this.selectedTicket.id, 'HOLD', `Menunggu / Hold: ${this.actionReason}`);
    }
    else if (this.actionType === 'IN_PROGRESS') {
      this.helpdeskService.updateTicketStatus(this.selectedTicket.id, 'IN_PROGRESS', 'Teknisi mulai mengerjakan tiket');
    }
    else if (this.actionType === 'SOLVE') {
      if (!this.evidenceText) {
        alert('Evidence / Deskripsi perbaikan wajib diisi sesuai SOP!');
        return;
      }
      this.helpdeskService.updateTicketStatus(this.selectedTicket.id, 'PENDING_APPROVAL', `Pekerjaan Selesai: ${this.evidenceText}`);
    }
    else if (this.actionType === 'APPROVE') {
      this.helpdeskService.updateTicketStatus(this.selectedTicket.id, 'CLOSED', 'Tiket disetujui dan ditutup oleh Pelapor');
      alert('Tiket berhasil ditutup! Mohon isi Survey Kepuasan di menu Survey.');
    }
    else if (this.actionType === 'REJECT') {
      if (!this.actionReason) {
        alert('Alasan penolakan wajib diisi!');
        return;
      }
      this.helpdeskService.updateTicketStatus(this.selectedTicket.id, 'REJECTED', `Ditolak oleh Pelapor: ${this.actionReason}`);
    }

    if (this.actionType !== 'APPROVE') {
      alert(`Tiket ${this.selectedTicket.id} berhasil diproses!`);
    }
    this.refreshData(); // Refresh list to get updated data from localstorage
    
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
