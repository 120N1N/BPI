import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface TicketHistoryAttributes {
  id: string;
  ticket_id: string;
  user_id: string;
  action: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketHistoryCreationAttributes extends Optional<TicketHistoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class TicketHistory extends Model<TicketHistoryAttributes, TicketHistoryCreationAttributes> implements TicketHistoryAttributes {
  public id!: string;
  public ticket_id!: string;
  public user_id!: string;
  public action!: string;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

TicketHistory.init(
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
    user_id: {
      type: DataTypes.UUID,
      
      allowNull: false,
      
      
    },
    action: {
      type: DataTypes.STRING(100),
      
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
    tableName: 'TicketHistories',
    timestamps: true,
  }
);

export default TicketHistory;
