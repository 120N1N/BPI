import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface CompanyAttributes {
  id: string;
  code: string;
  name: string;
  slug: string;
  domain: string | null;
  logo: string | null;
  timezone: string | null;
  config: string | null;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
  public id!: string;
  public code!: string;
  public name!: string;
  public slug!: string;
  public domain!: string | null;
  public logo!: string | null;
  public timezone!: string | null;
  public config!: string | null;
  public is_active!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      
      
      defaultValue: DataTypes.UUIDV4,
    },
    code: {
      type: DataTypes.STRING(50),
      
      allowNull: false,
      unique: true,
      
    },
    name: {
      type: DataTypes.STRING(255),
      
      allowNull: false,
      
      
    },
    slug: {
      type: DataTypes.STRING(255),
      
      allowNull: false,
      unique: true,
      
    },
    domain: {
      type: DataTypes.STRING(255),
      
      allowNull: true,
      
      
    },
    logo: {
      type: DataTypes.STRING(255),
      
      allowNull: true,
      
      
    },
    timezone: {
      type: DataTypes.STRING(50),
      
      
      
      defaultValue: 'Asia/Jakarta',
    },
    config: {
      type: DataTypes.TEXT,
      
      
      
      defaultValue: '{}',
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
    tableName: 'Companies',
    timestamps: true,
  }
);

export default Company;
