import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface SurveyAttributes {
  id: string;
  ticket_id: string;
  user_id: string;
  rating: number;
  comments: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyCreationAttributes extends Optional<SurveyAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Survey extends Model<SurveyAttributes, SurveyCreationAttributes> implements SurveyAttributes {
  public id!: string;
  public ticket_id!: string;
  public user_id!: string;
  public rating!: number;
  public comments!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Survey.init(
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
    rating: {
      type: DataTypes.INTEGER,
      
      allowNull: false,
      
      
    },
    comments: {
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
    tableName: 'TicketSurveys',
    timestamps: true,
  }
);

export default Survey;
