const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'models');

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Helper for generating standard model file
function generateModelCode(modelName, tableName, fields, extraImports = '') {
  return `import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
${extraImports}

export interface ${modelName}Attributes {
${fields.map(f => `  ${f.name}: ${f.tsType};`).join('\n')}
}

export interface ${modelName}CreationAttributes extends Optional<${modelName}Attributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class ${modelName} extends Model<${modelName}Attributes, ${modelName}CreationAttributes> implements ${modelName}Attributes {
${fields.map(f => `  public ${f.name}!: ${f.tsType};`).join('\n')}
}

${modelName}.init(
  {
${fields.map(f => `    ${f.name}: {
      type: ${f.dbType},
      ${f.primaryKey ? 'primaryKey: true,' : ''}
      ${f.allowNull !== undefined ? `allowNull: ${f.allowNull},` : ''}
      ${f.unique ? 'unique: true,' : ''}
      ${f.defaultValue ? `defaultValue: ${f.defaultValue},` : ''}
    }`).join(',\n')}
  },
  {
    sequelize,
    tableName: '${tableName}',
    timestamps: true,
  }
);

export default ${modelName};
`;
}

const models = [
  {
    name: 'Company',
    table: 'Companies',
    fields: [
      { name: 'id', tsType: 'string', dbType: 'DataTypes.UUID', primaryKey: true, defaultValue: 'DataTypes.UUIDV4' },
      { name: 'code', tsType: 'string', dbType: 'DataTypes.STRING(50)', allowNull: false, unique: true },
      { name: 'name', tsType: 'string', dbType: 'DataTypes.STRING(255)', allowNull: false },
      { name: 'slug', tsType: 'string', dbType: 'DataTypes.STRING(255)', allowNull: false, unique: true },
      { name: 'domain', tsType: 'string | null', dbType: 'DataTypes.STRING(255)', allowNull: true },
      { name: 'logo', tsType: 'string | null', dbType: 'DataTypes.STRING(255)', allowNull: true },
      { name: 'timezone', tsType: 'string | null', dbType: 'DataTypes.STRING(50)', defaultValue: "'Asia/Jakarta'" },
      { name: 'config', tsType: 'string | null', dbType: 'DataTypes.TEXT', defaultValue: "'{}'" },
      { name: 'is_active', tsType: 'boolean', dbType: 'DataTypes.BOOLEAN', defaultValue: 'true' },
      { name: 'createdAt', tsType: 'Date', dbType: 'DataTypes.DATE' },
      { name: 'updatedAt', tsType: 'Date', dbType: 'DataTypes.DATE' }
    ]
  },
  {
    name: 'Department',
    table: 'Departments',
    fields: [
      { name: 'id', tsType: 'string', dbType: 'DataTypes.UUID', primaryKey: true, defaultValue: 'DataTypes.UUIDV4' },
      { name: 'company_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'parent_id', tsType: 'string | null', dbType: 'DataTypes.UUID', allowNull: true },
      { name: 'name', tsType: 'string', dbType: 'DataTypes.STRING(255)', allowNull: false },
      { name: 'code', tsType: 'string', dbType: 'DataTypes.STRING(50)', allowNull: false, unique: true },
      { name: 'description', tsType: 'string | null', dbType: 'DataTypes.TEXT', allowNull: true },
      { name: 'is_active', tsType: 'boolean', dbType: 'DataTypes.BOOLEAN', defaultValue: 'true' },
      { name: 'createdAt', tsType: 'Date', dbType: 'DataTypes.DATE' },
      { name: 'updatedAt', tsType: 'Date', dbType: 'DataTypes.DATE' }
    ]
  },
  {
    name: 'User',
    table: 'Users',
    fields: [
      { name: 'id', tsType: 'string', dbType: 'DataTypes.UUID', primaryKey: true, defaultValue: 'DataTypes.UUIDV4' },
      { name: 'company_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'department_id', tsType: 'string | null', dbType: 'DataTypes.UUID', allowNull: true },
      { name: 'name', tsType: 'string', dbType: 'DataTypes.STRING(255)', allowNull: false },
      { name: 'email', tsType: 'string', dbType: 'DataTypes.STRING(255)', allowNull: false, unique: true },
      { name: 'password_hash', tsType: 'string', dbType: 'DataTypes.STRING(255)', allowNull: false },
      { name: 'is_active', tsType: 'boolean', dbType: 'DataTypes.BOOLEAN', defaultValue: 'true' },
      { name: 'createdAt', tsType: 'Date', dbType: 'DataTypes.DATE' },
      { name: 'updatedAt', tsType: 'Date', dbType: 'DataTypes.DATE' }
    ]
  },
  {
    name: 'UserRole',
    table: 'UserRoles',
    fields: [
      { name: 'id', tsType: 'string', dbType: 'DataTypes.UUID', primaryKey: true, defaultValue: 'DataTypes.UUIDV4' },
      { name: 'user_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'role', tsType: 'string', dbType: 'DataTypes.STRING(50)', allowNull: false },
      { name: 'department_id', tsType: 'string | null', dbType: 'DataTypes.UUID', allowNull: true },
      { name: 'createdAt', tsType: 'Date', dbType: 'DataTypes.DATE' },
      { name: 'updatedAt', tsType: 'Date', dbType: 'DataTypes.DATE' }
    ]
  },
  {
    name: 'Ticket',
    table: 'Tickets',
    fields: [
      { name: 'id', tsType: 'string', dbType: 'DataTypes.UUID', primaryKey: true, defaultValue: 'DataTypes.UUIDV4' },
      { name: 'ticket_code', tsType: 'string', dbType: 'DataTypes.STRING(50)', allowNull: false, unique: true },
      { name: 'title', tsType: 'string', dbType: 'DataTypes.STRING(255)', allowNull: false },
      { name: 'description', tsType: 'string', dbType: 'DataTypes.TEXT', allowNull: false },
      { name: 'category', tsType: 'string', dbType: 'DataTypes.STRING(50)', allowNull: false },
      { name: 'priority', tsType: 'string', dbType: 'DataTypes.STRING(50)', defaultValue: "'medium'" },
      { name: 'status', tsType: 'string', dbType: 'DataTypes.STRING(50)', defaultValue: "'open'" },
      { name: 'department_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'company_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'created_by', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'assigned_to', tsType: 'string | null', dbType: 'DataTypes.UUID', allowNull: true },
      { name: 'closed_at', tsType: 'Date | null', dbType: 'DataTypes.DATE', allowNull: true },
      { name: 'createdAt', tsType: 'Date', dbType: 'DataTypes.DATE' },
      { name: 'updatedAt', tsType: 'Date', dbType: 'DataTypes.DATE' }
    ]
  },
  {
    name: 'TicketHistory',
    table: 'TicketHistories',
    fields: [
      { name: 'id', tsType: 'string', dbType: 'DataTypes.UUID', primaryKey: true, defaultValue: 'DataTypes.UUIDV4' },
      { name: 'ticket_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'user_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'action', tsType: 'string', dbType: 'DataTypes.STRING(100)', allowNull: false },
      { name: 'notes', tsType: 'string | null', dbType: 'DataTypes.TEXT', allowNull: true },
      { name: 'createdAt', tsType: 'Date', dbType: 'DataTypes.DATE' },
      { name: 'updatedAt', tsType: 'Date', dbType: 'DataTypes.DATE' }
    ]
  },
  {
    name: 'TicketAssignment',
    table: 'TicketAssignments',
    fields: [
      { name: 'id', tsType: 'string', dbType: 'DataTypes.UUID', primaryKey: true, defaultValue: 'DataTypes.UUIDV4' },
      { name: 'ticket_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'assigned_by', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'assigned_to', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'notes', tsType: 'string | null', dbType: 'DataTypes.TEXT', allowNull: true },
      { name: 'createdAt', tsType: 'Date', dbType: 'DataTypes.DATE' },
      { name: 'updatedAt', tsType: 'Date', dbType: 'DataTypes.DATE' }
    ]
  },
  {
    name: 'Evidence',
    table: 'Evidences',
    fields: [
      { name: 'id', tsType: 'string', dbType: 'DataTypes.UUID', primaryKey: true, defaultValue: 'DataTypes.UUIDV4' },
      { name: 'ticket_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'uploaded_by', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'file_url', tsType: 'string', dbType: 'DataTypes.STRING(255)', allowNull: false },
      { name: 'file_type', tsType: 'string | null', dbType: 'DataTypes.STRING(50)', allowNull: true },
      { name: 'description', tsType: 'string | null', dbType: 'DataTypes.TEXT', allowNull: true },
      { name: 'createdAt', tsType: 'Date', dbType: 'DataTypes.DATE' },
      { name: 'updatedAt', tsType: 'Date', dbType: 'DataTypes.DATE' }
    ]
  },
  {
    name: 'SLA',
    table: 'SLAs',
    fields: [
      { name: 'id', tsType: 'string', dbType: 'DataTypes.UUID', primaryKey: true, defaultValue: 'DataTypes.UUIDV4' },
      { name: 'company_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'priority', tsType: 'string', dbType: 'DataTypes.STRING(50)', allowNull: false },
      { name: 'response_time_minutes', tsType: 'number', dbType: 'DataTypes.INTEGER', allowNull: false },
      { name: 'resolution_time_minutes', tsType: 'number', dbType: 'DataTypes.INTEGER', allowNull: false },
      { name: 'createdAt', tsType: 'Date', dbType: 'DataTypes.DATE' },
      { name: 'updatedAt', tsType: 'Date', dbType: 'DataTypes.DATE' }
    ]
  },
  {
    name: 'Survey',
    table: 'Surveys',
    fields: [
      { name: 'id', tsType: 'string', dbType: 'DataTypes.UUID', primaryKey: true, defaultValue: 'DataTypes.UUIDV4' },
      { name: 'ticket_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'user_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'rating', tsType: 'number', dbType: 'DataTypes.INTEGER', allowNull: false },
      { name: 'comments', tsType: 'string | null', dbType: 'DataTypes.TEXT', allowNull: true },
      { name: 'createdAt', tsType: 'Date', dbType: 'DataTypes.DATE' },
      { name: 'updatedAt', tsType: 'Date', dbType: 'DataTypes.DATE' }
    ]
  },
  {
    name: 'Notification',
    table: 'Notifications',
    fields: [
      { name: 'id', tsType: 'string', dbType: 'DataTypes.UUID', primaryKey: true, defaultValue: 'DataTypes.UUIDV4' },
      { name: 'user_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'title', tsType: 'string', dbType: 'DataTypes.STRING(255)', allowNull: false },
      { name: 'message', tsType: 'string', dbType: 'DataTypes.TEXT', allowNull: false },
      { name: 'is_read', tsType: 'boolean', dbType: 'DataTypes.BOOLEAN', defaultValue: 'false' },
      { name: 'reference_id', tsType: 'string | null', dbType: 'DataTypes.UUID', allowNull: true },
      { name: 'reference_type', tsType: 'string | null', dbType: 'DataTypes.STRING(50)', allowNull: true },
      { name: 'createdAt', tsType: 'Date', dbType: 'DataTypes.DATE' },
      { name: 'updatedAt', tsType: 'Date', dbType: 'DataTypes.DATE' }
    ]
  },
  {
    name: 'AuditLog',
    table: 'AuditLogs',
    fields: [
      { name: 'id', tsType: 'string', dbType: 'DataTypes.UUID', primaryKey: true, defaultValue: 'DataTypes.UUIDV4' },
      { name: 'user_id', tsType: 'string', dbType: 'DataTypes.UUID', allowNull: false },
      { name: 'action', tsType: 'string', dbType: 'DataTypes.STRING(255)', allowNull: false },
      { name: 'ip_address', tsType: 'string | null', dbType: 'DataTypes.STRING(50)', allowNull: true },
      { name: 'details', tsType: 'string | null', dbType: 'DataTypes.TEXT', allowNull: true },
      { name: 'createdAt', tsType: 'Date', dbType: 'DataTypes.DATE' },
      { name: 'updatedAt', tsType: 'Date', dbType: 'DataTypes.DATE' }
    ]
  }
];

models.forEach(m => {
  const code = generateModelCode(m.name, m.table, m.fields);
  fs.writeFileSync(path.join(modelsDir, `${m.name}.ts`), code);
  console.log(`Generated model ${m.name}`);
});

// Generate index.ts
const indexCode = `import sequelize from '../config/database';

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
`;
fs.writeFileSync(path.join(modelsDir, 'index.ts'), indexCode);
console.log('Generated index.ts');
