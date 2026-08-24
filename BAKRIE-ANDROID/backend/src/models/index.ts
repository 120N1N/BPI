import sequelize from '../config/database';

import Company from './Company';
import Department from './Department';
import User from './User';
import UserRole from './UserRole';
import Ticket from './Ticket';
import TicketHistory from './TicketHistory';
import TicketAssignment from './TicketAssignment';
import Evidence from './Evidence';
import SLA from './SLA';
import Survey from './Survey';
import Notification from './Notification';
import AuditLog from './AuditLog';

// Setup Associations
Company.hasMany(Department, { foreignKey: 'company_id', as: 'departments', onDelete: 'NO ACTION' });
Department.belongsTo(Company, { foreignKey: 'company_id', as: 'company', onDelete: 'NO ACTION' });

Company.hasMany(User, { foreignKey: 'company_id', as: 'users', onDelete: 'NO ACTION' });
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company', onDelete: 'NO ACTION' });

Department.hasMany(User, { foreignKey: 'department_id', as: 'users', onDelete: 'NO ACTION' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department', onDelete: 'NO ACTION' });

User.hasMany(UserRole, { foreignKey: 'user_id', as: 'roles', onDelete: 'NO ACTION' });
UserRole.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'NO ACTION' });

Department.hasMany(UserRole, { foreignKey: 'department_id', as: 'departmentRoles', onDelete: 'NO ACTION' });
UserRole.belongsTo(Department, { foreignKey: 'department_id', as: 'department', onDelete: 'NO ACTION' });

// Ticket Associations
Ticket.belongsTo(User, { foreignKey: 'created_by', as: 'creator', onDelete: 'NO ACTION' });
Ticket.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee', onDelete: 'NO ACTION' });
Ticket.belongsTo(Department, { foreignKey: 'department_id', as: 'department', onDelete: 'NO ACTION' });
Ticket.belongsTo(Company, { foreignKey: 'company_id', as: 'company', onDelete: 'NO ACTION' });

Ticket.hasMany(TicketHistory, { foreignKey: 'ticket_id', as: 'histories', onDelete: 'NO ACTION' });
TicketHistory.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket', onDelete: 'NO ACTION' });
TicketHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'NO ACTION' });

Ticket.hasMany(Evidence, { foreignKey: 'ticket_id', as: 'evidences', onDelete: 'NO ACTION' });
Evidence.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket', onDelete: 'NO ACTION' });

Ticket.hasOne(Survey, { foreignKey: 'ticket_id', as: 'survey', onDelete: 'NO ACTION' });
Survey.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket', onDelete: 'NO ACTION' });

export {
  sequelize,
  Company,
  Department,
  User,
  UserRole,
  Ticket,
  TicketHistory,
  TicketAssignment,
  Evidence,
  SLA,
  Survey,
  Notification,
  AuditLog
};
