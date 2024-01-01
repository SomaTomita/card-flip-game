import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize('main', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});