import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface SLAAttributes {
  id: string;
  company_id: string;
  priority: string;
  response_time_minutes: number;
  resolution_time_minutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SLACreationAttributes extends Optional<SLAAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class SLA extends Model<SLAAttributes, SLACreationAttributes> implements SLAAttributes {
  public id!: string;
  public company_id!: string;
  public priority!: string;
  public response_time_minutes!: number;
  public resolution_time_minutes!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

SLA.init(
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
    priority: {
      type: DataTypes.STRING(50),
      
      allowNull: false,
      
      
    },
    response_time_minutes: {
      type: DataTypes.INTEGER,
      
      allowNull: false,
      
      
    },
    resolution_time_minutes: {
      type: DataTypes.INTEGER,
      
      allowNull: false,
      
      
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
    tableName: 'SLAs',
    timestamps: true,
  }
);

export default SLA;
