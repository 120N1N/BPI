import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface AuditLogAttributes {
  id: string;
  user_id: string;
  action: string;
  ip_address: string | null;
  details: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: string;
  public user_id!: string;
  public action!: string;
  public ip_address!: string | null;
  public details!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      
      
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      
      allowNull: false,
      
      
    },
    action: {
      type: DataTypes.STRING(255),
      
      allowNull: false,
      
      
    },
    ip_address: {
      type: DataTypes.STRING(50),
      
      allowNull: true,
      
      
    },
    details: {
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
    tableName: 'AuditLogs',
    timestamps: true,
  }
);

export default AuditLog;
