import { Injectable } from '@angular/core';

export type TicketStatus = 'OPEN' | 'FORWARDED' | 'WAIT' | 'ASSIGNED' | 'IN_PROGRESS' | 'HOLD' | 'PENDING_APPROVAL' | 'REJECTED' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type Department = 'IT' | 'HR' | 'GA';

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
    { id: '1234', name: 'Darrel Khayru', role: 'USER', status: 'FREE', department: 'IT' },
    { id: '9999', name: 'Admin IT', role: 'ADMIN', status: 'FREE', department: 'IT' },
    { id: '8888', name: 'Teknisi A', role: 'STAFF', status: 'FREE', department: 'IT' },
    { id: '7777', name: 'Teknisi B', role: 'STAFF', status: 'BUSY', department: 'IT' },
    { id: '1111', name: 'Admin GA', role: 'ADMIN', status: 'FREE', department: 'GA' },
    { id: '2222', name: 'Teknisi GA', role: 'STAFF', status: 'FREE', department: 'GA' }
  ];
  private notifications: Notification[] = [];

  // Simulasi current login (sementara)
  private currentUser: User | null = null;

  private ticketsDB: Ticket[] = [];

  constructor() {
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
    return this.currentUser;
  }

  // --- ENCRYPTION & STORAGE ---
  private loadFromStorage() {
    const savedTickets = localStorage.getItem('bakrie_helpdesk_tickets');
    if (savedTickets) {
      try {
        const decoded = atob(savedTickets);
        this.ticketsDB = JSON.parse(decoded);
      } catch (e) {
        try {
          this.ticketsDB = JSON.parse(savedTickets);
          this.saveToStorage();
        } catch(err) {}
      }
    }
  }

  private saveToStorage() {
    const encoded = btoa(JSON.stringify(this.ticketsDB));
    localStorage.setItem('bakrie_helpdesk_tickets', encoded);
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
  }

  markAllNotifRead() {
    this.notifications.forEach(n => n.read = true);
  }

  // --- TICKET MGT ---
  getAllTickets(): Ticket[] {
    return this.ticketsDB;
  }

  getDummyStaff() {
    return [
      { name: 'Teknisi A', status: 'FREE', load: 0, loadPercentage: 0 },
      { name: 'Teknisi B', status: 'BUSY', load: 3, loadPercentage: 60 },
      { name: 'Teknisi C', status: 'FREE', load: 1, loadPercentage: 20 }
    ];
  }

  createTicket(ticket: any) {
    const now = new Date();
    
    // SLA calculation based on priority
    let daysToAdd = 3; // Default P4
    if (ticket.priority === 'P1') daysToAdd = 0; // Today
    else if (ticket.priority === 'P2') daysToAdd = 1;
    else if (ticket.priority === 'P3') daysToAdd = 2;

    const dueDate = new Date();
    dueDate.setDate(now.getDate() + daysToAdd);

    const newTicket: Ticket = {
      ...ticket,
      id: `TKT-${now.getFullYear()}-${String(this.ticketsDB.length + 1).padStart(3, '0')}`,
      date: now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'OPEN',
      requesterId: this.currentUser?.id || 'unknown',
      requesterName: this.currentUser?.name || 'Unknown User',
      dueDate: dueDate.toISOString(),
      history: [
        {
          date: now.toLocaleString('id-ID'),
          actor: this.currentUser?.name || 'Unknown User',
          action: 'CREATED',
          notes: 'Tiket baru dibuat'
        }
      ]
    };

    this.ticketsDB.push(newTicket);
    this.saveToStorage();
    this.addNotification(`Tiket Baru: ${newTicket.id} dibuat oleh ${newTicket.requesterName}`);
  }

  updateTicketStatus(ticketId: string, newStatus: string, notes: string, assignedTo?: string) {
    const ticket = this.ticketsDB.find(t => t.id === ticketId);
    if (!ticket) return;

    ticket.status = newStatus as any;
    if (assignedTo) ticket.assignedTo = assignedTo;

    if (!ticket.history) ticket.history = [];
    
    ticket.history.push({
      date: new Date().toLocaleString('id-ID'),
      actor: this.currentUser?.name || 'System',
      action: newStatus,
      notes: notes
    });

    this.saveToStorage();
    this.addNotification(`Status Tiket ${ticketId} diubah menjadi ${newStatus}`);
  }
}
