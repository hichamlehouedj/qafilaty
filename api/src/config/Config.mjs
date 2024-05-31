import dotenv from 'dotenv'
dotenv.config();

export default {
  mode: process.env.NODE_ENV,
  development: {
    username: process.env.DB_DEV_USERNAME,
    password: process.env.DB_DEV_PASSWORD,
    database: process.env.DB_DEV_DATABASE,
    logging: process.env.SQ_LOGGING
  },
  production: {
    username: process.env.DB_PRO_USERNAME,
    password: process.env.DB_PRO_USERNAME,
    database: process.env.DB_PRO_USERNAME,
    logging: false
  }
}