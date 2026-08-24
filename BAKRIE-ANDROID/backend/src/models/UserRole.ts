import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface UserRoleAttributes {
  id: string;
  user_id: string;
  role: string;
  department_id: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleCreationAttributes extends Optional<UserRoleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class UserRole extends Model<UserRoleAttributes, UserRoleCreationAttributes> implements UserRoleAttributes {
  public id!: string;
  public user_id!: string;
  public role!: string;
  public department_id!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

UserRole.init(
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
    role: {
      type: DataTypes.STRING(50),
      
      allowNull: false,
      
      
    },
    department_id: {
      type: DataTypes.UUID,
      
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
    tableName: 'UserRoles',
    timestamps: true,
  }
);

export default UserRole;
