import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface DepartmentAttributes {
  id: string;
  company_id: string;
  parent_id: string | null;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes> implements DepartmentAttributes {
  public id!: string;
  public company_id!: string;
  public parent_id!: string | null;
  public name!: string;
  public code!: string;
  public description!: string | null;
  public is_active!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Department.init(
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
    parent_id: {
      type: DataTypes.UUID,
      
      allowNull: true,
      
      
    },
    name: {
      type: DataTypes.STRING(255),
      
      allowNull: false,
      
      
    },
    code: {
      type: DataTypes.STRING(50),
      
      allowNull: false,
      unique: true,
      
    },
    description: {
      type: DataTypes.TEXT,
      
      allowNull: true,
      
      
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
    tableName: 'Departments',
    timestamps: true,
  }
);

export default Department;
