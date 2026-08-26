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
Company.hasMany(Department, { foreignKey: 'company_id', as: 'departments' });
Department.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Department.hasMany(User, { foreignKey: 'department_id', as: 'users' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

User.hasMany(UserRole, { foreignKey: 'user_id', as: 'roles' });
UserRole.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Department.hasMany(UserRole, { foreignKey: 'department_id', as: 'departmentRoles' });
UserRole.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Ticket Associations
Ticket.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Ticket.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
Ticket.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Ticket.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Ticket.hasMany(TicketHistory, { foreignKey: 'ticket_id', as: 'histories' });
TicketHistory.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
TicketHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Ticket.hasMany(Evidence, { foreignKey: 'ticket_id', as: 'evidences' });
Evidence.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

Ticket.hasOne(Survey, { foreignKey: 'ticket_id', as: 'survey' });
Survey.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

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
