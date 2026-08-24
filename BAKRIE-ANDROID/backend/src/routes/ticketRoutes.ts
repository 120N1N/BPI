import { Router } from 'express';
import { createTicket, getTickets, getTicketById, updateTicketStatus, getTicketReports } from '../controllers/ticketController';
import { authenticate } from '../models/middlewares/authMiddleware';
import { authorizeRole } from '../models/middlewares/roleMiddleware';

const router = Router();

// All ticket routes require authentication
router.use(authenticate);

// List and Create
import { ticketCreationLimiter } from '../models/middlewares/rateLimiter';

router.get('/', getTickets);
router.post('/', ticketCreationLimiter, createTicket);

// Reports
router.get('/reports/analytics', authorizeRole(['admin_dept', 'admin']), getTicketReports);

// Detail
router.get('/:id', getTicketById);

// Update status (e.g. staff or admin only)
router.put('/:id/status', authorizeRole(['admin_dept', 'staff', 'admin', 'user']), updateTicketStatus);

// Survey (user only)
import { submitSurvey, deleteTicket, uploadEvidence } from '../controllers/ticketController';
import { upload } from '../models/middlewares/uploadMiddleware';

router.post('/:id/evidence', authenticate, authorizeRole(['admin_dept', 'staff', 'admin']), upload.single('evidenceFile'), uploadEvidence);

router.post('/:id/survey', authenticate, submitSurvey);

// Delete Ticket
router.delete('/:id', authorizeRole(['admin', 'admin_dept', 'staff', 'user']), deleteTicket);

export default router;
