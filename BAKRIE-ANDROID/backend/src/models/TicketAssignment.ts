import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface TicketAssignmentAttributes {
  id: string;
  ticket_id: string;
  assigned_by: string;
  assigned_to: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketAssignmentCreationAttributes extends Optional<TicketAssignmentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class TicketAssignment extends Model<TicketAssignmentAttributes, TicketAssignmentCreationAttributes> implements TicketAssignmentAttributes {
  public id!: string;
  public ticket_id!: string;
  public assigned_by!: string;
  public assigned_to!: string;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

TicketAssignment.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      
      
      defaultValue: DataTypes.UUIDV4,
    },
    ticket_id: {
      type: DataTypes.UUID,
      
      allowNull: false,
      
      
    },
    assigned_by: {
      type: DataTypes.UUID,
      
      allowNull: false,
      
      
    },
    assigned_to: {
      type: DataTypes.UUID,
      
      allowNull: false,
      
      
    },
    notes: {
      type: DataTypes.TEXT,
      
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
    tableName: 'TicketAssignments',
    timestamps: true,
  }
);

export default TicketAssignment;
