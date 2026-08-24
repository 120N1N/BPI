import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface NotificationAttributes {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  reference_id: string | null;
  reference_type: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: string;
  public user_id!: string;
  public title!: string;
  public message!: string;
  public is_read!: boolean;
  public reference_id!: string | null;
  public reference_type!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Notification.init(
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
    title: {
      type: DataTypes.STRING(255),
      
      allowNull: false,
      
      
    },
    message: {
      type: DataTypes.TEXT,
      
      allowNull: false,
      
      
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      
      
      
      defaultValue: false,
    },
    reference_id: {
      type: DataTypes.UUID,
      
      allowNull: true,
      
      
    },
    reference_type: {
      type: DataTypes.STRING(50),
      
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
    tableName: 'Notifications',
    timestamps: true,
  }
);

export default Notification;
