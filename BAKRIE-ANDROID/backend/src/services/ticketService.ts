import { Ticket, TicketHistory, Department, User, Survey, Evidence } from '../models';
import { AppError } from '../models/middlewares/errorHandler';
import sequelize from '../config/database';
import crypto from 'crypto';

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

    const randomHash = crypto.randomBytes(4).toString('hex').toUpperCase();
    const ticketCode = `TKT-${new Date().getFullYear()}-${randomHash}`;

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

    // Database Transaction
    return await sequelize.transaction(async (t) => {
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
      } as any, { transaction: t });

      await TicketHistory.create({
        ticket_id: newTicket.id,
        user_id: userId,
        action: 'CREATED',
        notes: JSON.stringify({ old_status: null, new_status: 'OPEN', details: 'Ticket created' })
      }, { transaction: t });

      return newTicket;
    });
  }

  static async getTickets(companyId: string, userId: string, role: string | string[]) {
    const whereClause: any = { company_id: companyId };
    
    const roles = Array.isArray(role) ? role : [role];
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

  static async getTicketById(ticketId: string, companyId: string, userId: string, role: string | string[], departmentId?: string) {
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

    // Authorization Check
    const roles = Array.isArray(role) ? role : [role];
    const isAdmin = roles.includes('admin');
    
    if (!isAdmin) {
      if (roles.includes('admin_dept') || roles.includes('staff')) {
        // Staff/AdminDept can only see their department's tickets or tickets assigned to them, OR their own created tickets
        if (ticket.department_id !== departmentId && ticket.assigned_to !== userId && ticket.created_by !== userId) {
          throw new AppError('Unauthorized access to ticket from another department', 403, true);
        }
      } else {
        // Normal user can only see their own tickets
        if (ticket.created_by !== userId) {
          throw new AppError('Unauthorized access to this ticket', 403, true);
        }
      }
    }

    return ticket;
  }

  static async updateTicketStatus(ticketId: string, data: UpdateTicketStatusDTO, userId: string, companyId: string, role: string | string[], departmentId?: string) {
    const { status, notes, assigned_to, forward_dept } = data;

    return await sequelize.transaction(async (t) => {
      const ticket = await Ticket.findOne({ where: { id: ticketId, company_id: companyId }, transaction: t });
      if (!ticket) throw new AppError('Ticket not found', 404, true);

      // Auth Check
      const roles = Array.isArray(role) ? role : [role];
      const isAdminOrStaff = roles.some(r => ['admin', 'staff', 'admin_dept'].includes(r));
      if (!isAdminOrStaff && ticket.created_by !== userId) {
        throw new AppError('Unauthorized', 403, true);
      }

      const oldStatus = ticket.status;
      const newStatus = status.toUpperCase();
      
      // State Machine for Status Transition
      const validTransitions: Record<string, string[]> = {
        'OPEN': ['ASSIGNED', 'CLOSED'],
        'ASSIGNED': ['IN_PROGRESS', 'CLOSED', 'OPEN'],
        'IN_PROGRESS': ['PENDING_APPROVAL', 'CLOSED', 'ASSIGNED'],
        'PENDING_APPROVAL': ['APPROVED', 'IN_PROGRESS', 'CLOSED'],
        'APPROVED': ['CLOSED'],
        'CLOSED': [] // Cannot transition out of closed
      };

      if (!validTransitions[oldStatus]?.includes(newStatus) && oldStatus !== newStatus) {
        throw new AppError(`Invalid status transition from ${oldStatus} to ${newStatus}`, 400, true);
      }

      ticket.status = newStatus;

      if (assigned_to) {
        let assigneeId = assigned_to;
        if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(assigned_to)) {
          const { Op } = require('sequelize');
          const userStaff = await User.findOne({ 
            where: { [Op.or]: [{ name: assigned_to }, { email: assigned_to }], company_id: companyId },
            transaction: t
          });
          if (userStaff) assigneeId = userStaff.get('id');
          else throw new AppError(`Teknisi dengan nama/email '${assigned_to}' tidak ditemukan.`, 400, true);
        }
        ticket.assigned_to = assigneeId;
      }

      if (forward_dept) {
        const dept = await Department.findOne({ where: { name: forward_dept, company_id: companyId }, transaction: t });
        if (dept) {
          ticket.department_id = dept.get('id');
          ticket.assigned_to = null;
        }
      }

      if (ticket.status === 'CLOSED' && oldStatus !== 'CLOSED') {
        ticket.closed_at = new Date();
      }

      await ticket.save({ transaction: t });

      await TicketHistory.create({
        ticket_id: ticket.id,
        user_id: userId,
        action: `STATUS_CHANGED_${ticket.status}`,
        notes: JSON.stringify({ old_status: oldStatus, new_status: ticket.status, notes })
      }, { transaction: t });

      return ticket;
    });
  }

  static async deleteTicket(ticketId: string, companyId: string, userId: string, role: string | string[]) {
    return await sequelize.transaction(async (t) => {
      const ticket = await Ticket.findOne({ where: { id: ticketId, company_id: companyId }, transaction: t });
      if (!ticket) throw new AppError('Ticket not found', 404, true);

      const roles = Array.isArray(role) ? role : [role];
      if (!roles.includes('admin') && ticket.created_by !== userId) {
         throw new AppError('Unauthorized to delete ticket', 403, true);
      }

      await TicketHistory.destroy({ where: { ticket_id: ticketId }, transaction: t });
      await ticket.destroy({ transaction: t });
      return true;
    });
  }

  static async submitSurvey(ticketId: string, data: SubmitSurveyDTO, userId: string, companyId: string, role: string | string[]) {
    const { rating, feedback } = data;

    return await sequelize.transaction(async (t) => {
      const ticket = await Ticket.findOne({ where: { id: ticketId, company_id: companyId }, transaction: t });
      if (!ticket) throw new AppError('Ticket not found', 404, true);
      
      if (ticket.created_by !== userId) {
        throw new AppError('Only the ticket creator can submit a survey', 403, true);
      }

      const oldStatus = ticket.status;
      ticket.status = 'CLOSED';
      ticket.closed_at = new Date();
      await ticket.save({ transaction: t });

      await Survey.create({
        ticket_id: ticketId,
        user_id: userId,
        rating,
        comments: feedback
      }, { transaction: t });

      await TicketHistory.create({
        ticket_id: ticketId,
        user_id: userId,
        action: 'SURVEY_SUBMITTED',
        notes: JSON.stringify({ rating, feedback, old_status: oldStatus, new_status: 'CLOSED' })
      }, { transaction: t });

      return ticket;
    });
  }

  static async addEvidence(ticketId: string, userId: string, companyId: string, fileUrl: string, fileType: string, description: string, role: string | string[], departmentId?: string) {
    return await sequelize.transaction(async (t) => {
      const ticket = await Ticket.findOne({ where: { id: ticketId, company_id: companyId }, transaction: t });
      if (!ticket) throw new AppError('Ticket not found', 404, true);

      // Auth Check
      const roles = Array.isArray(role) ? role : [role];
      const isAdminOrStaff = roles.some(r => ['admin', 'staff', 'admin_dept'].includes(r));
      if (!isAdminOrStaff && ticket.created_by !== userId) {
        throw new AppError('Unauthorized', 403, true);
      }

      await Evidence.create({
        ticket_id: ticketId,
        uploaded_by: userId,
        file_url: fileUrl,
        file_type: fileType,
        description: description
      }, { transaction: t });

      await TicketHistory.create({
        ticket_id: ticketId,
        user_id: userId,
        action: 'EVIDENCE_UPLOADED',
        notes: JSON.stringify({ fileUrl, fileType, description })
      }, { transaction: t });

      return true;
    });
  }

  static async getTicketReports(companyId: string, queryMonth?: number, queryYear?: number) {
    const { Op } = require('sequelize');
    
    const now = new Date();
    const targetYear = queryYear || now.getFullYear();
    const targetMonth = queryMonth !== undefined && queryMonth !== null ? queryMonth : now.getMonth() + 1;

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 1);
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear + 1, 0, 1);

    const dailyCount = await Ticket.count({ where: { company_id: companyId, createdAt: { [Op.gte]: startOfDay } } });
    const monthlyCount = await Ticket.count({ where: { company_id: companyId, createdAt: { [Op.gte]: startOfMonth, [Op.lt]: endOfMonth } } });
    const yearlyCount = await Ticket.count({ where: { company_id: companyId, createdAt: { [Op.gte]: startOfYear, [Op.lt]: endOfYear } } });
    const totalCount = await Ticket.count({ where: { company_id: companyId } });

    const statusCountsRaw = await Ticket.findAll({
      where: { 
        company_id: companyId,
        createdAt: { [Op.gte]: startOfMonth, [Op.lt]: endOfMonth }
      },
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    });

    const statusCounts = statusCountsRaw.map((s: any) => ({
      status: s.status,
      count: parseInt(s.count, 10) || 0
    }));

    return {
      summary: { daily: dailyCount, monthly: monthlyCount, yearly: yearlyCount, total: totalCount },
      byStatus: statusCounts
    };
  }
}
