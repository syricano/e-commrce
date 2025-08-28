import Sequelize from 'sequelize';

const databaseUrl = process.env.DATABASE_URL || process.env.DB_URL;
const sqlLogging = process.env.SQL_LOG === '1' ? console.log : false;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: sqlLogging,
});

export default sequelize;
