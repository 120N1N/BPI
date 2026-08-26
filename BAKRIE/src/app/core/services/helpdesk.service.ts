import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../config';

export type TicketStatus = 'OPEN' | 'FORWARDED' | 'WAIT' | 'ASSIGNED' | 'IN_PROGRESS' | 'HOLD' | 'PENDING_APPROVAL' | 'REJECTED' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type Department = 'it_infra' | 'it_sistem' | 'ga' | 'hr' | string;

export interface User {
  id: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'STAFF';
  status: 'FREE' | 'BUSY';
  department: Department;
}

export interface TicketHistory {
  date: string;
  actor: string;
  action: string;
  notes: string;
}

export interface Notification {
  id: number;
  message: string;
  date: string;
  read: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  departmentTarget: Department;
  priority: TicketPriority;
  status: TicketStatus;
  
  requesterId: string;
  requesterName: string;
  assignedTo?: string;
  
  date: string;       // Creation date string
  dueDate: string;    // Due date string
  
  history: TicketHistory[];
  
  // Fitur SOP Baru
  holdReason?: string;
  evidenceText?: string;
  rejectReason?: string;
  csatRating?: number;
  csatComment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HelpdeskService {
  
  // Database Dummy (In-Memory initially, then synced to LocalStorage)
  private usersDB: User[] = [
    { id: '1234', name: 'Darrel Khayru', role: 'USER', status: 'FREE', department: 'it_infra' },
    { id: '9999', name: 'Sutrisno', role: 'ADMIN', status: 'FREE', department: 'it_infra' },
    { id: '8888', name: 'Budi', role: 'STAFF', status: 'FREE', department: 'it_infra' },
    { id: '7777', name: 'Dina', role: 'STAFF', status: 'BUSY', department: 'it_sistem' },
    { id: '1111', name: 'Kusuma', role: 'ADMIN', status: 'FREE', department: 'ga' },
    { id: '2222', name: 'Rudi', role: 'STAFF', status: 'FREE', department: 'ga' }
  ];
  private notifications: Notification[] = [];

  private currentUser: User | null = null;

  private get apiUrl(): string {
    const ip = localStorage.getItem('api_server_ip') || AppConfig.apiServerIp;
    return `http://${ip}:3001/api/tickets`;
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  constructor(private http: HttpClient) {
    this.loadFromStorage();
    this.loadSession();
  }

  // --- AUTHENTICATION ---
  private loadSession() {
    const session = localStorage.getItem('bakrie_helpdesk_session');
    if (session) {
      try {
        const userId = atob(session);
        const user = this.usersDB.find(u => u.id === userId);
        if (user) this.currentUser = user;
      } catch(e) {}
    }
  }

  login(userId: string): boolean {
    const user = this.usersDB.find(u => u.id === userId);
    if (user) {
      this.currentUser = user;
      localStorage.setItem('bakrie_helpdesk_session', btoa(user.id));
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('bakrie_helpdesk_session');
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    // Ambil data asli dari localStorage yang disimpan saat login API
    const storedData = localStorage.getItem('user_data');
    const storedRole = localStorage.getItem('userRole');
    
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        let role = 'USER';
        
        if (storedRole) {
          role = storedRole.toUpperCase();
        } else if (parsed.role && parsed.role.length > 0) {
          role = parsed.role[0].toUpperCase();
        }

        // Mapping role ke format baku aplikasi Helpdesk (USER / STAFF / ADMIN)
        if (role === 'KARYAWAN') role = 'USER';
        if (role === 'TEKNISI') role = 'STAFF';
        if (role === 'ADMIN_DEPT' || role === 'ADMIN DEPT' || role === 'ADMIN_DEPARTEMEN') role = 'ADMIN';

        let dept = parsed.department_name || parsed.departemen || parsed.department || 'it_infra';
        if (typeof dept === 'string') {
          const d = dept.toLowerCase();
          if (d.includes('infra')) dept = 'it_infra';
          else if (d.includes('sistem') || d.includes('system')) dept = 'it_sistem';
          else if (d.includes('ga') || d.includes('general')) dept = 'ga';
          else if (d.includes('hr') || d.includes('human')) dept = 'hr';
          else if (d.includes('maintenance')) dept = 'maintenance';
          else if (d.includes('direksi')) dept = 'direksi';
        }

        return {
          id: parsed.id || parsed.id_karyawan || parsed.nip || parsed.email || 'unknown',
          name: parsed.nama_lengkap || parsed.name || parsed.email || 'Pengguna',
          role: role as any,
          status: 'FREE',
          department: dept
        };
      } catch (e) {}
    }

    return this.currentUser;
  }

  // --- ENCRYPTION & STORAGE ---
  private loadFromStorage() {
    const savedNotifs = localStorage.getItem('bakrie_helpdesk_notif');
    if (savedNotifs) {
      try {
        this.notifications = JSON.parse(savedNotifs);
      } catch(e) {}
    }
  }

  private saveToStorage() {
    localStorage.setItem('bakrie_helpdesk_notif', JSON.stringify(this.notifications));
  }

  // --- NOTIFICATIONS ---
  getNotifications(): Notification[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  addNotification(message: string) {
    this.notifications.unshift({
      id: Date.now(),
      message,
      date: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      read: false
    });
    this.saveToStorage();
  }

  markAllNotifRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
  }

  // --- TICKET MGT ---
  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getDynamicStaff(currentTickets: Ticket[] = []) {
    const staffList = this.usersDB.filter(u => u.role === 'STAFF');
    return staffList.map(staff => {
      const activeTickets = currentTickets.filter(t => 
        t.assignedTo === staff.id && 
        t.status !== 'CLOSED' && 
        t.status !== 'REJECTED' && 
        t.status !== 'RESOLVED'
      );
      const load = activeTickets.length;
      return {
        id: staff.id,
        name: staff.name,
        dept: staff.department,
        status: load > 0 ? 'BUSY' : 'FREE',
        load: load,
        loadPercentage: Math.min((load / 5) * 100, 100)
      };
    });
  }

  createTicket(ticket: any): Observable<any> {
    return this.http.post(this.apiUrl, ticket, { headers: this.getHeaders() });
  }

  updateTicketStatus(ticketId: string, newStatus: string, notes: string, assignedTo?: string, forwardDept?: string): Observable<any> {
    const payload: any = {
      status: newStatus,
      notes: notes
    };
    if (assignedTo) payload.assigned_to = assignedTo;
    if (forwardDept) payload.forward_dept = forwardDept;
    
    return this.http.put(`${this.apiUrl}/${ticketId}/status`, payload, { headers: this.getHeaders() });
  }

  submitSurvey(ticketId: string, rating: number, comment: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${ticketId}/survey`, { rating, feedback: comment }, { headers: this.getHeaders() });
  }

  deleteTicket(ticketId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${ticketId}`, { headers: this.getHeaders() });
  }

  getTicketReports(month?: number, year?: number): Observable<any> {
    const ip = localStorage.getItem('api_server_ip') || AppConfig.apiServerIp;
    let url = `http://${ip}:3001/api/tickets/reports/analytics`;
    const params = [];
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }
}
