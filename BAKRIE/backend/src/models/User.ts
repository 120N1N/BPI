import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface UserAttributes {
  id: string;
  company_id: string;
  department_id: string | null;
  name: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public company_id!: string;
  public department_id!: string | null;
  public name!: string;
  public email!: string;
  public password_hash!: string;
  public is_active!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      
      
      defaultValue: DataTypes.UUIDV4,
    },
    company_id: {
      type: DataTypes.UUID,
      
      allowNull: false,
      
      
    },
    department_id: {
      type: DataTypes.UUID,
      
      allowNull: true,
      
      
    },
    name: {
      type: DataTypes.STRING(255),
      
      allowNull: false,
      
      
    },
    email: {
      type: DataTypes.STRING(255),
      
      allowNull: false,
      unique: true,
      
    },
    password_hash: {
      type: DataTypes.STRING(255),
      
      allowNull: false,
      
      
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      
      
      
      defaultValue: true,
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
    tableName: 'Users',
    timestamps: true,
  }
);

export default User;
