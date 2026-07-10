import { DataTypes, Sequelize } from 'sequelize';
import { UserStatic } from '@/interfaces/user';
import sequelizeInstance from '@/libs/sequelize';

const UserModel = function (sequelize: Sequelize): UserStatic {
  const User = <UserStatic>sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: '',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Date.now(),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Date.now(),
    },
  });

  return User;
};

export default UserModel(sequelizeInstance);
