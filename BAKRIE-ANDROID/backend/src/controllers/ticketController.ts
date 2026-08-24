import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/ticketService';
import { AppError } from '../models/middlewares/errorHandler';

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const company_id = req.user.company_id as string;

    const newTicket = await TicketService.createTicket(req.body, user_id, company_id);

    return res.status(201).json({ message: 'Ticket created successfully.', ticket: newTicket });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tickets = await TicketService.getTickets(
      req.user.company_id as string,
      req.user.id,
      req.user.role as string
    );
    return res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const ticket = await TicketService.getTicketById(id, req.user.company_id as string, req.user.id, req.user.role || 'user', req.user.department_id);
    
    return res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user_id = req.user.id;
    const company_id = req.user.company_id as string;
    const ticket = await TicketService.updateTicketStatus(id, req.body, user_id, company_id, req.user.role || 'user', req.user.department_id);

    return res.status(200).json({ message: 'Ticket status updated', ticket });
  } catch (error) {
    next(error);
  }
};

export const deleteTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await TicketService.deleteTicket(id, req.user.company_id as string, req.user.id, req.user.role || 'user');
    
    return res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const submitSurvey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user_id = req.user.id;
    const company_id = req.user.company_id as string;

    await TicketService.submitSurvey(id, req.body, user_id, company_id, req.user.role || 'user');

    return res.status(200).json({ message: 'Survey submitted successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadEvidence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticketId = req.params.id as string;
    const user_id = req.user.id;
    const company_id = req.user.company_id as string;
    
    if (!req.file) {
      throw new AppError('No file uploaded', 400, true);
    }
    
    const fileUrl = `/uploads/evidences/${req.file.filename}`;
    const fileType = req.file.mimetype;
    const description = req.body.description || '';

    await TicketService.addEvidence(ticketId, user_id, company_id, fileUrl, fileType, description, req.user.role || 'user', req.user.department_id);

    return res.status(200).json({ message: 'Evidence uploaded successfully', fileUrl });
  } catch (error) {
    next(error);
  }
};

export const getTicketReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company_id = req.user.company_id as string;
    const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;

    const reports = await TicketService.getTicketReports(company_id, month, year);
    return res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};
