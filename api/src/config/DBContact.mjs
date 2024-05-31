import Sequelize from 'sequelize';
import Config from './Config.mjs';

const connectInfo = {
    database: Config.mode === "production" ? Config.production.database : Config.development.database,
    username: Config.mode === "production" ? Config.production.username : Config.development.username,
    password: Config.mode === "production" ? Config.production.password : Config.development.password,
}

export default new Sequelize(
    connectInfo.database,
    connectInfo.username,
    connectInfo.password,
    {
        host: 'localhost',
        dialect: 'mysql',
        timezone: "+01:00",
        benchmark: true,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        logging: Config.development.logging === "true" ? (msg, time) => console.log({query : msg, time: `${time} ms`}) : false,
    }
);