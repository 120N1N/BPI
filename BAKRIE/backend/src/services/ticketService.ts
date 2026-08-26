import { Ticket, TicketHistory, Department, User, Survey } from '../models';
import { AppError } from '../models/middlewares/errorHandler';

// DTOs (Data Transfer Objects)
export interface CreateTicketDTO {
  title: string;
  description: string;
  category: string;
  priority?: string;
  department_name?: string;
}

export interface UpdateTicketStatusDTO {
  status: string;
  notes?: string;
  assigned_to?: string;
  forward_dept?: string;
}

export interface SubmitSurveyDTO {
  rating: number;
  feedback?: string;
}

export class TicketService {

  static async createTicket(data: CreateTicketDTO, userId: string, companyId: string) {
    const { title, description, category, priority, department_name } = data;

    // Generate Ticket Code (Concurrency Safe-ish for now)
    const count = await Ticket.count({ where: { company_id: companyId } });
    const randomHash = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketCode = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}-${randomHash}`;

    // Lookup valid department ID based on string name
    let targetDeptId = null;
    if (department_name) {
      const dept = await Department.findOne({ where: { name: department_name, company_id: companyId } });
      if (dept) {
        targetDeptId = dept.get('id');
      } else {
        throw new AppError(`Department '${department_name}' not found.`, 404, true);
      }
    }

    if (!targetDeptId) {
      throw new AppError('A valid department_name must be provided.', 400, true);
    }

    const newTicket = await Ticket.create({
      ticket_code: ticketCode,
      title,
      description,
      category,
      priority: priority || 'medium',
      status: 'OPEN',
      department_id: targetDeptId,
      company_id: companyId,
      created_by: userId
    } as any);

    await TicketHistory.create({
      ticket_id: newTicket.id,
      user_id: userId,
      action: 'CREATED',
      notes: 'Tiket baru dibuat oleh pengguna.'
    });

    return newTicket;
  }

  static async getTickets(companyId: string, userId: string, role: string | string[]) {
    const whereClause: any = { company_id: companyId };
    
    // Convert role to array if it's not already
    const roles = Array.isArray(role) ? role : [role];
    
    // Jika role HANYA 'user' atau role ini tidak punya akses admin/staff, maka filter tiket
    const isAdminOrStaff = roles.some(r => ['admin', 'staff', 'admin_dept'].includes(r));
    
    if (!isAdminOrStaff) {
      whereClause.created_by = userId;
    }
    
    return Ticket.findAll({
      where: whereClause,
      include: [
        { model: Department, as: 'department', attributes: ['name', 'code'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Survey, as: 'survey', attributes: ['rating'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  static async getTicketById(ticketId: string, companyId: string) {
    const ticket = await Ticket.findOne({
      where: { id: ticketId, company_id: companyId },
      include: [
        { model: Department, as: 'department', attributes: ['name', 'code'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] },
        { model: User, as: 'assignee', attributes: ['name', 'email'] },
        { model: TicketHistory, as: 'histories', include: [{ model: User, as: 'user', attributes: ['name'] }] },
        { model: Survey, as: 'survey', attributes: ['rating'] }
      ]
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404, true);
    }
    return ticket;
  }

  static async updateTicketStatus(ticketId: string, data: UpdateTicketStatusDTO, userId: string, companyId: string) {
    const { status, notes, assigned_to, forward_dept } = data;

    const ticket = await Ticket.findOne({ where: { id: ticketId, company_id: companyId } });
    if (!ticket) {
      throw new AppError('Ticket not found', 404, true);
    }

    const oldStatus = ticket.status;
    ticket.status = status.toUpperCase();

    if (assigned_to) {
      let assigneeId = assigned_to;
      // Handle non-UUID (names)
      if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(assigned_to)) {
        const { Op } = require('sequelize');
        const userStaff = await User.findOne({ 
          where: { 
            [Op.or]: [{ name: assigned_to }, { email: assigned_to }], 
            company_id: companyId 
          } 
        });
        if (userStaff) assigneeId = userStaff.get('id');
      }
      ticket.assigned_to = assigneeId;
    }

    // Feature: Forward Department Logic
    if (forward_dept) {
      const dept = await Department.findOne({ where: { name: forward_dept, company_id: companyId } });
      if (dept) {
        ticket.department_id = dept.get('id');
        ticket.assigned_to = null;
      }
    }

    if (ticket.status === 'CLOSED') {
      ticket.closed_at = new Date();
    }

    await ticket.save();

    await TicketHistory.create({
      ticket_id: ticket.id,
      user_id: userId,
      action: `STATUS_CHANGED_${ticket.status}`,
      notes: notes || `Status changed from ${oldStatus} to ${ticket.status}`
    });

    return ticket;
  }

  static async deleteTicket(ticketId: string, companyId: string) {
    const ticket = await Ticket.findOne({ where: { id: ticketId, company_id: companyId } });
    if (!ticket) {
      throw new AppError('Ticket not found', 404, true);
    }

    await TicketHistory.destroy({ where: { ticket_id: ticketId } });
    await ticket.destroy();
    return true;
  }

  static async submitSurvey(ticketId: string, data: SubmitSurveyDTO, userId: string, companyId: string) {
    const { rating, feedback } = data;

    const ticket = await Ticket.findOne({ where: { id: ticketId, company_id: companyId } });
    if (!ticket) {
      throw new AppError('Ticket not found', 404, true);
    }

    ticket.status = 'CLOSED';
    ticket.closed_at = new Date();
    await ticket.save();

    await Survey.create({
      ticket_id: ticketId,
      user_id: userId,
      rating,
      comments: feedback
    });

    await TicketHistory.create({
      ticket_id: ticketId,
      user_id: userId,
      action: 'SURVEY_SUBMITTED',
      notes: `Survey Rating: ${rating} - Feedback: ${feedback || ''}`
    });

    return ticket;
  }
  static async addEvidence(ticketId: string, userId: string, companyId: string, fileUrl: string, fileType: string, description: string) {
    const ticket = await Ticket.findOne({ where: { id: ticketId, company_id: companyId } });
    if (!ticket) {
      throw new AppError('Ticket not found', 404, true);
    }

    // We already import Evidence
    await Evidence.create({
      ticket_id: ticketId,
      uploaded_by: userId,
      file_url: fileUrl,
      file_type: fileType,
      description: description
    });

    await TicketHistory.create({
      ticket_id: ticketId,
      user_id: userId,
      action: 'EVIDENCE_UPLOADED',
      notes: `Bukti/Dokumen ditambahkan: ${description || fileUrl}`
    });

    return true;
  }
}
