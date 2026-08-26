import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface EvidenceAttributes {
  id: string;
  ticket_id: string;
  uploaded_by: string;
  file_url: string;
  file_type: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvidenceCreationAttributes extends Optional<EvidenceAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Evidence extends Model<EvidenceAttributes, EvidenceCreationAttributes> implements EvidenceAttributes {
  public id!: string;
  public ticket_id!: string;
  public uploaded_by!: string;
  public file_url!: string;
  public file_type!: string | null;
  public description!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Evidence.init(
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
    uploaded_by: {
      type: DataTypes.UUID,
      
      allowNull: false,
      
      
    },
    file_url: {
      type: DataTypes.STRING(255),
      
      allowNull: false,
      
      
    },
    file_type: {
      type: DataTypes.STRING(50),
      
      allowNull: true,
      
      
    },
    description: {
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
    tableName: 'TicketEvidences',
    timestamps: true,
  }
);

export default Evidence;
