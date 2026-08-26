import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface TicketAttributes {
  id: string;
  ticket_code: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  department_id: string;
  company_id: string;
  created_by: string;
  assigned_to: string | null;
  closed_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketCreationAttributes extends Optional<TicketAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
  public id!: string;
  public ticket_code!: string;
  public title!: string;
  public description!: string;
  public category!: string;
  public priority!: string;
  public status!: string;
  public department_id!: string;
  public company_id!: string;
  public created_by!: string;
  public assigned_to!: string | null;
  public closed_at!: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Ticket.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      
      
      defaultValue: DataTypes.UUIDV4,
    },
    ticket_code: {
      type: DataTypes.STRING(50),
      
      allowNull: false,
      unique: true,
      
    },
    title: {
      type: DataTypes.STRING(255),
      
      allowNull: false,
      
      
    },
    description: {
      type: DataTypes.TEXT,
      
      allowNull: false,
      
      
    },
    category: {
      type: DataTypes.STRING(50),
      
      allowNull: false,
      
      
    },
    priority: {
      type: DataTypes.STRING(50),
      
      
      
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.STRING(50),
      
      
      
      defaultValue: 'open',
    },
    department_id: {
      type: DataTypes.UUID,
      
      allowNull: false,
      
      
    },
    company_id: {
      type: DataTypes.UUID,
      
      allowNull: false,
      
      
    },
    created_by: {
      type: DataTypes.UUID,
      
      allowNull: false,
      
      
    },
    assigned_to: {
      type: DataTypes.UUID,
      
      allowNull: true,
      
      
    },
    closed_at: {
      type: DataTypes.DATE,
      
      allowNull: true,
      
      
    },
    createdAt: {
      type: DataTypes.DATE,
      
      
      
      
    },
    updatedAt: {
      type: DataTypes.DATE,
      
      
      
      
    }
  },
  {
    sequelize,
    tableName: 'Tickets',
    timestamps: true,
  }
);

export default Ticket;
