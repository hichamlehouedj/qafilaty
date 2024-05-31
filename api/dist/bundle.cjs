'use strict';

var express = require('express');
var cors = require('cors');
var helmet = require('helmet');
var cookieParser = require('cookie-parser');
var depthLimit = require('graphql-depth-limit');
var path = require('path');
var url = require('url');
var requestIp = require('request-ip');
var apolloServerExpress = require('apollo-server-express');
var apolloServerCore = require('apollo-server-core');
var http = require('http');
var expressUseragent = require('express-useragent');
var Sequelize = require('sequelize');
var dotenv = require('dotenv');
var jwt = require('jsonwebtoken');
var graphql = require('graphql');
var schema$3 = require('@graphql-tools/schema');
var dateFns = require('date-fns');
var utils = require('@graphql-tools/utils');
var Joi = require('joi');
var winston = require('winston');
var Transport = require('winston-transport');
var sgMail = require('@sendgrid/mail');
var bcrypt = require('bcryptjs');
var lodash = require('lodash');
var rateLimiterFlexible = require('rate-limiter-flexible');
var fs = require('fs');
var graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.mjs');
var socket_io = require('socket.io');
var RandToken = require('rand-token');
var uuid = require('uuid');
var GraphQLUpload = require('graphql-upload/GraphQLUpload.mjs');

dotenv.config();

var Config = {
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
};

const connectInfo = {
    database: Config.mode === "production" ? Config.production.database : Config.development.database,
    username: Config.mode === "production" ? Config.production.username : Config.development.username,
    password: Config.mode === "production" ? Config.production.password : Config.development.password,
};

var DB = new Sequelize(
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

var companyModel = (db, types) => {
	return db.define('company', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: types.STRING(30),
            allowNull: false
        },
        logo: {
            type: types.STRING(255),
            allowNull: false
        },
        phone01: {
            type: types.STRING(15),
            allowNull: false,
        },
        phone02: {
            type: types.STRING(15),
            allowNull: false
        },
        email: {
            type: types.STRING(50),
            allowNull: false,
            //validate: {isEmail: true}
        },
        url_site: {
            type: types.STRING(255),
            allowNull: false
        },
        city: {
            type: types.STRING(50),
            allowNull: false
        },
        address: {
            type: types.STRING(100),
            allowNull: false
        },
        points: {
            type: types.INTEGER,
            defaultValue: 25,
            allowNull: false
        },

        TVA: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        plus_size: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        plus_tail: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        value_plus_size: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        value_plus_tail: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        return_price: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        change_price: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        price_in_state: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        pickup: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        pickup_price: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        encapsulation: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        encapsulation_price: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        defult_weight: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        defult_length: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        lastDateEmptyPoints: {
            type: types.DATE,
            allowNull: true
        },
        createdAt: {
            type: types.DATE,
            allowNull: false
        },
        updatedAt: {
            type: types.DATE,
            allowNull: false
        },
        activation: {
            type: types.STRING(10),
            defaultValue: "desactive",
            allowNull: false
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    },{
        timestamps: true,
        indexes: [
            {unique: true, fields: ['phone01'] },
            {unique: true, fields: ['name'] },
        ]
    });
};

var personModel = (db, types) => {
	return db.define('person', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        first_name: {
            type: types.STRING(30),
            allowNull: false
        },
        last_name: {
            type: types.STRING(30),
            allowNull: false
        },
        email: {
            type: types.STRING(100),
            allowNull: true,
            // validate: {isEmail: true}
        },
        phone01: {
            type: types.STRING(15),
            allowNull: false
        },
        phone02: {
            type: types.STRING(15),
            allowNull: true
        },
        address: {
            type: types.STRING(50),
            allowNull: false
        },
        city: {
            type: types.STRING(30),
            allowNull: false
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        createdAt: {
            type: types.DATE,
            allowNull: false
        },
        updatedAt: {
            type: types.DATE,
            allowNull: false
        }
    },{
        timestamps: true,
        createdAt: true,
        updatedAt: true,
        freezeTableName: true,
        indexes: [
            {unique: true, fields: ['email'] },
            {unique: true, fields: ['phone01'] }
        ]
    });
};

var factorModel = (db, types) => {
	return db.define('factor', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        department: {
            type: types.STRING(30),
            allowNull: false
        },
        salary_type: {
            type: types.STRING(30),
            allowNull: false
        },
        salary: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
    },{
        timestamps: true,
        createdAt: false,
        updatedAt: false
    });
};

var clientModel = (db, types) => {
	return db.define('client', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
    },{
        timestamps: true,
        createdAt: false,
        updatedAt: false
    });
};

var userModel = (db, types) => {
	return db.define('user', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        user_name: {
            type: types.STRING(50),
            allowNull: false,
        },
        password: {
            type: types.STRING(255),
            allowNull: false
        },
        role: {
            type: types.STRING(20),
            allowNull: false
        },
        activation: {
            type: types.STRING(10),
            defaultValue: "active",
            allowNull: false
        },
        email_verify: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: true
        },
        lastConnection: {
            type: types.DATE,
            allowNull: false
        },
        lastDisconnection: {
            type: types.DATE,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: false,
        updatedAt: false,
        indexes: [
            {unique: true, fields: ['user_name'] }
        ]
    });
};

var authTraceModel = (db, types) => {
	return db.define('auth_trace', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        token: {
            type: types.STRING(500),
            allowNull: false
        },
        user_name: {
            type: types.STRING(50),
            allowNull: false,
        },
        action: {
            type: types.STRING(50),
            allowNull: false,
        },
        createdAt: {
            type: types.DATE,
            allowNull: false
        }
    },{
        timestamps: true,
        createdAt: true,
        updatedAt: false,
        freezeTableName: true
    });
};

var invoiceModel = (db, types) => {
    return db.define('invoice', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        code_invoice: {
            type: types.STRING(12),
            allowNull: false
        },
        points: {
            type: types.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        price: {
            type: types.DOUBLE,
            allowNull: false
        },
        status: {
            type: types.STRING(20),
            defaultValue: "pending"
        },
        createdAt: {
            type: types.DATE,
            allowNull: false
        },
        updatedAt: {
            type: types.DATE,
            allowNull: false
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    },{
        timestamps: true,
        createdAt: true,
        updatedAt: true
    });
};

var boxModel = (db, types) => {
	return db.define('box', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        recipient_name: {
            type: types.STRING(50),
            allowNull: false,
        },
        recipient_phone1: {
            type: types.STRING(50),
            allowNull: false,
        },
        recipient_phone2: {
            type: types.STRING(50),
            allowNull: false,
        },
        recipient_city: {
            type: types.STRING(50),
            allowNull: false,
        },
        recipient_address: {
            type: types.STRING(50),
            allowNull: false,
        },
        recipient_loction: {
            type: types.STRING(255),
            defaultValue: "",
            allowNull:true,
        },
        code_box: {
            type: types.STRING(50),
            allowNull: false,
        },
        status_box: {
            type: types.INTEGER(3),
            defaultValue: 0,
            allowNull: false,
        },
        command_number: {
            type: types.STRING(50),
            allowNull: false,
        },
        payment_type: {
            type: types.STRING(50),
            allowNull: false,
        },
        fragile: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        delivery_type: {
            type: types.STRING(20),
            allowNull: false,
        },
        categorie: {
            type: types.STRING(255),
            allowNull: false,
        },
        height_box: {
            type: types.STRING(50),
            allowNull: false,
        },
        width_box: {
            type: types.STRING(50),
            allowNull: false,
        },
        length_box: {
            type: types.STRING(50),
            allowNull: false,
        },
        weight_box: {
            type: types.STRING(50),
            allowNull: false,
        },
        price_box: {
            type: types.DOUBLE,
            allowNull: false,
        },
        price_delivery: {
            type: types.DOUBLE,
            allowNull: false,
        },
        TVA: {
            type: types.INTEGER(11),
            allowNull: false,
        },
        note: {
            type: types.STRING(50),
            allowNull: false,
        },
        id_stock: {
            type: types.STRING(50),
            allowNull: false
        },
        paid_in_office: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        possibility_open: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        encapsulation: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },

        code_invoice: {
            type: types.STRING(15),
            defaultValue: "0",
            allowNull: false
        },
        code_envelope: {
            type: types.STRING(15),
            defaultValue: "0",
            allowNull: false
        },
        code_pick_up: {
            type: types.STRING(15),
            defaultValue: "",
            allowNull: true
        },
        price_pick_up: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false,
        },
        price_return: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false,
        },
        code_driver_commission: {
            type: types.STRING(15),
            defaultValue: "",
            allowNull: true
        },

        cd_commission_pickup: {
            type: types.STRING(15),
            defaultValue: "",
            allowNull: true
        },

        id_driver: {
            type: types.STRING(50),
            allowNull: true
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        archived: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
    }, {
        timestamps: true,
        createdAt: true,
        updatedAt: true,
        indexes: [
            {unique: true, fields: ['code_box'] }
        ]
    });
};

var boxTraceModel = (db, types) => {
	return db.define('box_trace', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        status: {
            type: types.INTEGER(3),
            allowNull: false,
        },
        note: {
            type: types.STRING(255),
            allowNull: false
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        createdAt: {
            type: types.DATE,
            allowNull: false
        },
        updatedAt: {
            type: types.DATE,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: true,
        updatedAt: true
    });
};

var stockModel = (db, types) => {
    return db.define('stock', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: types.STRING(50),
            allowNull: false
        },
        city: {
            type: types.STRING(50),
            allowNull: false
        },
        address: {
            type: types.STRING(100),
            allowNull: false
        },
        phone01: {
            type: types.STRING(15),
            allowNull: false
        },
        phone02: {
            type: types.STRING(15),
            allowNull: true
        },
        activation: {
            type: types.STRING(10),
            defaultValue: "active",
            allowNull: false
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        createdAt: {
            type: types.DATE,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: true
    });
};

var stockAccessModel = (db, types) => {
	return db.define('stock_access', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        createdAt: {
            type: types.DATE,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: true
    });
};

var zoneModel = (db, types) => {
    return db.define('zone', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: types.STRING(50),
            allowNull: false
        },
        cities: {
            type: types.STRING(1000),
            allowNull: false
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        createdAt: {
            type: types.DATE,
            allowNull: false
        },
        updatedAt: {
            type: types.DATE,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: true,
        updatedAt: true
    });
};

var pricingModel = (db, types) => {
    return db.define('pricing', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        default_price_office: {
            type: types.DOUBLE,
            allowNull: false
        },
        default_price_house: {
            type: types.DOUBLE,
            allowNull: false
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        createdAt: {
            type: types.DATE,
            allowNull: false
        },
        updatedAt: {
            type: types.DATE,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: true,
        updatedAt: true
    });
};

var messagesModel = (db, types) => {
  return db.define('message', {
    id: {
      type: types.UUID,
      defaultValue: types.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: types.STRING(50),
      allowNull: false
    },
    message: {
      type: types.STRING(255),
      allowNull: false
    },

    createdAt: {
      type: types.DATE,
      allowNull: false
    },
    updatedAt: {
      type: types.DATE,
      allowNull: false
    },
    deleted: {
      type: types.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  },{
    timestamps: true,
    createdAt: true,
    updatedAt: true
  });
};

var pickUpModel = (db, types) => {
  return db.define('pickup', {
    id: {
      type: types.UUID,
      defaultValue: types.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    number_box: {
      type: types.INTEGER,
      allowNull: false
    },
    price: {
      type: types.DOUBLE,
      allowNull: false
    },
    deleted: {
      type: types.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    createdAt: {
      type: types.DATE,
      allowNull: false
    },
    updatedAt: {
      type: types.DATE,
      allowNull: false
    }
  }, {
    timestamps: true,
    createdAt: true,
    updatedAt: true
  });
};

var companiesOffersModel = (db, types) => {
    return db.define('companies_offer', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        title: {
            type: types.STRING(100),
            allowNull: false
        },
        description: {
            type: types.STRING(255),
            allowNull: true
        },
        discount_return: {
            type: types.INTEGER(3),
            defaultValue: 0,
            allowNull: false
        },
        discount_delivery: {
            type: types.INTEGER(3),
            defaultValue: 0,
            allowNull: false
        },
        status: {
            type: types.STRING(20),
            allowNull: false,
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: true,
        updatedAt: true
    });
};

// Definition models and set database config and orm sequelize

const Company =         companyModel(DB, Sequelize);
const Person =          personModel(DB, Sequelize);
const Factor =          factorModel(DB, Sequelize);
const Client =          clientModel(DB, Sequelize);
const User =            userModel(DB, Sequelize);
const AuthTrace =       authTraceModel(DB, Sequelize);
const Invoice =         invoiceModel(DB, Sequelize);
const Box =             boxModel(DB, Sequelize);
const BoxTrace =        boxTraceModel(DB, Sequelize);
const Stock =           stockModel(DB, Sequelize);
const StockAccess =     stockAccessModel(DB, Sequelize);
const Zone =            zoneModel(DB, Sequelize);
const Pricing =         pricingModel(DB, Sequelize);
const Messages =        messagesModel(DB, Sequelize);
const PickUp =          pickUpModel(DB, Sequelize);
const CompaniesOffers = companiesOffersModel(DB, Sequelize);
// Relationships between tables

// Company 1 * Invoice
Company.hasMany(Invoice, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
Invoice.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Company 1 * Messages
Company.hasMany(Messages, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
Messages.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Company 1 * Zone
Company.hasMany(Zone, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
Zone.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Zone 1 * Pricing
Zone.hasMany(Pricing, { foreignKey: { name: 'id_zone_begin' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
Pricing.belongsTo(Zone, { foreignKey: { name: 'id_zone_begin' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Zone 1 * Pricing
Zone.hasMany(Pricing, { foreignKey: { name: 'id_zone_end' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
Pricing.belongsTo(Zone, { foreignKey: { name: 'id_zone_end' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Company 1 * AuthTrace
Company.hasMany(AuthTrace, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
AuthTrace.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Company 1 * Stock
Company.hasMany(Stock, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
Stock.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Company 1 * PickUp Plan
Company.hasMany(PickUp, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
PickUp.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Company 1 * Companies Offers
Company.hasMany(CompaniesOffers, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
CompaniesOffers.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Person 1 1 User
Person.hasOne(User, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.belongsTo(Person, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Person 1 1 Client
Person.hasOne(Client, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
Client.belongsTo(Person, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Person 1 1 Factor
Person.hasOne(Factor, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
Factor.belongsTo(Person, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Client 1 * Box
Client.hasMany(Box, { foreignKey: { name: 'id_client' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
Box.belongsTo(Client, { foreignKey: { name: 'id_client' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Client 1 * Box
Box.hasMany(BoxTrace, { foreignKey: { name: 'id_box' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
BoxTrace.belongsTo(Box, { foreignKey: { name: 'id_box' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Stock 1 * BoxTrace
Stock.hasMany(BoxTrace, { foreignKey: { name: 'id_stock' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
BoxTrace.belongsTo(Stock, { foreignKey: { name: 'id_stock' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Person 1 * BoxTrace
Person.hasMany(BoxTrace, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
BoxTrace.belongsTo(Person, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Stock 1 * BoxTrace
Stock.hasMany(StockAccess, { foreignKey: { name: 'id_stock' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
StockAccess.belongsTo(Stock, { foreignKey: { name: 'id_stock' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Person 1 * BoxTrace
Person.hasMany(StockAccess, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
StockAccess.belongsTo(Person, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });



// Tables are updated without being deleted
DB.sync({ alter: true, force: false })
.then(() => console.log('Tables are updated without being deleted.'))
.catch ((error) => console.error('Unable to update Tables:', error));

dotenv.config();

const SECRET$3 = process.env.SECRET;

const AuthMiddleware$1 = async (req, res, next) => {
    // Extract Authorization Header
    const authHeader = req.get("Authorization");

    if (!authHeader) {
        req.isAuth = false;
        return next();
    }

    
    // Extract the token and check for token
    const token = authHeader.split(" ")[1];

    if (!token || token === "") {
        req.isAuth = false;
        return next();
    }

    // Verify the extracted token
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, SECRET$3);
    } catch (err) {
        req.isAuth = false;
        return next();
    }

    // If decoded token is null then set authentication of the request false
    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }

    // If the user has valid token then Find the user by decoded token's id
    let authUser = await User.findByPk(decodedToken.id);
    if (!authUser) {
        req.isAuth = false;
        return next();
    }

    //await AuthTrace.create({token : token, user_name: authUser.user_name, action: "Token Checked" })

    req.isAuth = true;
    req.user = authUser;
    return next();
};

dotenv.config();

const SECRET$2 = process.env.SECRET;

const AuthMiddleware = async (auth) => {

    // Extract Authorization Header
    const authSocket = auth;

    // console.log("Authorization Socket", auth);

    if (!authSocket) {
        return {isAuth: false};
    }

    
    // Extract the token and check for token
    const token = authSocket.split(" ")[1];

    if (!token || token === "") {
        return {isAuth: false};
    }

    // Verify the extracted token
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, SECRET$2);
    } catch (err) {
        return {isAuth: false};
    }

    // If decoded token is null then set authentication of the request false
    if (!decodedToken) {
        return {isAuth: false};
    }

    // If the user has valid token then Find the user by decoded token's id
    let authUser = await User.findByPk(decodedToken.id);
    if (!authUser) {
        return {isAuth: false};
    }

    //await AuthTrace.create({token : token, user_name: decodedToken.user_name, action: "Token Checked" })

    return {
        isAuth: true,
        user: authUser
    };
};

function dateDirective(directiveName) {
    return {
        dateDirectiveTypeDefs: `directive @${directiveName}(format: String = "dd/mm/yyyy HH:MM:ss") on FIELD_DEFINITION`,

        dateDirectiveTransformer: (schema) => utils.mapSchema(schema, {
            [utils.MapperKind.OBJECT_FIELD]: fieldConfig => {
                let dateDirective = utils.getDirective(schema, fieldConfig, directiveName);
                if (dateDirective)  dateDirective = dateDirective[0];

                if (dateDirective) {
                    const { resolve = graphql.defaultFieldResolver } = fieldConfig;
                    const { format } = dateDirective;
                    fieldConfig.resolve = async (source, args, context, info) => {
                        const date = await resolve(source, args, context, info);
                        return dateFns.format(date, format)
                    };
                    return fieldConfig
                }
            }
        })
    }
}

function authDirective(directiveName) {
    let typeDirectiveArgumentMaps = {};
    return {
        authDirectiveTypeDefs: `
            directive @${directiveName}( requires: [Role!] = [ANY], ) on OBJECT | FIELD_DEFINITION
            enum Role {
                ADMIN
                USER
                CLIENT
                ADMINCOMPANY
                ANY
            }
        `,

        authDirectiveTransformer: (schema) => utils.mapSchema(schema, {
            [utils.MapperKind.TYPE]: type => {
                let authDirective = utils.getDirective(schema, type, directiveName);
                if(authDirective && authDirective.length > 0) authDirective = authDirective[0];
                if (authDirective) typeDirectiveArgumentMaps[type.name] = authDirective;
                return undefined
            },

            [utils.MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
                let authDirective = utils.getDirective(schema, fieldConfig, directiveName);
                if(authDirective && authDirective.length > 0) {authDirective = authDirective[0];}
                else authDirective = typeDirectiveArgumentMaps[typeName];

                if (authDirective) {
                    const { requires } = authDirective;
                    if (requires) {
                        const { resolve = graphql.defaultFieldResolver } = fieldConfig;

                        fieldConfig.resolve = function (source, args, context, info) {
                            const {user, isAuth} = context;

                            if (!isAuth || !user) {
                                throw new apolloServerExpress.AuthenticationError(`You must be the authenticated user to get this information`);
                            }

                            const roleUser = user.role.toUpperCase();

                            if (requires.includes("ANY")) {
                                return resolve(source, args, context, info)
                            }

                            if(!isAuth || !requires.includes(roleUser)) {
                                throw new apolloServerExpress.AuthenticationError(`You need following role: ${requires}`);
                            }

                            return resolve(source, args, context, info)

                        };
                        return fieldConfig
                    }
                }
            }
        })
    }
}

const { dateDirectiveTypeDefs, dateDirectiveTransformer } = dateDirective("date");
const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth');

const typeDefs$f = apolloServerExpress.gql`
    extend type Query {
        box(id: ID): Box!  @auth(requires: [ANY])
        getBoxs(ids: [ID!]): [Box!]  @auth(requires: [ANY])
        allBox(idStock: ID!): [Box!]  @auth(requires: [ANY])
        boxClient(idClient: ID): [Box!]  @auth(requires: [ANY])
        boxDriver(idDriver: ID): [Box!]  @auth(requires: [ANY])
        boxInvoice(codeInvoice: ID): [Box!]  @auth(requires: [ANY])
        boxInvoiceDriver(codeInvoice: ID): [Box!]  @auth(requires: [ANY])
        boxInvoiceDriverPickUp(codeInvoice: ID): [Box!]  @auth(requires: [ANY])
        boxEnvelope(codeEnvelope: ID): [Box!]  @auth(requires: [ANY])
        profileClient(idClient: ID): contentProfile  @auth(requires: [ANY])
        openEnvelopeCity(idStock: ID): [BoxCity!]  @auth(requires: [ANY])
        closeEnvelopeCity(idStock: ID): [BoxCity!]  @auth(requires: [ANY])
        readyEnvelopeCity(idStock: ID): [BoxCity!]  @auth(requires: [ANY])
        deliveryEnvelopeCity(idStock: ID): [BoxCity!]  @auth(requires: [ANY])
        listPickUpClient(idClient: ID): [PickUPGroup!]  @auth(requires: [ANY])
        deliveredDriverBox(idDriver: ID): [Box!]  @auth(requires: [ANY])
        pickedUpBox(idDriver: ID): [Box!]  @auth(requires: [ANY])
    }

    extend type Mutation {
        createBox (content: boxContent!): Box  @auth(requires: [ANY])

        trackBox(codeBox: ID): Box
        
        updateBox (id: ID!, content: boxContent!): statusUpdate  @auth(requires: [ANY])

        archiveBox (id: ID! ): statusUpdate  @auth(requires: [ANY])

        deleteBox ( id: ID! ): statusDelete  @auth(requires: [ANY])

        driverCommission(idBoxes: [ID!]!): statusUpdate @auth(requires: [ANY])
        
        driverCommissionPickUp(idBoxes: [ID!]!): statusUpdate @auth(requires: [ANY])

        addEnvelopeCode(idStock: ID!, city: String): contentCodeEnvelope  @auth(requires: [ANY])

        deleteEnvelopeCode(codeEnvelope: String): contentCodeEnvelope  @auth(requires: [ANY])
    }
    
    extend type Subscription {
        boxCreated(idStock: ID!): Box
        boxUpdated(idStock: ID!): BoxTrace
    }
    
    type contentCodeEnvelope {
        codeEnvelope: String
    }

    type BoxCity {
        city: String
        totalMouny: String
        numberBox: Int
        codeEnvelope: String
    }

    type PickUPGroup {
        code:       String
        status:     String
        createdAt:  Date @date(format: "dd/MM/yyyy HH:mm:ss")
        numberBox:  Int
    }
    
    type contentProfile { 
        boxs: [Box!]
        amountsUnderCollection: [Box!]
        amountsCollected: [Box!]
    }
    
    type Box {
        id:                                 ID!
        recipient_name:                     String
        recipient_phone1:                   String
        recipient_phone2:                   String
        recipient_city:                     String
        recipient_address:                  String
        recipient_loction:                  String
        code_box:                           String
        status_box:                         Int
        command_number:                     String
        payment_type:                       String
        fragile:                            Boolean
        delivery_type:                      String
        categorie:                          String
        height_box:                         String
        width_box:                          String
        length_box:                         String
        weight_box:                         String
        price_box:                          Float
        code_pick_up:                       String
        price_pick_up:                      Float
        price_return:                       Float
        price_delivery:                     Float
        paid_in_office:                     Boolean
        possibility_open:                   Boolean
        encapsulation:                      Boolean
        TVA:                                Int
        note:                               String
        archived:                           Boolean
        code_invoice:                       String
        code_envelope:                      String
        code_driver_commission:             String
        cd_commission_pickup:               String
        createdAt:                          Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:                          Date @date(format: "dd/MM/yyyy HH:mm:ss")
        stock:                              Stock
        client:                             Client
        lastTrace:                          [BoxTrace]!
        traceBox:                           [BoxTrace]!
    }

    input boxContent {
        recipient_name:                     String
        recipient_phone1:                   String
        recipient_phone2:                   String
        recipient_city:                     String
        recipient_address:                  String
        recipient_loction:                  String
        status_box:                         Int
        command_number:                     String
        payment_type:                       String
        fragile:                            Boolean
        delivery_type:                      String
        categorie:                          String
        height_box:                         String
        width_box:                          String
        length_box:                         String
        weight_box:                         String
        price_box:                          Float
        price_delivery:                     Float
        paid_in_office:                     Boolean
        possibility_open:                   Boolean
        encapsulation:                      Boolean
        TVA:                                Int
        note:                               String
        id_stock:                           ID
        id_client:                          ID
        id_person:                          ID
    }
`;

const typeDefs$e = apolloServerExpress.gql`
    extend type Query {
        boxTrace(idBox: ID!): [BoxTrace!]!
        lastTraceBox(idBox: ID!): [BoxTrace]
    }

    extend type Mutation {
        createBoxTrace (content: boxTraceContent!): BoxTrace  @auth(requires: [ANY])

        addBoxToPickUpGroup (codePickUp: String!, content: multiTraceContent!): BoxTrace  @auth(requires: [ANY])
        
        createMultiTrace (content: multiTraceContent): [BoxTrace]  @auth(requires: [ANY])
        
        createInvoiceTrace (content: invoiceTraceContent): [BoxTrace]  @auth(requires: [ANY])
        
        updateBoxTrace (id: ID!, content: boxTraceContent!): statusUpdate @auth(requires: [ANY])
        
        updateTraceByCodeEnvelop (codeEnvelop: String, content: envelopTraceContent!): [BoxTrace] @auth(requires: [ANY])
        
#        validationBoxTrace (id: ID!, content: validationTrace! ): statusUpdate

        deleteBoxTrace ( id: ID!): statusDelete @auth(requires: [ANY])
        
        accountingFactor (content: boxTraceContent!): BoxTrace @auth(requires: [ANY])
    }

    type BoxTrace {
        id:             ID
        status:         Int
        note:           String
        validation:     Boolean
        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        stock:          Stock
        person:         Person
        box:            Box
    }

    input boxTraceContent {
        status:         Int
        note:           String
        id_stock:       ID
        id_person:      ID
        id_box:         ID
    }

    input envelopTraceContent {
        status:     Int
        note:       String
        id_stock:   ID
        id_person:  ID
    }
    
    input invoiceTraceContent {
        idS:        [ID]!
        status:     Int
        note:       String
        id_stock:   ID
        id_person:  ID
    }
    
    input multiTraceContent {
        boxTrace: [multiTrace]!
        note:           String
        id_stock:       ID
        id_person:      ID
        id_company:      ID
    }

    input multiTrace {
        id_box:  ID
        status:  Int
    }

#    input validationTrace {
#        id_box:     ID!
#        id_person:  ID!
#        id_stock:   ID!
#    }
`;

const typeDefs$d = apolloServerExpress.gql`
    extend type Query {
        client(id: ID!): Client  @auth(requires: [ANY])
        # allClientsStock(idStock: ID!): [Client!]!
        # allClientsCompany(idCompany: ID!): [Client!]!
        allClients(idStock: ID!): [Client!]  @auth(requires: [ANY])
        currentClient: Client @auth(requires: [ANY])
        statisticsClient(idClient: ID): ClientStatistics!  @auth(requires: [ANY])
    }

    extend type Mutation {
        createClient (content: contentClient): Client  @auth(requires: [ANY])
        updateClient (id_person: ID!, content: contentClient!): statusUpdate  @auth(requires: [ANY])
        deleteClient (id_person: ID!): statusDelete  @auth(requires: [ANY])
    }


    type Client {
        id:     ID!
        person: Person  @auth(requires: [ANY])
        user: User  @auth(requires: [ANY])
        stock_accesses: [StockAccessIds!]
    }

    input contentClient {
        person: contentPerson
    }

    type ClientStatistics {
        numberAllBox:                   Int
        numberAllBoxArchived:           Int
        numberAllBoxNotArchived:        Int

        numberClassicBox:               Int
        numberClassicBoxArchived:       Int
        numberClassicBoxNotArchived:    Int

        numberCommercialBox:            Int
        numberCommercialBoxArchived:    Int
        numberCommercialBoxNotArchived: Int

        moneyDriver:            Float
        moneyStock:             Float
        moneyReadyReceive:      Float
        moneyReceived:          Float

        totalCommissions:       Float
        totalAmountDelivered:   Float
        totalAmountTax:         Float
        totalPrepaid:           Float
        totalAmountCancelled:   Float
        totalAmountPickUp:      Float
        
        allStatus:              [statusContent!]
    }

    type statusContent {
        status:         Int
        numberClassic:  Int
        numberCommercial: Int
    }
`;

const typeDefs$c = apolloServerExpress.gql`
    extend type Query {
        company(id: ID!): Company! @auth(requires: [ANY])
        allCompany: [Company!]! @auth(requires: [ANY])
        getAllStatisticsCompany(idCompany: ID): allStatisticsCompany! @auth(requires: [ANY])
    }

    extend type Mutation {
        createCompany(content: contentCompany): Company! @auth(requires: [ANY])

        updateCompany(id: ID!, content: contentUpdateCompany): statusDelete @auth(requires: [ANY])

        deleteCompany(id: ID!): statusDelete @auth(requires: [ANY])
        
        createAdminCompany(content: contentAdmin): Company
        
        activeCompany ( id: ID!, activation: String ): statusUpdate @auth(requires: [ANY])

        activeAdminCompany ( idCompany: ID! ): statusUpdate @auth(requires: [ANY])
        uploadLogo (idCompany: ID!, logo: Upload!): statusUpdate @auth(requires: [ADMINCOMPANY])
        
    }

    type Company {
        id:             ID!
        name:           String
        logo:           String
        phone01:        String
        phone02:        String
        email:          String
        url_site:       String
        city:           String
        address:        String
        points:         Int
        TVA:            Float
        plus_size:      Float
        plus_tail:      Float
        value_plus_size:Float
        value_plus_tail:Float
        return_price:   Float
        change_price:   Float
        price_in_state: Float
        pickup:         Boolean
        pickup_price:   Float

        encapsulation:         Boolean
        encapsulation_price:   Float
        defult_weight:  Float
        defult_length:  Float
        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        lastDateEmptyPoints: Date @date(format: "dd/MM/yyyy HH:mm:ss")
        activation:     String

        listMessages: [Messages!]
        listPickUpPlan: [PickUpPlan]
        numberArchivedBoxes:     Int @auth(requires: [ANY])
        numberNotArchivedBoxes:  Int @auth(requires: [ANY])
    }

    type CompanyInfo {
        company:        Company!
        admin:          User!
    }

    input contentUpdateCompany {
        name:           String
        logo:           String
        phone01:        String
        phone02:        String
        email:          String
        url_site:       String
        city:           String
        address:        String
        TVA:            Float
        plus_size:      Float
        plus_tail:      Float
        value_plus_size:Float
        value_plus_tail:Float
        return_price:   Float
        change_price:   Float
        defult_weight:  Float
        defult_length:  Float
        price_in_state: Float
        pickup:         Boolean
        pickup_price:   Float

        encapsulation:         Boolean
        encapsulation_price:   Float
        activation:     String

        pickUpPlanContent: [pickUpPlanContent!]
    }

    input contentCompany {
        nameCompany:    String
        phoneCompany:   String
        cityCompany:    String
        addressCompany: String
    }
    
    input contentPersonAdmin {
        first_name:     String
        last_name:      String
        email:          String
        phone01:        String
        phone02:        String
        city:           String
        address:        String
    }

    input contentAdmin {
        password:       String!
        person:         contentPersonAdmin!
        company:        contentCompany!
    }

    type allStatisticsCompany {
        numberClients:           Int
        numberFactors:           Int
        numberUsers:             Int
        numberAllStock:          Int

        numberArchivedBoxes:     Int
        numberNotArchivedBoxes:  Int
        numberClassicBoxes:      Int
        numberCommercialBoxes:   Int

        deliveryProfit:          Float
        readyProfit:             Float
        exportProfit:            Float

        points:                  Int
    }
`;

const typeDefs$b = apolloServerExpress.gql`
    extend type Query {
        factor(id: ID!): Factor @auth(requires: [ANY])
        allFactors(idStock: ID!): [Factor] @auth(requires: [ANY])
        allDriver(idCompany: ID!): [Factor] @auth(requires: [ANY])
        currentDriver: Factor @auth(requires: [ANY])
        currentFactor: Factor @auth(requires: [ANY])
    }

    extend type Mutation {

        createFactor (content: contentFactor!): Factor @auth(requires: [ANY])
    
        updateFactor (id_person: ID!, content: contentFactor!): statusUpdate @auth(requires: [ANY])

        deleteFactor (id_person: ID!): statusDelete @auth(requires: [ANY])
    }

    type Factor {
        id:         ID!
        person:     Person @auth(requires: [ANY])
        department: String
        salary_type: String
        salary: Float
        user: User @auth(requires: [ANY])
    }

    input contentFactor {
        department: String
        salary_type: String
        salary: Float
        person: contentPerson
    }

`;

const typeDefs$a = apolloServerExpress.gql`
    extend type Query {
        invoice(id: ID!): Invoice @auth(requires: [ANY])
        allInvoicesCompany(id_company: ID): [Invoice!] @auth(requires: [ANY])
        allInvoices: [Invoice!] @auth(requires: [ANY])
    }

    extend type Mutation {
        createInvoice (content: contentInvoice!): Invoice! @auth(requires: [ANY])
        updateInvoice (id: ID!, content: contentInvoice!): statusUpdate @auth(requires: [ANY])
        changeStatusInvoice (id: ID!, status: String!): statusUpdate @auth(requires: [ANY])
        deleteInvoice (id: ID!): statusDelete @auth(requires: [ANY])
    }

    type Invoice {
        id:             ID!
        code_invoice:   String
        points:         Int
        price:          Float
        status:         String
        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        company:        Company @auth(requires: [ANY])
    }

    input contentInvoice {
        points:         Int
        id_company:     ID!
    }
`;

const typeDefs$9 = apolloServerExpress.gql`
    extend type Query {
        person(id: ID!): Person! @auth(requires: [ANY])
        allPersons: [Person!]! @auth(requires: [ANY])
    }

    extend type Mutation {
        createPerson (content: contentPerson): Person @auth(requires: [ANY])
        updatePerson (id: ID!, content: contentPerson!): statusUpdate @auth(requires: [ANY])
        deletePerson (id: ID!): statusDelete @auth(requires: [ANY])
    }

    type Person {
        id:                     ID!
        first_name:             String
        last_name:              String
        email:                  String
        phone01:                String
        phone02:                String
        city:                   String
        address:                String
        deleted:                Boolean
        createdAt:              Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:              Date @date(format: "dd/MM/yyyy HH:mm:ss")
        list_stock_accesses:    StockAccess
        company:                Company @auth(requires: [ANY])
    }

    type StockAccess {
        id:             ID!
        createdAt:      Date
        updatedAt:      Date
        stock:          Stock
        # person:         Person
    }

    input contentPerson {
        first_name:     String
        last_name:      String
        email:          String
        phone01:        String
        phone02:        String
        city:           String
        address:        String
        id_stock:       ID
    }
`;

const typeDefs$8 = apolloServerExpress.gql`

    scalar Upload

    extend type Query {
        user(id: ID!): User!  @auth(requires: [ANY])
        currentUser: User! @auth(requires: [ANY])
        currentAdmin: User! @auth(requires: [ADMINCOMPANY])

        # deleted defullt value false
        allUsers(idStock: ID!, deleted: Boolean): [User!]!  @auth(requires: [ANY])
        
        # allUsersLimitedBy(offset: Int!,  limit: Int!, option: String): [User!]!
        refreshToken: AuthUser
    }

    extend type Mutation {
        authenticateUser(content: userInfo): AuthUser!
        createUser (content: contentUser): AuthUser!  @auth(requires: [ANY])
        emailVerification(token: String): statusUpdate!
        forgetPassword(email: String): statusUpdate!
        resendVerificationEmail(email: String): statusUpdate!
        changePassword(content: contenPassword): statusUpdate!
        updateUsers (id_person: ID!, content: contentUpdateUser): statusUpdate!  @auth(requires: [ANY])
        updateMyUser (id_person: ID!, content: contentMyUpdateUser): AuthUser  @auth(requires: [ANY])
        activeUser (id_person: ID!, activation: String): statusUpdate!  @auth(requires: [ANY])
        deleteUser (id_person: ID!): statusDelete  @auth(requires: [ANY])

        updateAccessesStock(idPerson: ID!, idStock: ID!): statusUpdate!  @auth(requires: [ANY])

        singleUpload(file: Upload!): File!  @auth(requires: [ANY])
        logOut: statusDelete 
    }

    type File {
        filename: String!
        mimetype: String!
        encoding: String!
    }

    type User {
        id:                 ID!
        user_name:          String
        password:           String @auth(requires: [USER])
        role:               String @auth(requires: [ANY])
        activation:         String
        lastConnection:     Date @date(format: "yyyy-MM-dd HH:mm:ss")
        lastDisconnection:  Date @date(format: "yyyy-MM-dd HH:mm:ss")
        person:             Person!
    }

    type AuthUser {
        token: String!
        user:  User
    }

    type AuthTrace {
        id:             ID!
        token:          String
        user_name:      String
        action:         String
        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        company:        Company
    }

    enum roleCompany {
        Factor
        Driver
        Client
    }
    
    input contentUser {
        user_name:      String!
        password:       String!
        role:           roleCompany!
        id_person:      ID!
    }
    
    
    input contentUpdateUser {
        user_name:      String
        newPassword:    String
        role:           String
        person:         contentPerson
    }

    input contentMyUpdateUser {
        user_name:      String
        oldPassword:    String!
        newPassword:    String
        role:           String
        person:         contentPerson
    }

    input userInfo {
        email:      String!
        password:   String!
    }

    input contenPassword {
        token:              String!
        password:           String!
        confirmPassword:    String!
    }
`;

const typeDefs$7 = apolloServerExpress.gql`
    extend type Query {
        stock(id: ID!): Stock! @auth(requires: [ANY])
        allStock(idCompany: ID!): [Stock!] @auth(requires: [ANY])
        getAllStatistics(idCompany: ID, idStock: ID): allStatistics! @auth(requires: [ANY])
        statisticsStock(idStock: ID): StockStatistics! @auth(requires: [ANY])
    }

    extend type Mutation {
        createStock (content: stockContent): Stock @auth(requires: [ANY])
        
        updateStock (id: ID!, content: stockContent): statusUpdate @auth(requires: [ANY])

        deleteStock ( id: ID! ): statusDelete @auth(requires: [ANY])
        
        activeStock ( id: ID!, activation: String ): statusUpdate @auth(requires: [ANY])
    }

    type Stock {
        id:                      ID!
        name:                    String
        city:                    String
        address:                 String
        phone01:                 String
        phone02:                 String
        activation:              String
        numberArchivedBoxes:     Int
        numberNotArchivedBoxes:  Int
        createdAt:   Date @date(format: "dd/MM/yyyy HH:mm:ss")
        company:     Company @auth(requires: [ANY])
    }

    type StockStatistics {
        numberAllBox:                   Int
        numberAllBoxArchived:           Int
        numberAllBoxNotArchived:        Int

        numberClassicBox:               Int
        numberClassicBoxArchived:       Int
        numberClassicBoxNotArchived:    Int

        numberCommercialBox:            Int
        numberCommercialBoxArchived:    Int
        numberCommercialBoxNotArchived: Int

        moneyDriver:            Float
        moneyReadyReceive:      Float
        moneyReceived:          Float

        totalCommissions:       Float
        totalAmountDelivered:   Float
        totalAmountTax:         Float
        totalPrepaid:           Float
        totalAmountCancelled:   Float
        totalAmountPickUp:      Float

        allStatus:              [statusContent!]

        chartMoney:     [Chart!]
        
        chartAmount:    [Chart!]
    }

    type Chart {
        week:  Int
        total:  Float
    }
    
    type allStatistics {
        numberClients:           Int
        numberFactors:           Int
        numberUsers:             Int
        numberAllBoxes:          Int
        numberAllStockBoxes:     Int
        numberArchivedBoxes:     Int
        numberNotArchivedBoxes:  Int
        numberClassicBoxes:      Int
        numberCommercialBoxes:   Int
        deliveryProfit:          Float
        readyProfit:             Float
    }

    type StockAccessIds {
        id: ID
        id_stock: ID
        id_person: ID
    }

    input stockContent {
        name:        String
        city:        String
        address:     String
        phone01:     String
        phone02:     String
        id_company:  ID!
    }
`;

const typeDefs$6 = apolloServerExpress.gql`
    extend type Query {
        #        person(id: ID!): Person! @auth(requires: [ANY])
        allStatisticsQafilaty: statisticsQafilaty @auth(requires: [ANY])
    }

    type statisticsQafilaty {
        totalProfit:    Float
        totalPointsSpent: Int
        totalFreePoints:    Int

        numberRegisteredCompanies:  Int
        numberRegisteredBranches:   Int

        totalAmountShipments:   Float
        totalDeliveryProfit:    Float

        totalNumberUsers:   Int
        totalNumberEmployees:   Int
        totalNumberClients: Int

        totalNumberShipments:   Shipments
        totalNumberShipmentsDelivered:  Shipments
        totalNumberShipmentsFailedDeliver:  Shipments
    }

    type Shipments {
        totalNumber:    Int

        activeShipments:    Int
        archivedShipments:    Int
        deletedShipments:    Int
    }

`;

const typeDefs$5 = apolloServerExpress.gql`
    extend type Query {
        allZone(idCompany: ID): [Zone!]! @auth(requires: [ANY])
        cityZone(idCompany: ID!, city: String!): Zone @auth(requires: [ANY])
    }

    extend type Mutation {
        createZone (content: zoneContent!): Zone @auth(requires: [ANY])

        updateZone (id: ID!, content: zoneContent!): statusUpdate @auth(requires: [ANY])

        deleteZone ( id: ID!): statusDelete @auth(requires: [ANY])
    }

    type Zone {
        id:         ID
        name:       String
        cities:     [String]
        listPrice:  [Pricing]
        createdAt:  Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:  Date @date(format: "dd/MM/yyyy HH:mm:ss")
        id_company: ID
    }

    input zoneContent {
        name:       String
        cities:     [String]!
        id_company: ID
    }
`;

const typeDefs$4 = apolloServerExpress.gql`
    extend type Query {
        allPricing(idZone: ID): [Pricing!]! @auth(requires: [ANY])
    }

    extend type Mutation {
        createPricing (content: pricingContent!): Pricing @auth(requires: [ANY])

        updatePricing (id: ID!, content: pricingContent!): statusUpdate @auth(requires: [ANY])

        deletePricing ( id: ID!): statusDelete @auth(requires: [ANY])
    }

    type Pricing {
        id:                     ID
        default_price_office:   Float
        default_price_house:    Float
        createdAt:              Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:              Date @date(format: "dd/MM/yyyy HH:mm:ss")
        zone_begin:             Zone
        zone_end:               Zone
    }

    input pricingContent {
        default_price_office:   Float
        default_price_house:    Float
        id_zone_begin:     ID
        id_zone_end:       ID
    }

`;

const typeDefs$3 = apolloServerExpress.gql`
    extend type Query {
        allMessages(idCompany: ID!): [Messages!]!
    }

    extend type Mutation {
        createMessage (content: messagesContent!): Messages  @auth(requires: [ANY])

        updateMessage (id: ID!, content: messagesContent!): statusUpdate @auth(requires: [ANY])

        deleteMessage ( id: ID!): statusDelete @auth(requires: [ANY])
    }

    type Messages {
        id:        ID
        type:      String
        message:   String
        
        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
    }

    input messagesContent {
        type:           String
        message:        String
        id_company:     ID
    }
`;

const typeDefs$2 = apolloServerExpress.gql`
    extend type Query {
        allPickUpPlans(idCompany: ID!): [PickUpPlan!] @auth(requires: [ANY])
    }

    extend type Mutation {
        createPickUpPlan (content: pickUpPlanContent!): PickUpPlan  @auth(requires: [ANY])

        updatePickUpPlan (id: ID!, content: pickUpPlanContent!): statusUpdate @auth(requires: [ANY])

        deletePickUpPlan ( id: ID!): statusDelete @auth(requires: [ANY])
    }

    type PickUpPlan {
        id:        ID
        price:     Float
        number_box:   Int

        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
    }

    input pickUpPlanContent {
        price:     Float
        number_box:   Int
#        id_company:     ID
    }
`;

const typeDefs$1 = apolloServerExpress.gql`
    extend type Query {
        allCompaniesOffers(idCompany: ID!): [CompaniesOffers!] @auth(requires: [ANY])
    }

    extend type Mutation {
        createCompaniesOffers (content: companiesOffersContent!): CompaniesOffers  @auth(requires: [ADMINCOMPANY])

        updateCompaniesOffers (id: ID!, content: pickUpPlanContent!): statusUpdate @auth(requires: [ADMINCOMPANY])

        deleteCompaniesOffers ( id: ID!): statusDelete @auth(requires: [ADMINCOMPANY])
    }

    type CompaniesOffers {
        id:                ID
        title:             String
        description:       String
        discount_return:   Int
        discount_delivery: Int
        status:            String

        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
    }

    input companiesOffersContent {
        title:             String
        description:       String
        discount_return:   Int
        discount_delivery: Int
        status:            String
        id_company:        ID
    }
`;

const SENDGRID_API_KEY$1 = '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';

class WinstonNodemailer extends Transport {

    constructor(props){
        super(props);
        this.name = 'WinstonNodemailer';
        this.level = 'error';
    }

    log(info, next){
        setImmediate(() => this.sendMail(info));
    }

    sendMail(msg){
        const { message, level, service, timestamp } = msg;
        try {
            sgMail.setApiKey(SENDGRID_API_KEY$1);
            const msg = {
                from: 'support@qafilaty.com', // Change to your verified sender
                to: "ali96info@gmail.com", // Change to your recipient
                subject: "new user regesterd",
                html:  `
                    <table style="width: 100%;">
                        <thead>
                            <th style="background: #f44336; padding: 10px; color: #fff; font-size: 18px;">${level.toUpperCase()}</th>
                        </thead>
                        <tbody>
                            <td style="background: #eee; padding: 20px 10px;">
                                <p style="background: #eee; color: #333; font-size: 16px; margin-bottom: 10px;"><b>file : </b>${message.file}</p><br/>
                                <p style="background: #eee; color: #333; font-size: 16px; margin-bottom: 10px;"><b>function : </b>${message.function}</p><br/>
                                <p style="background: #eee; color: #333; font-size: 16px; margin-bottom: 10px;"><b>error : </b>${message.error}</p><br/>
                                <p style="background: #eee; color: #333; font-size: 16px; margin-bottom: 10px;"><b>User : </b>${message.user || ""}</p><br/>
                                <p style="background: #eee; color: #333; font-size: 16px; margin-bottom: 10px;"><b>lines : </b>${message.lines}</p><br/>
                            </td>
                        </tbody>
                        <tfoot>
                            <td style="background: #c4c4c4; padding: 5px 10px; color: #333; font-size: 14px; text-align: center;">[ ${timestamp} ]</td>
                        </tfoot>
                    </table>
                `
            };

            sgMail.send(msg)
            .then(() => {
                console.log('Email sent', msg);
                return msg
            })
            .catch((error) => console.error(error));

        } catch(err) {
            this.emit('error', err);
        }
    }
}

const { createLogger, format, transports, add } = winston;
const { combine, timestamp, label, printf } = format;

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
        printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`)
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log', level: 'info'  }),
        new transports.Console(),
        new WinstonNodemailer()
    ]
});

dotenv.config();

const SENDGRID_API_KEY = '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';

const emptyPoints = `
    <body style="width: 95%;  text-align: center; background: #eee; padding: 80px 20px; font-family: 'Changa', sans-serif;">
        <div style="width: 80%; margin: 20px auto; background: #fff; padding: 20px; direction: rtl;">
            <img src="https://qafilaty.com/logo.png" alt="" width="100px">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Changa:wght@300&display=swap" rel="stylesheet">
            <h3 style="text-align: center;  margin: 20px auto 30px;" >إشعار بنفاذ نقاط حساب الشركة</h3>
            <hr/>
            <p style="font-size: 16px; margin-bottom: 10px;" >لقد نفذ رصيد شركتك يرجى اعادة شحن النقاط من جديد.</p>
            <i style="font-size: 16px; margin-bottom: 10px;">
                    سيتم منحك مدة <mark style="background: transparent; color: red; margin: auto 5px;"> 4 ايام </mark> استهلاك نقاط.
                    <b>بعد هذا الوقت سوف يتم توقيف حساب الشركة حتى سداد الديون</b>
                    
            </i><br/>
            <p style="font-size: 14px;" >خلال فترة ال 4 ايام يمكنك العمل بشكل طبيعي والنقاط تحسب على شكل ديون</p>
            <p style="font-size: 14px;" >سداد الديون بدون ضرائب او تعويض</p>
            <p style="font-size: 14px;" >يمكن للمستلمين تتبع حالة طرودهم حتى في حال توقف حساب الشركة من خلال منصتنا.</p>
            <p style="font-size: 14px;" >قم بتسجيل الدخول وشحن حساب شركتك</p>
            <a href="https://admin.qafilaty.com/signin/" style="background-color: #7d749e; color: #fff; padding: 10px 25px; font-size: 15px; text-decoration: none; display: block; width: 90px; margin: 20px auto;" >تسجيل الدخول</a>
        </div>
    </body>
`;

const managerVerificationMail = (token) => {
    return `
        <body style="width: 90%;  text-align: center; background: #eee; padding: 80px 20px; font-family: 'Changa', sans-serif;">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Changa:wght@300&display=swap" rel="stylesheet">
            <h1 style="text-align: center;  margin: 50px auto 30px;" >التحقق من البريد الالكتروني</h1>
            <h5 style="font-size: 18px; margin-bottom: 50px;" >اضغط على زر تحقق للتحقق من انك انت صاحب الحساب</h5>
            <a href="https://qafilaty.com/#/accounts/verification/${token}" style="background-color: #3b49df; color: #fff; padding: 10px 45px; font-size: 20px; text-decoration: none;" class="btn">تحقق</a>
        </body>
    `
};

const forgetPasswordManager = (token) => {
    return `
        <body style="width: 90%;  text-align: center; background: #eee; padding: 80px 20px; font-family: 'Changa', sans-serif;">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Changa:wght@300&display=swap" rel="stylesheet">
            <h1 style="text-align: center;  margin: 50px auto 30px;" >تغيير كلمة المرور</h1>
            <h5 style="font-size: 18px; margin-bottom: 50px;" >اضغط على زر تغيير كلمة المرور لتتمكن من إنشاء كلمة مرور جديدة</h5>
            <a href="https://qafilaty.com/#/accounts/changepassword/${token}" style="background-color: #7d749e; color: #fff; padding: 10px 45px; font-size: 20px; text-decoration: none;" class="btn">تغيير كلمة المرور</a>
        </body>
    `
};

const newUser = (data) => {
    return `
        <body style="width: 90%;  text-align: center; background: #eee; padding: 80px 20px; font-family: 'Changa', sans-serif;">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Changa:wght@300&display=swap" rel="stylesheet">
            <h1 style="text-align: right;  margin: 50px auto 20px;" >: شخص جديد قام بالتسجيل</h1>
            <p style="text-align: right;  margin: 8px auto;" ><b>اسم الشركة : </b>{data.companyName || ""}</p>
            <p style="text-align: right;  margin: 8px auto;" ><b>اسم المدير : </b>{data.admin || ""}</p>
            <p style="text-align: right;  margin: 8px auto;" ><b>رقم هاتف المدير : </b>{data.phone || ""}</p>
            <p style="text-align: right;  margin: 8px auto;" ><b>عنوان المدير : </b>{data.address || ""}</p>
            <h5 style="font-size: 18px; margin-bottom: 50px;" >تفقد لوحة التحكم لمعلومات اكثر</h5>
        </body>
    `
};

const createMailNewUser = async (data) => {
    try {
        sgMail.setApiKey(SENDGRID_API_KEY);

        const msg = {
            from: 'support@qafilaty.com', // Change to your verified sender
            to: "ali96info@gmail.com", // Change to your recipient
            subject: "new user regesterd",
            html: newUser(data)
        };

        sgMail.send(msg)
            .then(() => {
                console.log('Email sent', msg);
                return msg
            })
            .catch((error) => console.error(error));
    } catch (error) {
        console.error(error);
    }
};

const createEmptyPoints = async (mail) => {
    try {
        sgMail.setApiKey(SENDGRID_API_KEY);

        const msg = {
            from: 'support@qafilaty.com', // Change to your verified sender
            to: mail.to, // Change to your recipient
            subject: "Empty Points",
            html: emptyPoints
        };

        sgMail.send(msg)
            .then(() => console.log('Email sent', msg))
            .catch((error) => console.error(error));
    } catch (error) {
        console.error(error);
    }
};

/*const createMail = async (mail) => {
    try {
        let infoMail = {
            from: '"Qafilaty" <qafilaty@gmail.com>',
            to: mail.to,
            subject: mail.subject,
            //text: mail.text,
            html: mail.type === "Verification" ? managerVerificationMail(mail.token) : forgetPasswordManager(mail.token)
        }

        const transporterConfig = {
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "qafilaty@gmail.com",
                pass: "Hicham0675722241h@"
            }
        }

        let transporter = nodemailer.createTransport(transporterConfig)

        await transporter.sendMail(infoMail, (err, info) => {
            if(err) {
                console.error(err);
                return err
            }
            return info
        })
    } catch (error) {
        console.error(error)
    }
};*/

const createMail = async (mail) => {
    try {
        sgMail.setApiKey(SENDGRID_API_KEY);

        const msg = {
            to: mail.to, // Change to your recipient
            from: 'support@qafilaty.com', // Change to your verified sender
            subject: mail.subject,
            // text: '',
            html: mail.type === "Verification" ? managerVerificationMail(mail.token) : forgetPasswordManager(mail.token)
        };
        sgMail.send(msg)
            .then(() => console.log('Email sent', msg))
            .catch((error) => console.error(error));
    } catch (error) {
        console.error(error);
    }
};

dotenv.config();

const SECRET$1 = process.env.SECRET;
const { pick } = lodash;
const { sign } = jwt;

// const issueAuthToken = async (jwtPayload) => {
//     let token = await sign(jwtPayload, SECRET, {
//         expiresIn: 60*5
//     });
//     return `Bearer ${token}`;
// };

const issueAuthToken = async (payload, expir) => {
    const expiresIn = 60 * 60 * (expir || 5);

    let token = await sign(payload, SECRET$1, {
        expiresIn
    });
    return `Bearer ${token}`;
};

const serializeUser = (user) => pick(user, [
    'id',
    'user_name',
    'role',
    'activation',
    'id_person'
]);

const getRefreshToken = async (payload) => {
    return await sign(payload, SECRET$1, {
        expiresIn: 3600*24*7
    });
};

// const redisClient = new Redis({ enableOfflineQueue: false });
// redisClient.connect();

const maxWrongAttemptsByIPperMinute = 15;
const maxWrongAttemptsByIPperDay = 50;

const ready = (err) => {
  if (err) {
    // log or/and process exit
    console.log("ready ", err);
  } else {
    // db and table checked/created
    console.log("table Created");
  }
};

const limiterFastBruteByIP = new rateLimiterFlexible.RateLimiterMySQL({
  storeClient: DB,
  dbName: "qafilaty",
  tableCreated: false,
  tableName: 'login_fail_ip_per_minute',
  keyPrefix: 'login_fail_ip_per_minute',
  points: maxWrongAttemptsByIPperMinute,
  duration: 60,
  blockDuration: 60 * 5, // Block for 10 minutes, if 5 wrong attempts per 30 seconds
}, ready);

const limiterSlowBruteByIP = new rateLimiterFlexible.RateLimiterMySQL({
  storeClient: DB,
  dbName: "qafilaty",
  tableCreated: false,
  tableName: 'login_fail_ip_per_day',
  keyPrefix: 'login_fail_ip_per_day',
  points: maxWrongAttemptsByIPperDay,
  duration: 60 * 60 * 1,
  blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
}, ready);

const checkIPBlocked = async (req, res) => {
  const ipAddress = req.clientIp;

    const [resFastByIP, resSlowByIP] = await Promise.all([
        limiterFastBruteByIP.get(ipAddress),
        limiterSlowBruteByIP.get(ipAddress),
    ]);

    let retrySeconds = 0;

    // Check if IP is already blocked
    if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
      retrySeconds = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (resFastByIP !== null && resFastByIP.consumedPoints > maxWrongAttemptsByIPperMinute) {
      retrySeconds = Math.round(resFastByIP.msBeforeNext / 1000) || 1;
    }

    if (retrySeconds > 0) {
      res.setHeader('Retry-After', String(retrySeconds));
      return retrySeconds
    }
    return false;
};

const consumePoint = async (req, res) => {
  const ipAddress = req.clientIp;

    // Consume 1 point from limiters on wrong attempt and block if limits reached
    try {
        await Promise.all([
            limiterFastBruteByIP.consume(ipAddress),
            limiterSlowBruteByIP.consume(ipAddress),
        ]);
    } catch (rlRejected) {
        if (rlRejected instanceof Error) {
            console.log("rlRejected ", rlRejected);
            //throw rlRejected;
        } else {
            res.setHeader('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
            return rlRejected.msBeforeNext;
        }
    }
    return true;
};

const { hash: hash$1, compare: compare$1 } = bcrypt;

Joi.object({
    name:           Joi.string().min(3).max(50).required(),
    phone01:        Joi.string().min(10).max(15).required(),
    phone02:        Joi.string().empty('').min(0).max(15),
    email:          Joi.string().email().max(50).required(),
    url_site:       Joi.string().empty('').max(50),
    address:        Joi.string().min(4).max(50).required(),
    logo:           Joi.string().empty('').min(0).max(255),
});

const resolvers$f = {
    Query: {
        company: async (obj, args, context, info) => {
            try {
                return await Company.findByPk(args.id)
            } catch (error) {
                logger.error({ file: "company", function: "Query type | company", error, lines: "[ 23 - 30 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT041101")
            }
        },

        allCompany: async (obj, args, context, info) => {
            try {
                return await Company.findAll()
            } catch (error) {
                logger.error({ file: "company", function: "Query type | allCompany", error, lines: "[ 32 - 39 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT041102")
            }
        },

        getAllStatisticsCompany: async (obj, {idCompany}, context, info) => {
            try {
                let [numberClients] = await DB.query(`
                    SELECT s.id_company, COUNT(DISTINCT c.id_person) AS COUNT FROM clients c
                    JOIN stock_accesses sa ON sa.id_person = c.id_person
                    JOIN stocks s ON s.id = sa.id_stock
                    WHERE s.id_company = "${idCompany}" AND c.deleted = false`, {
                    type: Sequelize.QueryTypes.SELECT
                });


                let [numberFactors] = await DB.query(`
                    SELECT s.id_company, COUNT(DISTINCT f.id_person) AS COUNT FROM factors f
                    JOIN stock_accesses sa ON sa.id_person = f.id_person 
                    JOIN stocks s ON s.id = sa.id_stock
                    WHERE s.id_company = '${idCompany}' AND f.deleted = false`, {
                    type: Sequelize.QueryTypes.SELECT
                });

                let [numberUsers] = await DB.query(`
                    SELECT s.id_company, COUNT(DISTINCT u.id_person) AS COUNT FROM users u
                    JOIN stock_accesses sa ON sa.id_person = u.id_person 
                    JOIN stocks s ON s.id = sa.id_stock
                    WHERE s.id_company = '${idCompany}'`, {
                    type: Sequelize.QueryTypes.SELECT
                });

                let numberAllStock = await Stock.count({
                    where: { id_company: idCompany, deleted: false }
                });

                    let [numberAllBox] = await DB.query(`
                    SELECT s.id_company, COUNT(DISTINCT bt.id_box) AS COUNT FROM box_traces bt
                    JOIN stocks s ON s.id = bt.id_stock
                    WHERE s.id_company = '${idCompany}' AND bt.deleted = false AND s.deleted = false`, {
                        type: Sequelize.QueryTypes.SELECT
                    });

                

                let numberArchivedBoxes = await Stock.count({
                    where: { id_company: idCompany, deleted: false, "$box_traces->box.archived$": true },
                    include: {
                        model: BoxTrace, as: "box_traces", required: true, right: true,
                        include: { model: Box, as: "box", required: true, right: true }
                    }
                });

                let numberNotArchivedBoxes = await Stock.count({
                    where: { id_company: idCompany, deleted: false, "$box_traces->box.archived$": false },
                    include: {
                        model: BoxTrace, as: "box_traces", required: true, right: true,
                        include: { model: Box, as: "box", required: true, right: true }
                    }
                });

                let numberClassicBoxes = await Stock.count({
                    where: { id_company: idCompany, deleted: false, "$box_traces->box.price_box$": 0  },
                    include: {
                        model: BoxTrace, as: "box_traces", required: true, right: true,
                        include: { model: Box, as: "box", required: true, right: true }
                    }
                });

                let numberCommercialBoxes = await Stock.count({
                    where: { id_company: idCompany, deleted: false, "$box_traces->box.price_box$": { [Sequelize.Op.gt]: 0 }  },
                    include: {
                        model: BoxTrace, as: "box_traces", required: true, right: true,
                        include: { model: Box, as: "box", required: true, right: true }
                    }
                });

                let company = await Company.findOne({where: {id: idCompany}});


                return {
                    numberClients:           numberClients.COUNT,
                    numberFactors:           numberFactors.COUNT,
                    numberUsers:             numberUsers.COUNT,
                    numberAllStock:          numberAllStock,
                    numberArchivedBoxes:     numberArchivedBoxes,
                    numberNotArchivedBoxes:  numberNotArchivedBoxes,
                    numberClassicBoxes:      numberClassicBoxes,
                    numberCommercialBoxes:   numberCommercialBoxes,
                    deliveryProfit:          0.5,
                    readyProfit:             0.50,
                    exportProfit:            0.50,
                    points:                  company.points
                }
            } catch (error) {
                logger.error({ file: "company", function: "Query type | getAllStatisticsCompany", error, lines: "[ 42 - 135 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT081103")
            }
        },
    },

    Company: {
        numberArchivedBoxes: async (obj, args, context, info) => {
            try {
                const number = 50;
                return number
            } catch (error) {
                logger.error({ file: "company", function: "Company type | numberArchivedBoxes", error, lines: "[ 141 - 150 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT041101")
            }
        },

        numberNotArchivedBoxes: async (obj, args, context, info) => {
            try {
                const number = 150;
                return number
            } catch (error) {
                logger.error({ file: "company", function: "Company type | numberNotArchivedBoxes", error, lines: "[ 152 - 161 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT041101")
            }
        },
        listMessages: async ({id}, args, context, info) => {
            try {
                return await Messages.findAll({
                    where: {
                        id_company: id,
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "company", function: "Query type | listMessages", error, lines: "[ 157 - 169 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT021102")
            }
        },
        listPickUpPlan: async (obj, args, context, info) => {
            try {
                return await PickUp.findAll({
                    where: {
                        id_company: obj.id,
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "company", function: "Query type | listPickUpPlan", error, lines: "[ 157 - 169 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT021102")
            }
        }
    },
    
    Mutation: {
        createCompany: async (obj, {content}, context, info) =>   {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }
            try {
                return await Company.create(content)
            } catch (error) {
                logger.error({ file: "company", function: "Mutation type | createCompany", error, lines: "[ 164 - 176 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT042201")
            }
        },

        updateCompany: async (obj, {id, content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }

            try {
                if(content.pickUpPlanContent) {
                    await PickUp.destroy({
                        where: {
                            id_company: id
                        }
                    });

                    for (let i = 0; i < content.pickUpPlanContent.length; i++) {
                        let date = new Date().getTime() + (1000*i);
                        await PickUp.create(
                            {...content.pickUpPlanContent[i], id_company: id, createdAt: new Date(date)}
                        );
                    }
                }

                let company = await Company.update(content, { where: { id } });
                return {
                    status: company[0] === 1
                }

            } catch (error) {
                console.log(error);
                logger.error({ file: "company", function: "Mutation type | updateCompany", error, lines: "[ 179 - 196 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT042202")
            }
        },

        deleteCompany: async (obj, {id}, context, info) => {
            try {
                let result = await Company.update({deleted: true}, { where: { id } });

                return {
                    status: result === 1
                }

            } catch (error) {
                logger.error({ file: "company", function: "Mutation type | deleteCompany", error, lines: "[ 199 - 211 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT042203")
            }
        },

        createAdminCompany: async (obj, {content}, context, info) => {
            try {
                let person =        null,
                    user =          null,
                    company =       null,
                    stock =         null,
                    stockAccess =   null,
                    hashPassword =  null;

                // Person.create() => IT220340
                // User.create() => IT220341
                // Company.create() => IT220342
                // Stock.create() => IT220343
                // StockAccess.create() => IT220344

                if (!content.person.email || !content.person.phone01 || !content.company.nameCompany || !content.company.phoneCompany || !content.person.email) {
                    return new apolloServerExpress.ApolloError("Some fields are empty", "FIELDS_EMPTY")
                }

                person = await Person.findOne({
                    where: {
                        [Sequelize.Op.or]: [ {email: content.person.email}, {phone01: content.person.phone01} ]
                    }
                });

                if (person !== null) {
                    if (person.email === content.person.email && person.phone01 === content.person.phone01) {
                        return new apolloServerExpress.ApolloError("The email and phone01 admin is exist", "ALREADY_HAS_ACCOUNT")
                    } else if (person.email === content.person.email) {
                        return new apolloServerExpress.ApolloError("The email admin is exist", "EMAIL_ALREADY_EXISTS")
                    } else if (person.phone01 === content.person.phone01) {
                        return new apolloServerExpress.ApolloError("The phone01 admin is exist", "PHONE_ALREADY_EXISTS")
                    }
                }

                company = await Company.findOne({
                    where: {
                        [Sequelize.Op.or]: [
                            {name: content.company.nameCompany},
                            {phone01: content.company.phoneCompany},
                            {email: content.person.email}
                        ]
                    }
                });

                if (company !== null) {
                    if (company.email === content.person.email && company.phone01 === content.company.phoneCompany && company.name === content.company.nameCompany) {
                        return new apolloServerExpress.ApolloError("The company info is exist", "COMPANY_ALREADY_EXISTS")
                    } else if (company.email === content.person.email) {
                        return new apolloServerExpress.ApolloError("The email company is exist", "EMAIL_COMPANY_ALREADY_EXISTS")
                    } else if (company.phone01 === content.company.phoneCompany) {
                        return new apolloServerExpress.ApolloError("The phone01 company is exist", "PHONE_COMPANY_ALREADY_EXISTS")
                    } else if (company.name === content.company.nameCompany) {
                        return new apolloServerExpress.ApolloError("The name company is exist", "NAME_COMPANY_ALREADY_EXISTS")
                    }
                }

                try {
                    person = await Person.create(content.person);
                } catch (error) {
                    await Person.destroy({ where: {id: person.id} });
                    logger.error(`Company file | Mutation type | createAdminCompany function Person.create() : \n ${error}`);
                    return new apolloServerExpress.ApolloError("IT220340", "ADMIN_NOT_CREATED")
                }


                hashPassword = await hash$1(content.password, 10);

                if (person !== null && hashPassword !== null) {
                    try {
                        user = await User.create({
                            user_name: content.person.email.split("@")[0],
                            password:  hashPassword,
                            role:      "AdminCompany",
                            id_person: person.id,
                            lastConnection: new Date(),
                            lastDisconnection:  new Date()
                        });
                    } catch (error) {
                        await Person.destroy({ where: {id: person.id} });
                        logger.error(`Company file | Mutation type | createAdminCompany function User.create() : \n ${error}`);
                        return new apolloServerExpress.ApolloError("IT220341", "ADMIN_NOT_CREATED")
                    }
                }

                try {
                    company = await Company.create({
                        name:       content.company.nameCompany,
                        logo:       "Default",
                        phone01:    content.company.phoneCompany,
                        phone02:    "",
                        email:      content.person.email,
                        url_site:   "Default",
                        city:       content.company.cityCompany,
                        address:    content.company.addressCompany,

                        TVA:        0,
                        plus_size:  0,
                        plus_tail:  0,
                        value_plus_size: 0,
                        value_plus_tail: 0,
                        return_price: 0,
                        change_price: 0,
                        price_in_state: 0
                    });
                } catch (error) {
                    await Person.destroy({ where: {id: person.id} });
                    logger.error(`Company file | Mutation type | createAdminCompany function Company.create() : \n ${error}`);
                    return new apolloServerExpress.ApolloError("IT220342", "ADMIN_NOT_CREATED")
                }

                if (company.id !== null) {
                    try {
                        stock = await Stock.create({
                            name:        "الفرع الرئيسي",
                            city:        content.company.cityCompany,
                            address:     content.company.addressCompany,
                            phone01:     content.company.phoneCompany,
                            phone02:     "",
                            id_company:  company.id
                        });
                    } catch (error) {
                        await Person.destroy({ where: {id: person.id} });
                        await Company.destroy({ where: {id: company.id} });
                        logger.error(`Company file | Mutation type | createAdminCompany function Stock.create() : \n ${error}`);
                        return new apolloServerExpress.ApolloError("IT220343", "ADMIN_NOT_CREATED")
                    }
                }

                if (stock.id !== null && person.id !== null) {
                    try {
                        stockAccess = await StockAccess.create({
                            id_stock: stock.id,
                            id_person: person.id
                        });
                    } catch (error) {
                        await Person.destroy({ where: {id: person.id} });
                        await Company.destroy({ where: {id: company.id} });
                        await Stock.destroy({ where: {id: stock.id} });
                        logger.error(`Company file | Mutation type | createAdminCompany function StockAccess.create() : \n ${error}`);
                        return new apolloServerExpress.ApolloError("IT220344", "ADMIN_NOT_CREATED")
                    }
                }

                if (person !== null && user !== null && company !== null && stock !== null && stockAccess !== null) {
                    // Issue Token
                    let token = await issueAuthToken({id: user.id, email: person.email});

                    await createMail ({
                        type: "Verification",
                        to: person.email,
                        subject: "Email Verification",
                        token: token.split(" ")[1]
                    });

                    await createMailNewUser ({
                        companyName: company.name,
                        admin: `${person.first_name} ${person.last_name}`,
                        phone: person.phone01,
                        address: `${person.city} ${person.address}`
                    });


                    return company
                }
            } catch (error) {
                logger.error({ file: "company", function: "Mutation type | createAdminCompany", error, lines: "[ 214 - 378 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("IT-0000123")
            }
        },

        activeCompany: async (obj, {id, activation}, context, info) => {
            try {
                let result = await Company.update({activation}, { where: { id } });
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "company", function: "Mutation type | activeCompany", error, lines: "[ 381 - 391 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT083303")
            }
        },

        activeAdminCompany: async (obj, {idCompany}, context, info) => {
            try {
                const [user] = await DB.query(`
                    SELECT users.id AS "id", users.role AS "role",  users.email_verify AS "email_verify"
                    FROM users
                    INNER JOIN person AS person ON person.id = users.id_person
                    INNER JOIN stock_accesses AS stock_accesses ON person.id = stock_accesses.id_person
                    INNER JOIN stocks AS stock ON stock_accesses.id_stock = stock.id
                    
                    WHERE stock.id_company = "${idCompany}" AND users.role = "AdminCompany" `, {
                    type: Sequelize.QueryTypes.SELECT
                });

                if (!user) {
                    return {
                        status: false
                    }
                }

                let result = await User.update({email_verify: true}, { where: { id: user.id } });

                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "company", function: "Mutation type | activeAdminCompany", error, lines: "[ 394 - 423 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT083304")
            }
        },

        uploadLogo: async (obj, {idCompany, logo}, context, info) => {
            try {
                const listType = ["JPEG", "JPG", "PNG"];

                let file = await logo;

                const { createReadStream, filename, mimetype, encoding } = file;

                const imgType = filename.split(".")[filename.split(".").length-1].toUpperCase();

                const isImage = listType.indexOf(imgType) !== -1;

                if(!isImage) { return new apolloServerExpress.ApolloError("this file is not image") }

                const logoUniqName = `${uuid.v4()}.${imgType}`;
                const pathName = path.join(__dirname$1,   `./../qafilaty/${logoUniqName}`);

                const stream = createReadStream();
                await stream.pipe( fs.createWriteStream(pathName) );

                await Company.update({logo: logoUniqName}, { where: { id: idCompany } });

                if (logoUniqName && logoUniqName !== "") {
                    return {status: true}
                }
                return {status: false}
            } catch (error) {
                throw new apolloServerExpress.ApolloError(error)
            }
        },
    }
};

const { generator: generator$2, uid: uid$3 } = RandToken;

Joi.object({
    recipient_name:                     Joi.string().min(3).max(50).required(),
    recipient_phone1:                   Joi.string().min(10).max(15).required(),
    recipient_phone2:                   Joi.string().min(0).max(15),
    recipient_city:                     Joi.string().min(3).max(50).required(),
    recipient_address:                  Joi.string().min(3).max(50).required(),
    content_box:                        Joi.string().min(3).max(50),
    number_of_pieces_inside_the_box:    Joi.number().min(0).max(11),
    number_box:                         Joi.string().min(0).max(50),
    payment_type:                       Joi.string().min(0).max(50),
    height_box:                         Joi.string().min(0).max(50),
    width_box:                          Joi.string().min(0).max(50),
    weight_box:                         Joi.string().min(0).max(50),
    price_box:                          Joi.number().min(0.00),
    price_delivery:                     Joi.number().min(0.00),
    TVA:                                Joi.number().integer().min(0).max(100),
    note:                               Joi.string().min(0).max(50),
    id_stock:                           Joi.string().min(0).max(50).required(),
    id_client:                          Joi.string().min(0).max(50).required(),
    id_person:                          Joi.string().min(0).max(50).required()
});

const resolvers$e = {
    Query: {
        box: async (obj, args, context, info) => {
            try {
                return await Box.findByPk(args.id)
            } catch (error) {
                logger.error({ file: "box", function: "Query type | box", error, lines: "[ 32 - 39 ]", user: context.user.user_name });
                return new apolloServerExpress.ApolloError("error IT011101")
            }
        },
        getBoxs: async (obj, {ids}, context, info) => {
            try {
                return await Box.findAll({
                    where: {
                        id: {
                            [Sequelize.Op.in]: ids,
                        },
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "box", function: "Query type | getBoxs", error, lines: "[ 43 - 55 ]", user: context.user.user_name });
                return new apolloServerExpress.ApolloError("error IT011102")
            }
        },
        allBox: async (obj, {idStock}, context, info) => {
            try {
                return await Box.findAll({
                    where: {
                        id_stock: idStock,
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "box", function: "Query type | allBox", error, lines: "[ 43 - 55 ]", user: context.user.user_name });
                return new apolloServerExpress.ApolloError("error IT011102")
            }
        },
        boxClient: async (obj, {idClient}, context, info) =>  {
            try {
                return await Box.findAll({
                    where: {
                        id_client: idClient || "",
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "box", function: "Query type | boxClient", error, lines: "[ 57 - 69 ]", user: context.user.user_name });
                return new apolloServerExpress.ApolloError("error IT011103")
            }
        },
        boxInvoice: async (obj, {codeInvoice}, context, info) =>  {
            try {
                return await Box.findAll({
                    where: {
                        code_invoice: codeInvoice || "",
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "box", function: "Query type | boxInvoice", error, lines: "[ 71 - 83 ]", user: context.user.user_name });
                return new apolloServerExpress.ApolloError("error IT011103")
            }
        },
        boxInvoiceDriver: async (obj, {codeInvoice}, context, info) =>  {
            try {
                return await Box.findAll({
                    where: {
                        code_driver_commission: codeInvoice || "",
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "box", function: "Query type | boxInvoiceDriver", error, lines: "[ 71 - 83 ]", user: context.user.user_name });
                return new apolloServerExpress.ApolloError("error IT011103")
            }
        },
        boxInvoiceDriverPickUp: async (obj, {codeInvoice}, context, info) =>  {
            try {
                return await Box.findAll({
                    where: {
                        cd_commission_pickup: codeInvoice || "",
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "box", function: "Query type | boxInvoiceDriverPickUp", error, lines: "[ 71 - 83 ]", user: context.user.user_name });
                return new apolloServerExpress.ApolloError("error IT011103")
            }
        },

        boxEnvelope: async (obj, {codeEnvelope}, context, info) =>  {
            try {
                return await Box.findAll({
                    where: {
                        code_envelope: codeEnvelope || "",
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "box", function: "Query type | boxEnvelope", error, lines: "[ 85 - 98 ]", user: context.user.user_name });
                return new apolloServerExpress.ApolloError("error IT011103")
            }
        },
        boxDriver: async (obj, {idDriver}, context, info) =>  {
            try {
                if(!idDriver || idDriver == "") {
                    return []
                }

                return await DB.query(`
                    SELECT box.id, box.recipient_name, box.recipient_phone1, box.recipient_phone2, box.recipient_city, 
                    box.recipient_address, box.recipient_loction, box.code_box, box.status_box, box.command_number, box.payment_type, 
                    box.fragile, box.delivery_type, box.categorie, box.height_box, box.width_box, box.length_box, box.weight_box, 
                    box.price_box, box.price_delivery, box.TVA, box.note, box.id_stock, box.paid_in_office, box.possibility_open, 
                    box.encapsulation, box.code_invoice, box.code_envelope, box.id_driver, box.deleted, box.archived, 
                    box.createdAt, box.updatedAt, box.id_client FROM boxes box
                    INNER JOIN box_traces AS box_trace ON box_trace.id_box = box.id
                    WHERE box.id_driver = "${idDriver}" AND box.deleted = 0
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    AND box_trace.status IN (3,5,7,8,9,10,16,17,21,22,23,28,30,31,33,34)
                `, {type: Sequelize.QueryTypes.SELECT});
            } catch (error) {
                logger.error({ file: "box", function: "Query type | boxDriver", error, lines: "[ 99 - 122 ]", user: context.user.user_name });
                return new apolloServerExpress.ApolloError("error IT011103")
            }
        },
        profileClient: async (obj, {idClient}, context, info) =>  {
            try {
                const boxs = await Box.findAll({
                    where: {
                        id_client: idClient || "",
                        deleted: false,
                        status_box: {
                            [Sequelize.Op.notIn]: [10, 11, 12, 13]
                        }
                    }
                });

                const amountsUnderCollection = await Box.findAll({
                    where: {
                        id_client: idClient || "",
                        deleted: false,
                        status_box: {
                            [Sequelize.Op.notIn]: [10, 11]
                        }
                    }
                });

                const amountsCollected = await Box.findAll({
                    where: {
                        id_client: idClient || "",
                        deleted: false,
                        status_box: 12
                    }
                });

                return {
                    boxs: boxs,
                    amountsUnderCollection,
                    amountsCollected
                }
            } catch (error) {
                logger.error({ file: "box", function: "Query type | profileClient", error, lines: "[ 123 - 163 ]", user: context.user.user_name });
                return new apolloServerExpress.ApolloError("error IT011104")
            }
        },
        openEnvelopeCity: async (obj, {idStock}, context, info) => {
            try {
                const moneyCity = await DB.query(`
                    SELECT box.id_stock, person.city, box.code_envelope AS "codeEnvelope", SUM(box.price_box + box.price_delivery) AS 'totalMouny', COUNT(box.id) AS 'numberBox'
                    FROM boxes box
                    INNER JOIN clients AS client ON client.id = box.id_client
                    INNER JOIN person AS person ON person.id = client.id_person
                    INNER JOIN box_traces AS box_trace ON box_trace.id_box = box.id
                    WHERE box.id_stock = "${idStock}" AND box.deleted = 0 AND box.code_envelope = "0"
                    AND box_trace.id = ( SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1 )
                    AND box_trace.status = 11
                    GROUP BY person.city
                `, {type: Sequelize.QueryTypes.SELECT});

                return moneyCity
            } catch (e) {
                logger.error({ file: "box", function: "Query type | openEnvelopeCity", error, lines: "[ 164 - 183 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT011105")
            }
        },
        closeEnvelopeCity: async (obj, {idStock}, context, info) => {
            try {
                const moneyCity = await DB.query(`
                    SELECT box.id_stock, person.city, box.code_envelope AS "codeEnvelope", SUM(box.price_box + box.price_delivery) AS 'totalMouny', COUNT(box.id) AS 'numberBox'
                    FROM boxes box
                    INNER JOIN clients AS client ON client.id = box.id_client
                    INNER JOIN person AS person ON person.id = client.id_person
                    INNER JOIN box_traces AS box_trace ON box_trace.id_box = box.id
                    WHERE box.id_stock = "${idStock}" AND box.deleted = 0 AND box.code_envelope != "0"
                    AND box_trace.id = ( SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1 )
                    AND box_trace.status = 11
                    GROUP BY box.code_envelope
                `, {type: Sequelize.QueryTypes.SELECT});

                // console.log("moneyCity ", moneyCity)

                return moneyCity
            } catch (error) {
                logger.error({ file: "box", function: "Query type | closeEnvelopeCity", error, lines: "[ 184 - 205 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT011106")
            }
        },
        readyEnvelopeCity: async (obj, {idStock}, context, info) => {
            try {
                const moneyCity = await DB.query(`
                    SELECT box.id_stock, person.city, box.code_envelope AS "codeEnvelope", SUM(box.price_box + box.price_delivery) AS 'totalMouny', COUNT(box.id) AS 'numberBox'
                    FROM boxes box
                    INNER JOIN clients AS client ON client.id = box.id_client
                    INNER JOIN person AS person ON person.id = client.id_person
                    INNER JOIN box_traces AS box_trace ON box_trace.id_box = box.id
                    WHERE box.id_stock = "${idStock}" AND box.deleted = 0 AND box.code_envelope != "0"
                    AND box_trace.id = ( SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1 )
                    AND box_trace.status = 12
                    GROUP BY box.code_envelope
                `, {type: Sequelize.QueryTypes.SELECT});

                //console.log("moneyCity ", moneyCity)

                return moneyCity
            } catch (error) {
                logger.error({ file: "box", function: "Query type | readyEnvelopeCity", error, lines: "[ 206 - 227 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT011107")
            }
        },
        deliveryEnvelopeCity: async (obj, {idStock}, context, info) => {
            try {
                const moneyCity = await DB.query(`
                    SELECT box.id_stock, person.city, box.code_envelope AS "codeEnvelope", SUM(box.price_box + box.price_delivery) AS 'totalMouny', COUNT(box.id) AS 'numberBox'
                    FROM boxes box
                    INNER JOIN clients AS client ON client.id = box.id_client
                    INNER JOIN person AS person ON person.id = client.id_person
                    INNER JOIN box_traces AS box_trace ON box_trace.id_box = box.id
                    WHERE box.id_stock = "${idStock}" AND box.deleted = 0 AND box.code_envelope != "0"
                    AND box_trace.id = ( SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1 )
                    AND box_trace.status = 10
                    GROUP BY box.code_envelope
                `, {type: Sequelize.QueryTypes.SELECT});

                return moneyCity
            } catch (error) {
                logger.error({ file: "box", function: "Query type | deliveryEnvelopeCity", error, lines: "[ 228 - 247 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT011108")
            }
        },
        listPickUpClient: async (obj, { idClient }, context, info) => {
            try {
                const list = await Box.findAll({
                    attributes: [[Sequelize.col("code_pick_up"), "code"], [Sequelize.literal(`COUNT(box.id)`), "numberBox"], [Sequelize.col("box_traces.status"), "status"], [Sequelize.col("box_traces.createdAt"), "createdAt"]],
                    where: {
                        id_client: idClient,
                        deleted: false,
                        code_pick_up: {
                            [Sequelize.Op.not]: ""
                        },
                        "$box_traces.status$": {
                            [Sequelize.Op.in]: [2, 3]
                        },
                        "$box_traces.id$": {
                            [Sequelize.Op.eq]: Sequelize.literal(`(
                                SELECT id FROM box_traces WHERE id_box = box.id
                                ORDER BY createdAt DESC LIMIT 1
                            )`)
                        }
                    },
                    include: {
                        model: BoxTrace,
                        as: "box_traces",
                        required: true,
                        right: true
                    },
                    group: "code_pick_up"
                });

                let listPickUp = [];

                for (let i = 0; i < list.length; i++) {
                    listPickUp.push(list[i]["dataValues"]);
                }

                return listPickUp
            } catch (error) {
                logger.error({ file: "box", function: "Query type | listPickUpClient", error, lines: "[ 228 - 247 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT011108")
            }
        },
        deliveredDriverBox: async (obj, { idDriver }, context, info) => {
            try {
                const driver = await Factor.findByPk(idDriver);

                return await Box.findAll({
                    where: {
                        deleted: false,
                        "$box_traces.id$": {
                            [Sequelize.Op.eq]: Sequelize.literal(`(
                                SELECT id FROM box_traces WHERE id_box = box.id AND id_person = "${driver.id_person}"
                                AND status = 8 LIMIT 1
                            )`)
                        }
                    },
                    include: {
                        model: BoxTrace,
                        as: "box_traces",
                        required: true,
                        right: true,
                        attributes: []
                    }
                })
            } catch (error) {
                logger.error({ file: "box", function: "Query type | deliveredDriverBox", error, lines: "[ 228 - 247 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT011108")
            }
        },

        pickedUpBox: async (obj, { idDriver }, context, info) => {
            try {
                const driver = await Factor.findOne({
                    attributes: ["id", "id_person"],
                    where: {
                        id: idDriver
                    }
                });

                return await Box.findAll({
                    where: {
                        deleted: false,
                        "$box_traces.id$": {
                            [Sequelize.Op.eq]: Sequelize.literal(`(
                                SELECT id FROM box_traces WHERE id_box = box.id AND id_person = "${driver.id_person}"
                                AND status = 3 LIMIT 1
                            )`)
                        }
                    },
                    include: {
                        model: BoxTrace,
                        as: "box_traces",
                        required: true,
                        right: true,
                        attributes: []
                    }
                })
            } catch (error) {
                logger.error({ file: "box", function: "Query type | pickedUpBox", error, lines: "[ 228 - 247 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT011108")
            }
        },
    },

    Box: {
        stock: async (obj, args, context, info) => {
            try {
                return await Stock.findByPk(obj.id_stock)
            } catch (error) {
                logger.error({ file: "box", function: "Box type | stock", error, lines: "[ 251 - 259 ]", user: context.user.user_name });
                return new apolloServerExpress.ApolloError("error IT012201")
            }
        },
        client: async (obj, args, context, info) => {
            try {
                return await Client.findByPk(obj.id_client);
            } catch (error) {
                logger.error({ file: "box", function: "Box type | client", error, lines: "[ 260 - 268 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT012202")
            }
        },
        lastTrace: async (obj, args, context, info) => {
            try {
                return await BoxTrace.findAll({
                    where: {
                        id_box: obj.id,
                        deleted: false
                    },
                    order: [['createdAt', 'DESC']],
                    limit: 1
                })
            } catch (error) {
                logger.error({ file: "box", function: "Box type | lastTrace", error, lines: "[ 269 - 284 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT012203")
            }
        },
        traceBox: async (obj, args, context, info) => {
            try {
                return await BoxTrace.findAll({
                    where: {
                        id_box: obj.id,
                        deleted: false
                    },
                    order: [['createdAt', 'DESC']]
                })
            } catch (error) {
                logger.error({ file: "box", function: "Box type | traceBox", error, lines: "[ 285 - 299 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT012204")
            }
        },
    },

    Mutation: {
        trackBox: async (obj, {codeBox}, context, info) => {
            try {
                return await Box.findOne({
                    where: {
                        code_box: codeBox
                    }
                })
            } catch (error) {
                logger.error({ file: "box", function: "Mutation type | trackBox", error, lines: "[ 303 - 315 ]"});
                return new apolloServerExpress.ApolloError("error IT011101")
            }
        },

        createBox: async (obj, {content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }
            try {
                let stock = await Stock.findByPk(content.id_stock, {
                    include: {
                        model: Company,
                        as: "company",
                        required: true,
                        right: true,
                        attributes: ["id", "points", "email", "return_price"]
                    }
                });

                const pointsCompany = stock["dataValues"].company.points;

                if (pointsCompany == 0) {
                    let company = await Company.update({
                        lastDateEmptyPoints: new Date()
                    }, {
                        where: { id: stock.id_company }
                    });
                    await createEmptyPoints({
                        to: stock["dataValues"].company.email
                    });
                    //return new ApolloError("You don't have points until you do this process", "BALANCE_EMPTY")
                }

                let box = await Box.create({
                    ...content,
                    code_box: `Qaf-${uid$3(7)}`,
                    price_return: stock["dataValues"].company.return_price
                });

                let id_box = box.id;

                let boxTrace = await BoxTrace.create({
                    status:         content.status_box,
                    note:           content.note,
                    id_stock:       content.id_stock,
                    id_person:      content.id_person,
                    validation:     true,
                    id_box:         id_box
                });

                let person = await Person.findOne({
                    where: {
                        id: boxTrace.id_person
                    }
                });

                
                let clientBox = await getClientBox(box.id_client);

                const boxOne = await Box.findOne({
                    attributes: ["id", "recipient_city", "price_box", "recipient_name", "createdAt", "archived", "code_box", [Sequelize.col("client->person->user.id"), "id_user"]],
                    where: {
                        id: id_box
                    },
                    include: {
                        model: Client,
                        as: "client",
                        required:true,
                        right: true,
                        include: {
                            model: Person,
                            as: "person",
                            required:true,
                            right: true,
                            include: {
                                model: User,
                                as: "user",
                                required:false,
                                right: false
                            }
                        }
                    }
                });

                const userClient = clientBox.client[0]["dataValues"].person.user ? clientBox.client[0]["dataValues"].person.user.id : 0;

                if (boxOne) {
                    try {
                        await exports.socket.sendNewData(userClient, content.id_stock, {
                            ...boxOne["dataValues"],
                            lastTrace: [{
                                ...boxTrace["dataValues"],
                                person: person["dataValues"],
                                stock: stock["dataValues"]
                            }],
                            ...clientBox
                        });
                        console.log("createBox.sendNewData ======================================================> ");
                    } catch (error) {
                        console.log(error);
                    }
                }
                let company = await Company.decrement('points', {
                    where: { id: stock.id_company }
                });

                let allStock = await Stock.findAll({
                    attributes: ["id"],
                    where: {
                        id_company: stock.id_company
                    }
                });
                await exports.socket.sendNewPoints(allStock, {points: pointsCompany - 1});

                return box;
            } catch (error) {
                logger.error({ file: "box", function: "Mutation type | createBox", error, lines: "[ 317 - 427 ]", user: context.user.user_name });
                return new apolloServerExpress.ApolloError("error IT013301")
            }
        },

        updateBox: async (obj, {id, content, noteTrace}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }

            try {
                let result = await Box.update(content, { where: { id: id } });

                // if (result[0] === 1) {
                //     pubsub.publish('BOX_UPDATED', { boxUpdated: boxTrace["dataValues"] });
                // }

                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "box", function: "Mutation type | updateBox", error, lines: "[ 429 - 451 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT013302")
            }
        },

        deleteBox: async (obj, {id}, context, info) => {
            try {
                let result = await Box.update({deleted: true}, { where: { id } });
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "box", function: "Mutation type | deleteBox", error, lines: "[ 453 - 464 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT013303")
            }
        },

        archiveBox: async (obj, {id}, context, info) => {
            try {
                const PAYMENT_TYPE = 'مدفوع';
                const TRACE_DELIVERED = 'تم التسليم';
                const TRACE_CHARGED = 'تمت محاسبة المندوب';
                const TRACE_PAID = "تم الدفع للعميل";


                let box = await Box.findByPk(id);

                if (box.price_box === 0) {
                    if (box.payment_type === PAYMENT_TYPE) {
                        return {
                            status: await archivedBox(id, TRACE_DELIVERED)
                        }
                    } else {
                        return {
                            status: await archivedBox(id, TRACE_CHARGED)
                        }
                    }
                } else {
                    return {
                        status: await archivedBox(id, TRACE_PAID)
                    }
                }
            } catch (error) {
                logger.error({ file: "box", function: "Mutation type | archiveBox", error, lines: "[ 466 - 496 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT013304")
            }
        },

        addEnvelopeCode: async (obj, {idStock, city}, context, info) => {
            try {
                const codeInvoice = `Env-${uid$3(7)}`;
                const moneyCity = await DB.query(`
                    UPDATE boxes AS box
                        INNER JOIN (
                            SELECT box.id, box.id_stock, person.city, box.code_envelope FROM boxes box
                            INNER JOIN clients AS client ON client.id = box.id_client
                            INNER JOIN person AS person ON person.id = client.id_person
                            INNER JOIN box_traces AS box_trace ON box_trace.id_box = box.id
                            WHERE box.id_stock = "${idStock}" 
                                AND box.deleted = 0 AND box.code_envelope = "0"
                                AND box_trace.id = ( 
                                    SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1 
                                )
                                AND box_trace.status = 11 AND person.city = "${city}"
                       ) AS SelectedBoxes ON SelectedBoxes.id = box.id
                    SET box.code_envelope = "${codeInvoice}"
                `, {type: Sequelize.QueryTypes.UPDATE});


                return {
                    codeEnvelope: moneyCity[1] > 0 ? codeInvoice : "0"
                }
            } catch (e) {
                logger.error({ file: "box", function: "Mutation type | addEnvelopeCode", error, lines: "[ 498 - 526 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError(e)
            }
        },

        deleteEnvelopeCode: async (obj, {idStock, codeEnvelope}, context, info) => {
            try {
                const deleteEnvelope = await Box.update({code_envelope: "0"}, { where: { code_envelope: codeEnvelope } });

                return {
                    codeEnvelope: deleteEnvelope[0] > 0 ? "0" : code_envelope
                }
            } catch (e) {
                logger.error({ file: "box", function: "Mutation type | deleteEnvelopeCode", error, lines: "[ 528 - 539 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError(e)
            }
        },

        driverCommission: async (obj, {idBoxes}, context, info) => {
            try {
                const boxes = await Box.update({
                    code_driver_commission: `DCom-${uid$3(7)}`
                }, {
                    where: {
                        id: {
                            [Sequelize.Op.in]: idBoxes
                        }
                    }
                });

                return {
                    status: boxes[0] > 0
                }
            } catch (e) {
                throw new apolloServerExpress.ApolloError(e)
            }
        },

        driverCommissionPickUp: async (obj, {idBoxes}, context, info) => {
            try {
                const boxes = await Box.update({
                    cd_commission_pickup: `DCom-${uid$3(7)}`
                }, {
                    where: {
                        id: {
                            [Sequelize.Op.in]: idBoxes
                        }
                    }
                });

                return {
                    status: boxes[0] > 0
                }
            } catch (e) {
                throw new apolloServerExpress.ApolloError(e)
            }
        }
    },
};

const archivedBox = async (id_box, status) => {
    const DATE_NOW = new Date();
    const DAY_IN_MILLISECONDS = 86400000;
    try {
        let traceBox = await BoxTrace.findOne({
            where: { id_box, deleted: false, status}
        });

        if (traceBox) {
            if (((DATE_NOW - traceBox.createdAt) / DAY_IN_MILLISECONDS) >= 2) {
                let result = await Box.update({archived: true}, { where: { id: id_box } });
                return result[0] === 1;
            } else {
                return new apolloServerExpress.ApolloError("You can't archive the box yet");
            }
        } else {
            return new apolloServerExpress.ApolloError("Box Not Finish delivered");
        }
    } catch (error) {
        logger.error({ file: "box", function: "archivedBox", error, lines: "[ 543 - 566 ]" });
        throw new apolloServerExpress.ApolloError("error IT014401")
    }
};

const getClientBox = async (id_client) => {
    let client = null;
    try {
        client = await Client.findOne({
            where: {
                id: id_client
            },
            include: {
                model: Person,
                as: "person",
                required: true,
                right: true,
                include: {
                    model: User,
                    as: "user",
                    required: false,
                    right: false,
                    attributes: ["id", "id_person"]
                }
            }
        });
    } catch (error) {
        logger.error({ file: "box", function: "getClientBox", error, lines: "[ 568 - 597 ]" });
        throw new apolloServerExpress.ApolloError(error)
    }

    return {
        client: [client]
    }
};

const {col: col$1, QueryTypes} = Sequelize;

Joi.object({
    status:      Joi.string().min(4).max(50).required(),
    note:        Joi.string().min(0).max(50),
    id_stock:    Joi.string().min(0).max(50).required(),
    id_person:   Joi.string().min(0).max(50).required(),
    id_box:      Joi.string().min(0).max(50).required()
});

const resolvers$d = {

    Query: {
        boxTrace:    async (obj, args, context, info) => {
            try {
                return await BoxTrace.findAll({
                    where: {
                        id_box: args.idBox
                    }
                })
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Query type | boxTrace", error, lines: "[ 20 - 31 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT021101")
            }
        },
        lastTraceBox: async (obj, args, context, info) => {
            try {
                return await BoxTrace.findAll({
                    where: {
                        id_box: args.idBox
                    },
                    order: [['createdAt', 'DESC']],
                    limit: 1
                })
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Query type | lastTraceBox", error, lines: "[ 32 - 45 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT021102")
            }
        },
    },

    BoxTrace: {
        stock: async (obj, args, context, info) => {
            try {
                return await Stock.findByPk(obj.id_stock)
            } catch (error) {
                logger.error({ file: "boxTrace", function: "BoxTrace type | stock", error, lines: "[ 49 - 56 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT022201")
            }
        },
        person: async (obj, args, context, info) => {
            try {
                return await Person.findByPk(obj.id_person)
            } catch (error) {
                logger.error({ file: "boxTrace", function: "BoxTrace type | person", error, lines: "[ 57 - 64 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT022202")
            }
        },
        box: async (obj, args, context, info) =>  {
            try {
                return await Box.findByPk(obj.id_box)
            } catch (error) {
                logger.error({ file: "boxTrace", function: "BoxTrace type | box", error, lines: "[ 65 - 72 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT022203")
            }
        },
    },

    Mutation: {
        createBoxTrace: async (obj, {content}, context, info) => {
            try {
                const trace = await BoxTrace.create(content);

                if (trace !== null) {
                    const box = await Box.findOne({
                        attributes: ["recipient_name", "code_box", "id_stock"],
                        where: {
                            id: content.id_box
                        },
                        include: {
                            model: Client,
                            as: "client",
                            required:true,
                            right: true,
                            include: {
                                model: Person,
                                as: "person",
                                required:true,
                                right: true
                            }
                        }
                    });

                    if (content.status == 2) {
                        await Box.update({
                            code_pick_up: `Pic-${uid(7)}`,
                            status_box: content.status,
                            id_stock: content.id_stock
                        }, {where: {id: content.id_box}});
                    } else if (content.status == 3) {
                        const [box] = await DB.query(`
                            SELECT stock.id_company AS "idCompany" FROM boxes box
                            INNER JOIN stocks stock ON stock.id = box.id_stock
                            WHERE box.id = '${content.id_box}'
                        `, {type: QueryTypes.SELECT});

                        const pricePickUp = await getPriceRange(box.idCompany, 1);

                        await Box.update({
                            price_pick_up: pricePickUp,
                            status_box: content.status,
                            id_stock: content.id_stock
                        }, {where: {id: content.id_box}});
                    } else {
                        await Box.update({
                            status_box: content.status,
                            id_stock: content.id_stock
                        }, {where: {id: content.id_box}});
                    }

                    let userCleint = await User.findOne({where: {id_person: box.client.person.id}});

                    let listRome = [box.id_stock];
                    if(box.id_stock !== content.id_stock) {
                        listRome.push(content.id_stock);
                    }

                    if (box !== null) {
                        await exports.socket.sendNewTrace(userCleint ? userCleint.id : "", listRome, {
                            ...trace["dataValues"],
                            box: box["dataValues"]
                        });
                    }
                }

                return trace
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Mutation type | createBoxTrace", error, lines: "[ 76 - 126 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT023301")
            }
        },

        addBoxToPickUpGroup: async (obj, {codePickUp, content}, context, info) => {
            try {
                let listTrace = [];
                const code_pick = codePickUp;

                const stock = await Stock.findOne({
                    where: {
                        id_company: content.id_company,
                        id: content.id_stock
                    }
                });

                if (stock == null) {
                    return new apolloServerExpress.ApolloError("This stock not belong company", "STOCK_NOT_COMPANY");
                }

                for (let index = 0; index < content.boxTrace.length; index++) {
                    let date = new Date().getTime() + (1000*index);
                    const trace = await BoxTrace.create({
                        status:    content.boxTrace[index].status,
                        note:      content.note,
                        id_stock:  content.id_stock,
                        id_person: content.id_person,
                        id_box:    content.boxTrace[index].id_box,
                        createdAt: new Date(date)
                    });

                    listTrace.push(trace);

                    if (trace !== null) {
                        const oldBox = await Box.findOne({
                            attributes: ["id_stock"],
                            where: {
                                id: content.boxTrace[index].id_box
                            }
                        });

                        await Box.update({
                            code_pick_up: code_pick,
                            status_box: content.boxTrace[index].status,
                            id_stock: content.id_stock
                        }, {where: {id: content.boxTrace[index].id_box}});

                        const box = await Box.findOne({
                            attributes: ["recipient_name", "code_box", "id_driver", "id_stock", [col$1("client->person->user.id"), "id_user"]],
                            where: {
                                id: content.boxTrace[index].id_box
                            },
                            include: {
                                model: Client,
                                as: "client",
                                required:true,
                                right: true,
                                include: {
                                    model: Person,
                                    as: "person",
                                    required:true,
                                    right: true,
                                    include: {
                                        model: User,
                                        as: "user",
                                        required:true,
                                        right: true
                                    }
                                }
                            }
                        });

                        let listRome = [oldBox.id_stock];
                        if(box.id_stock !== oldBox.id_stock) {
                            listRome.push(box.id_stock);
                        }

                        if (box !== null) {
                            await exports.socket.sendNewTrace(
                                box["dataValues"].id_user,
                                listRome,
                                {...trace["dataValues"], box: box["dataValues"]},
                                0
                            );
                        }
                    }
                }

                return listTrace
            } catch (error) {
                throw new apolloServerExpress.ApolloError(error)
            }
        },

        createMultiTrace: async (obj, {content}, context, info) => {
            try {
                let listTrace = [];
                const code_pick = `Pic-${uid(7)}`;

                const stock = await Stock.findOne({
                    where: {
                        id_company: content.id_company,
                        id: content.id_stock
                    }
                });

                if (stock == null) {
                    return new apolloServerExpress.ApolloError("This stock not belong company", "STOCK_NOT_COMPANY");
                }

                //const codeInvoice = `Inv-${generator({chars: '0-9'}).generate(7)}`

                for (let index = 0; index < content.boxTrace.length; index++) {
                    let date = new Date().getTime() + (1000*index);
                    const trace = await BoxTrace.create({
                        status:    content.boxTrace[index].status,
                        note:      content.note,
                        id_stock:  content.id_stock,
                        id_person: content.id_person,
                        id_box:    content.boxTrace[index].id_box,
                        createdAt: new Date(date)
                    });

                    listTrace.push(trace);

                    if (trace !== null) {
                        const oldBox = await Box.findOne({
                            attributes: ["id_stock"],
                            where: {
                                id: content.boxTrace[index].id_box
                            }
                        });

                        let user = null;
                        if ([3, 5, 7, 10, 16, 17, 21, 22].includes(content.boxTrace[index].status)) {
                            const factor = await Factor.findOne({where: {id_person: content.id_person}});
                            user = await User.findOne({where: {id_person: content.id_person}});

                            if (content.boxTrace[index].status == 3) {
                                const priceRange = await getPriceRange(content.id_company, content.boxTrace.length);
                                const pricePickUp = priceRange / content.boxTrace.length || 0;

                                console.log("pricePickUp ", priceRange, pricePickUp);

                                await Box.update({
                                    price_pick_up: pricePickUp,
                                    status_box: content.boxTrace[index].status,
                                    id_driver: factor ? factor.id : ""
                                }, {where: {id: content.boxTrace[index].id_box} });
                            } else {

                                await Box.update({
                                    status_box: content.boxTrace[index].status,
                                    id_driver: factor ? factor.id : ""
                                }, {where: {id: content.boxTrace[index].id_box} });
                            }
                        } else {
                            if (content.boxTrace[index].status == 2) {
                                await Box.update({
                                    code_pick_up: code_pick,
                                    status_box: content.boxTrace[index].status,
                                    id_stock: content.id_stock
                                }, {where: {id: content.boxTrace[index].id_box}});
                            } else {
                                await Box.update({
                                    status_box: content.boxTrace[index].status,
                                    id_stock: content.id_stock
                                }, {where: {id: content.boxTrace[index].id_box }});
                            }
                        }

                        const box = await Box.findOne({
                            attributes: ["recipient_name", "code_box", "id_driver", "id_stock"],
                            where: {
                                id: content.boxTrace[index].id_box
                            },
                            include: {
                                model: Client,
                                as: "client",
                                required:true,
                                right: true,
                                include: {
                                    model: Person,
                                    as: "person",
                                    required:true,
                                    right: true
                                }
                            }
                        });

                        if ([4, 11, 12].includes(content.boxTrace[index].status)) {
                            const factor = await Factor.findOne({where: {id: box.id_driver}});

                            await Box.update({
                                status_box: content.boxTrace[index].status,
                                id_driver: ""
                            }, {where: {id: content.boxTrace[index].id_box} });
                            if (factor) {
                                user = await User.findOne({where: {id_person: factor.id_person}});
                            }
                        }

                        if ([9].includes(content.boxTrace[index].status)) {
                            const factor = await Factor.findOne({where: {id: box.id_driver}});

                            if (factor) {
                                user = await User.findOne({where: {id_person: factor.id_person}});
                            }
                        }

                        let userCleint = await User.findOne({where: {id_person: box.client.person.id}});

                        let listRome = [oldBox.id_stock];
                        if(box.id_stock !== oldBox.id_stock) {
                            listRome.push(box.id_stock);
                        }

                        if (box !== null) {
                            await exports.socket.sendNewTrace(
                                userCleint ? userCleint.id : "",
                                listRome,
                                {...trace["dataValues"], box: box["dataValues"]},
                                user ? user.id : 0
                            );
                        }
                    }
                }

                return listTrace
            } catch (error) {
                console.log("createMultiTrace ", error);
                logger.error({ file: "boxTrace", function: "Mutation type | createMultiTrace", error, lines: "[ 128 - 244 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT023302")
            }
        },

        createInvoiceTrace: async (obj, {content}, context, info) => {
            try {
                const {idS, status, note, id_stock, id_person} = content;

                let listTrace = [];

                const codeInvoice = `Inv-${uid(7)}`;

                for (let index = 0; index < idS.length; index++) {
                    const trace = await BoxTrace.create({
                        status:    status,
                        note:      note,
                        id_stock:  id_stock,
                        id_person: id_person,
                        id_box:    idS[index]
                    });

                    listTrace.push(trace);

                    if (trace !== null) {
                        await Box.update({
                            status_box: status,
                            code_invoice: codeInvoice,
                            id_stock: id_stock
                        }, {where: {id: idS[index]}});

                        const box = await Box.findOne({
                            attributes: ["recipient_name", "code_box", [col$1("client->person->user.id"), "id_user"]],
                            where: {
                                id: idS[index]
                            },
                            include: {
                                model: Client,
                                as: "client",
                                required:true,
                                right: true,
                                include: {
                                    model: Person,
                                    as: "person",
                                    required:true,
                                    right: true,
                                    include: {
                                        model: User,
                                        as: "user",
                                        required:true,
                                        right: true
                                    }
                                }
                            }
                        });
                        if (box !== null) {
                            await exports.socket.sendNewTrace(box["dataValues"].id_user, id_stock, {
                                ...trace["dataValues"],
                                box: box["dataValues"]
                            });
                        }
                    }
                }

                return listTrace
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Mutation type | createInvoiceTrace", error, lines: "[ 246 - 307 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT023303")
            }
        },

        updateTraceByCodeEnvelop: async (obj, {codeEnvelop, content}, context, info) => {
            try {
                const {status, note, id_stock, id_person} = content;

                let listTrace = [];

                const boxes = await Box.findAll({
                    attributes: ["id", "code_envelope"],
                    where: {
                        code_envelope: codeEnvelop
                    }
                });

                for (let index = 0; index < boxes.length; index++) {
                    const trace = await BoxTrace.create({
                        status:    status,
                        note:      note,
                        id_stock:  id_stock,
                        id_person: id_person,
                        id_box:    boxes[index].id
                    });

                    listTrace.push(trace);

                    if (trace !== null) {
                        await Box.update({
                            status_box: status,
                            id_stock: id_stock
                        }, {where: {id: boxes[index].id}});
                        const box = await Box.findOne({
                            attributes: ["recipient_name", "code_box", [col$1("client->person->user.id"), "id_user"]],
                            where: {
                                id: boxes[index].id
                            },
                            include: {
                                model: Client,
                                as: "client",
                                required:true,
                                right: true,
                                include: {
                                    model: Person,
                                    as: "person",
                                    required:true,
                                    right: true,
                                    include: {
                                        model: User,
                                        as: "user",
                                        required:true,
                                        right: true
                                    }
                                }
                            }
                        });
                        if (box !== null) {
                            await exports.socket.sendNewTrace(box["dataValues"].id_user, id_stock, {
                                ...trace["dataValues"],
                                box: box["dataValues"]
                            });
                        }
                    }
                }

                return listTrace
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Mutation type | updateTraceByCodeEnvelop", error, lines: "[ 309 - 373 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT023304")
            }
        },

        updateBoxTrace: async (obj, {id, content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }

            try {
                let boxTrace = await BoxTrace.update(content, { where: { id } });
                return {
                    status: boxTrace[0] === 1 ? true : false
                }
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Mutation type | updateBoxTrace", error, lines: "[ 375 - 391 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT023305")
            }
        },

        deleteBoxTrace: async (obj, {id}, context, info) => {
            try {
                let boxTrace = await BoxTrace.update({deleted: true},{ where: { id } });
                return {
                    status: boxTrace[0] === 1
                }
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Mutation type | deleteBoxTrace", error, lines: "[ 393 - 403 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT023306")
            }
        },

        accountingFactor: async (obj, {content}, context, info) => {
            const TRACE_DELIVERED = 'تم التسليم';
            try {
                let traceBox = await BoxTrace.findOne({
                    where: { id_box: content.id_box, deleted: false, status: TRACE_DELIVERED}
                });

                if (traceBox) {
                    return await BoxTrace.create(content)
                }

                throw new apolloServerExpress.ApolloError("Box Not Finish delivered");
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Mutation type | accountingFactor", error, lines: "[ 405 - 421 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT023307")
            }
        }
    }
};

const getPriceRange = async (idCompany, numberBox) => {
    const listPlans = await PickUp.findAll({
        attributes: ["price", "number_box"],
        where: {
            id_company: idCompany,
            deleted: false
        },
        order: [['number_box', 'ASC']]
    });

    if (listPlans) {
        for (let i = 0; i < listPlans.length; i++) {
            if (numberBox <= listPlans[i].number_box) {
                return listPlans[i].price
            }
        }
    } else {
        return 0
    }
};

Joi.object({
    person: Joi.object({
        first_name:     Joi.string().min(3).max(50).required(),
        last_name:      Joi.string().min(3).max(50).required(),
        email:          Joi.string().email().max(50).required(),
        phone01:        Joi.string().min(10).max(15).required(),
        phone02:        Joi.string().max(15),
        address:        Joi.string().min(4).max(50).required(),
        id_stock:       Joi.string().min(0).max(50).required()
    })
});

const resolvers$c = {

    Query: {
        client: async (obj, args, context, info) => {
            try {
                return await Client.findByPk(args.id)
            } catch (error) {
                logger.error({ file: "client", function: "Query type | client", error, lines: "[ 22 - 29 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT031101")
            }
        },

        allClients: async (obj, {idStock}, context, info) => {
            try {
                return await Client.findAll({
                    where: {deleted:  false},
                    include: {
                        model: Person,
                        as: 'person',
                        required: true,
                        right: true,
                        where: {deleted:  false},
                        include: {
                            model: StockAccess,
                            as: 'stock_accesses',
                            required: true,
                            right: true,
                            where: {
                                id_stock: idStock
                            },
                        }
                    }
                })
            } catch (error) {
                logger.error({ file: "client", function: "Query type | allClients", error, lines: "[ 31 - 56 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT031102")
            }
        },

        currentClient: async (obj, args, {isAuth, user}, info) => {
            try {
                if (isAuth) {
                    let cleint = await Client.findOne({
                        where: {id_person: user.id_person}
                    });
                    return cleint
                }
                return "You must be the authenticated user to get this information";
            } catch (error) {
                logger.error({ file: "client", function: "Query type | currentClient", error, lines: "[ 58 - 71 ]", user: user.user_name });
                throw new apolloServerExpress.ApolloError("error IT031103")
            }
        },

        statisticsClient: async (obj, {idClient}, context, info) => {
            try {
                const numberAllBox = await Box.count({
                    where: { id_client: idClient, deleted: false }
                });

                const numberAllBoxArchived = await Box.count({
                    where: { id_client: idClient, deleted: false, archived: true  }
                });

                const numberAllBoxNotArchived = await Box.count({
                    where: { id_client: idClient, deleted: false, archived: false }
                });

                const numberClassicBox = await Box.count({
                    where: {
                        id_client: idClient,
                        deleted: false,
                        price_box: 0
                    }
                });

                const numberClassicBoxArchived = await Box.count({
                    where: {
                        id_client: idClient,
                        deleted: false,
                        archived: true
                    }
                });

                const numberClassicBoxNotArchived = await Box.count({
                    where: {
                        id_client: idClient,
                        deleted: false,
                        archived: false
                    }
                });

                const numberCommercialBox = await Box.count({
                    where: {
                        id_client: idClient,
                        deleted: false,
                        price_box: {
                            [Sequelize.Op.gt]: 0
                        }
                    }
                });

                const numberCommercialBoxArchived = await Box.count({
                    where: {
                        id_client: idClient,
                        deleted: false,
                        archived: true,
                        price_box: {
                            [Sequelize.Op.gt]: 0
                        }
                    }
                });

                const numberCommercialBoxNotArchived = await Box.count({
                    where: {
                        id_client: idClient,
                        deleted: false,
                        archived: false,
                        price_box: {
                            [Sequelize.Op.gt]: 0
                        }
                    }
                });

                const moneyReadyReceive = await DB.query(`
                    SELECT box.id_client, COALESCE(SUM(box.price_box - (box.price_box * (box.TVA / 100))), 0) AS "total", COALESCE(
                        (SELECT SUM(box.price_delivery) FROM boxes box
                            INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                            WHERE box.deleted = 0 AND box.price_box > 0 AND box.id_client = "${idClient}"
                            AND box_trace.status = 12 AND box.payment_type = "free"
                            AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1) 
                            GROUP BY box.id_client ), 0
                        ) AS "priceDeliveryFree"
                    
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0 AND box.price_box > 0
                    AND box.id_client = "${idClient}"
                    AND box_trace.status = 12
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_client
                `, {type: Sequelize.QueryTypes.SELECT});

                const totalAmountDelivered = await DB.query(`
                    SELECT box.id_client, SUM(box.price_delivery) AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0
                    AND box.id_client = "${idClient}"
                    AND box_trace.status >= 8 AND box_trace.status <= 13
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_client
                `, {type: Sequelize.QueryTypes.SELECT});

                const totalPrepaid = await DB.query(`
                    SELECT box.id_client, SUM(box.price_delivery) AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0
                    AND box.id_client = "${idClient}"
                    AND box.paid_in_office = 1
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_client
                `, {type: Sequelize.QueryTypes.SELECT});

                const totalAmountTax = await DB.query(`
                    SELECT box.id_client, SUM(box.price_box * (box.TVA / 100)) AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0 AND box.price_box > 0
                    AND box.id_client = "${idClient}"
                    AND box_trace.status >= 8 AND box_trace.status <= 13
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_client
                `, {type: Sequelize.QueryTypes.SELECT});

                const totalAmountCancelled = await DB.query(`
                    SELECT box.id_client, COALESCE(SUM(box.price_return), 0)  AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0
                        AND box.id_client = "${idClient}"
                        AND box_trace.status = 18
                        AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_client
                `, {type: Sequelize.QueryTypes.SELECT});

                const moneyStock = await DB.query(`
                    SELECT box.id_client, COALESCE(SUM(box.price_box), 0) AS "total", COALESCE(
                        (SELECT SUM(box.price_delivery) FROM boxes box
                            INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                            WHERE box.deleted = 0 AND box.price_box > 0 AND box.id_client = "${idClient}"
                            AND box_trace.status = 11 AND box.payment_type = "free"
                            AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1) 
                            GROUP BY box.id_client ), 0
                        ) AS "priceDeliveryFree"
                    
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0 AND box.price_box > 0
                    AND box.id_client = "${idClient}"
                    AND box_trace.status = 11
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_client
                `, {type: Sequelize.QueryTypes.SELECT});

                const moneyDriver = await DB.query(`
                    SELECT box.id_client, COALESCE(SUM(box.price_box), 0) AS "total", COALESCE(
                        (SELECT SUM(box.price_delivery) FROM boxes box
                            INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                            WHERE box.deleted = 0 AND box.price_box > 0 AND box.id_client = "${idClient}"
                            AND box_trace.status = 10 AND box.payment_type = "free"
                            AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1) 
                            GROUP BY box.id_client ), 0
                        ) AS "priceDeliveryFree"
                    
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0 AND box.price_box > 0
                    AND box.id_client = "${idClient}"
                    AND box_trace.status = 10
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_client
                `, {type: Sequelize.QueryTypes.SELECT});

                const moneyReceived = await DB.query(`
                    SELECT box.id_client, COALESCE(SUM(box.price_box - (box.price_box * (box.TVA / 100))), 0) AS "total", COALESCE(
                        (SELECT SUM(box.price_delivery) FROM boxes box
                            INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                            WHERE box.deleted = 0 AND box.price_box > 0 AND box.id_client = "${idClient}"
                            AND box_trace.status = 13 AND box.payment_type = "free"
                            AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1) 
                            GROUP BY box.id_client ), 0
                        ) AS "priceDeliveryFree"
                    
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0 AND box.price_box > 0
                    AND box.id_client = "${idClient}"
                    AND box_trace.status = 13
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_client
                `, {type: Sequelize.QueryTypes.SELECT});

                const totalAmountPickUp = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_pick_up), 0)  AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0
                        AND box.id_client = "${idClient}"
                        AND box_trace.id = ( SELECT id FROM box_traces WHERE id_box = box.id AND status = 3 LIMIT 1 )
                    GROUP BY box.id_stock
                `, {type: Sequelize.QueryTypes.SELECT});

                const totalCommissions = (totalAmountDelivered.length > 0 ? totalAmountDelivered[0].total : 0)
                    + (totalAmountTax.length > 0 ? totalAmountTax[0].total : 0)
                    + (totalPrepaid.length > 0 ? totalPrepaid[0].total : 0)
                    + (totalAmountCancelled.length > 0 ? totalAmountCancelled[0].total : 0)
                    + (totalAmountPickUp.length > 0 ? totalAmountPickUp[0].total : 0);

                return {
                    clientID:                       idClient,
                    numberAllBox:                   numberAllBox,
                    numberAllBoxArchived:           numberAllBoxArchived,
                    numberAllBoxNotArchived:        numberAllBoxNotArchived,

                    numberClassicBox:               numberClassicBox,
                    numberClassicBoxArchived:       numberClassicBoxArchived,
                    numberClassicBoxNotArchived:    numberClassicBoxNotArchived,

                    numberCommercialBox:            numberCommercialBox,
                    numberCommercialBoxArchived:    numberCommercialBoxArchived,
                    numberCommercialBoxNotArchived: numberCommercialBoxNotArchived,

                    moneyDriver:        moneyDriver.length > 0 ? moneyDriver[0].total - moneyDriver[0].priceDeliveryFree : 0,
                    moneyStock:         moneyStock.length > 0 ? moneyStock[0].total - moneyStock[0].priceDeliveryFree : 0,
                    moneyReadyReceive:  moneyReadyReceive.length > 0 ? moneyReadyReceive[0].total - moneyReadyReceive[0].priceDeliveryFree : 0,
                    moneyReceived:      moneyReceived.length > 0 ? moneyReceived[0].total - moneyReceived[0].priceDeliveryFree  : 0,

                    totalCommissions:       totalCommissions,
                    totalAmountDelivered:   totalAmountDelivered.length > 0 ? totalAmountDelivered[0].total : 0,
                    totalAmountTax:         totalAmountTax.length > 0 ? totalAmountTax[0].total : 0,
                    totalPrepaid:           totalPrepaid.length > 0 ? totalPrepaid[0].total : 0,
                    totalAmountCancelled:   totalAmountCancelled.length > 0 ? totalAmountCancelled[0].total : 0,
                    totalAmountPickUp:      totalAmountPickUp.length > 0 ? totalAmountPickUp[0].total : 0
                }
            } catch (error) {
                logger.error({ file: "client", function: "Query type | statisticsClient", error, lines: "[ 73 - 290 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError(error)
            }
        }
    },

    Client: {
        person: async (obj, args, context, info) =>  {
            try {
                return Person.findByPk(obj.id_person)
            } catch (error) {
                logger.error({ file: "client", function: "Client type | person", error, lines: "[ 294 - 301 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT032201")
            }
        },
        user: async ({id_person}, args, context, info) =>  {
            try {
                return await User.findOne({
                    where: {id_person}
                })
            } catch (error) {
                logger.error({ file: "client", function: "Client type | user", error, lines: "[ 302 - 311 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT032202")
            }
        },
        stock_accesses: async ({id_person}, args, context, info) => {
            try {
                let stock = await StockAccess.findAll({
                    where: {id_person},
                    attributes:['id_stock']
                });

                return stock
            } catch (error) {
                logger.error({ file: "client", function: "Client type | stock_accesses", error, lines: "[ 312 - 324 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT032203")
            }
        },
    },

    ClientStatistics: {
        allStatus: async ({clientID}, args, context, info) => {
            try {
                let traces = await DB.query(`
                    SELECT box_trace.status, COUNT(box_trace.status) AS "count" FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0 AND box.id_client = "${clientID}"
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box_trace.status
                `, {
                    type: Sequelize.QueryTypes.SELECT
                });

                let traces_Co = await DB.query(`
                    SELECT box_trace.status, COUNT(box_trace.status) AS "count" FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0 AND box.id_client = "${clientID}" AND box.price_box > 0
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box_trace.status
                `, {
                    type: Sequelize.QueryTypes.SELECT
                });

                let allTraces = [];

                for (let i = 0; i < traces.length; i++) {
                    let trace = traces[i];
                    allTraces.push({
                        status: trace.status,
                        numberClassic: trace.count,
                        numberCommercial: 0
                    });
                }

                for (let i = 0; i < allTraces.length; i++) {
                    let trace = allTraces[i];
                    for (let j = 0; j < traces_Co.length; j++) {
                        let traceCo = traces_Co[j];
                        if (trace.status == traceCo.status) {
                            allTraces[i] = {
                                ...allTraces[i],
                                numberClassic: trace.numberClassic - traceCo.count,
                                numberCommercial: traceCo.count
                            };
                        }
                    }
                }

                return allTraces
            } catch (error) {
                logger.error({ file: "client", function: "ClientStatistics type | allStatus", error, lines: "[ 328 - 380 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT032204")
            }
        }
    },

    Mutation: {
        createClient: async (obj, {content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }
            try {
                let person = await Person.findOne({
                    where: {
                        [Sequelize.Op.or]: [
                            {email: content.person.email || ""},
                            {phone01: content.person.phone01 || ""}
                        ]
                    }
                });

                if (person !== null) {
                    if (person.email === content.person.email) {
                        return new apolloServerExpress.ApolloError('Email already exists', "EMAIL_EXIST")
                    } else {
                        return new apolloServerExpress.ApolloError('Phone already exists', "PHONE_EXIST")
                    }
                }

                person = await Person.create(content.person);

                let stock = await StockAccess.create({
                    id_person: person.id,
                    id_stock: content.person.id_stock
                });

                let client = await Client.create({
                    id_person: person.id
                });

                if (client) {
                    return client
                }

            } catch (error) {
                logger.error({ file: "client", function: "Mutation type | createClient", error, lines: "[ 384 - 427 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT033301")
            }
        },

        updateClient: async (obj, {id_person, content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }
            try {
                let person = await Person.update(content.person, { where: { id: id_person } });

                return {
                    status: person[0] === 1
                }

            } catch (error) {
                logger.error({ file: "client", function: "Mutation type | updateClient", error, lines: "[ 429 - 446 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT033302")
            }
        },

        deleteClient: async (obj, {id_person}, context, info) => {
            try {
                let result = await Client.update({deleted: true},{ where: { id_person } });
                return {
                    status: result[0] === 1 ? true : false
                }
            } catch (error) {
                logger.error({ file: "client", function: "Mutation type | deleteClient", error, lines: "[ 448 - 458 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT033303")
            }
        }
    }
};

Joi.object({
    department: Joi.string().max(50),
    person: Joi.object({
        first_name:     Joi.string().min(3).max(50).required(),
        last_name:      Joi.string().min(3).max(50).required(),
        email:          Joi.string().email().max(50).required(),
        phone01:        Joi.string().min(10).max(15).required(),
        phone02:        Joi.string().max(15),
        address:        Joi.string().min(4).max(50).required(),
        id_stock:       Joi.string().min(0).max(50).required()
    })
});

const resolvers$b = {

    Query: {
        factor: async (obj, args, context, info) => {
            try {
                return await Factor.findByPk(args.id)
            } catch (error) {
                logger.error({ file: "Factor", function: "Query type | factor", error, lines: "[ 23 - 30 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT051101")
            }
        },

        allFactors: async (obj, {idStock}, context, info) => {
            try {
                const allFactors = await Factor.findAll({
                    where: {
                        deleted: false
                    },
                    include: {
                        model: Person,
                        as: 'person',
                        required: true,
                        right: true,
                        where: {deleted: false},
                        include: {
                            model: StockAccess,
                            as: 'stock_accesses',
                            required: true,
                            right: true,
                            where: {
                                id_stock: idStock
                            },
                        }
                    }
                });

                console.log(allFactors);

                return allFactors
            } catch (error) {
                logger.error({ file: "Factor", function: "Query type | allFactors", error, lines: "[ 32 - 63 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT051102")
            }
        },

        allDriver: async (obj, {idCompany}, context, info) => {
            try {
                return await Factor.findAll({
                    where: { department: "driver" },
                    include: {
                        model: Person,
                        as: 'person',
                        required: true,
                        right: true,
                        where: { deleted: false },
                        include: {
                            model: StockAccess,
                            as: 'stock_accesses',
                            required: true,
                            right: true,
                            include: {
                                model: Stock,
                                as: 'stock',
                                required: true,
                                right: true,
                                where: { id_company: idCompany },
                            }
                        }
                    }
                })
            } catch (error) {
                logger.error({ file: "Factor", function: "Query type | allDriver", error, lines: "[ 65 - 94 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT051103")
            }
        },

        currentDriver: async (obj, args, {isAuth, user}, info) => {
            try {
                if (isAuth) {
                    let driver = await Factor.findOne({
                        where: {
                            id_person: user.id_person,
                            department: "سائق"
                        }
                    });
                    return driver
                }
                return "You must be the authenticated user to get this information";
            } catch (error) {
                logger.error({ file: "Factor", function: "Query type | currentDriver", error, lines: "[ 96 - 112 ]", user: user.user_name });
                throw new apolloServerExpress.ApolloError("error IT051104")
            }
        },

        currentFactor: async (obj, args, {isAuth, user}, info) => {
            try {
                if (isAuth) {
                    let driver = await Factor.findOne({
                        where: {
                            id_person: user.id_person,
                            department: {
                                [Sequelize.Op.ne]: "سائق"
                            }
                        }
                    });
                    return driver
                }
                return "You must be the authenticated user to get this information";
            } catch (error) {
                logger.error({ file: "Factor", function: "Query type | currentFactor", error, lines: "[ 114 - 132 ]", user: user.user_name });
                throw new apolloServerExpress.ApolloError("error IT051105")
            }
        }
    },

    Factor: {
        person: async (obj, args, context, info) => {
            try {
                return await Person.findByPk(obj.id_person)
            } catch (error) {
                logger.error({ file: "Factor", function: "Factor type | person", error, lines: "[ 136 - 143 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT052201")
            }
        },

        user: async ({id_person}, args, context, info) => {
            try {
                return await User.findOne({
                    where: {id_person}
                })
            } catch (error) {
                logger.error({ file: "Factor", function: "Factor type | user", error, lines: "[ 145 - 154 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT052202")
            }
        },
    },

    Mutation: {
        createFactor: async (obj, {content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }
            try {
                const onePerson = await Person.findOne({
                    where: {
                        [Sequelize.Op.or]: [
                            {email: content.person.email},
                            {phone01: content.person.phone01}
                        ]
                    }
                });

                if (onePerson !== null) {
                    if (onePerson.email === content.person.email) {
                        return new apolloServerExpress.ApolloError('Email already exists', "EMAIL_EXIST", {})
                    } else {
                        return new apolloServerExpress.ApolloError('Phone already exists', "PHONE_EXIST", {})
                    }
                }

                let person = await Person.create(content.person);

                let stock = await StockAccess.create({
                    id_person: person.id,
                    id_stock: content.person.id_stock
                });

                let factor = await Factor.create({
                    id_person: person.id,
                    department: content.department,

                    salary_type: content.salary_type || "wage",
                    salary: content.salary || 0
                });

                if (factor) {
                    return factor
                }

            } catch (error) {
                console.log(error);
                logger.error({ file: "Factor", function: "Mutation type | createFactor", error, lines: "[ 158 - 202 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT053301")
            }
        },

        updateFactor: async (obj, {id_person, content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }
            try {
                let person = null;
                let factor = null;

                if(content.person) {
                    person = await Person.update(content.person, { where: { id: id_person } });
                }

                if(content.department || content.salary_type || content.salary) {
                    factor = await Factor.update(
                        {
                            department: content.department,

                            salary_type: content.salary_type,
                            salary: content.salary
                        }, {
                            where: { id_person }
                        }
                    );
                }

                return {
                    status: person[0] === 1 || factor[0] === 1
                }

            } catch (error) {
                logger.error({ file: "Factor", function: "Mutation type | updateFactor", error, lines: "[ 204 - 236 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT053302")
            }
        },

        deleteFactor: async (obj, {id_person}, context, info) => {
            try {
                let result = await Factor.update({deleted: true}, { where: { id_person } });
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "Factor", function: "Mutation type | deleteFactor", error, lines: "[ 238 - 248 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT053303")
            }
        }
    }
};

const { generator: generator$1, uid: uid$2 } = RandToken;

Joi.object({
    product:        Joi.string().min(0).max(50).required(),
    price:          Joi.string().min(0).max(50).required(),
    id_company:     Joi.string().min(0).max(50).required()
});

const resolvers$a = {

    Query: {
        invoice: async (obj, {id}, context, info) => {
            try {
                return await Invoice.findByPk(id)
            } catch (error) {
                logger.error({ file: "invoice", function: "Query type | invoice", error, lines: "[ 16 - 23 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT061101")
            }
        },

        allInvoicesCompany: async (obj, { id_company }, context, info) => {
            try {
                return await Invoice.findAll({
                    where: {
                        id_company: id_company,
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "invoice", function: "Query type | allInvoices", error, lines: "[ 25 - 37 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT061102")
            }
        },

        allInvoices: async (obj, args, context, info) => {
            try {
                return await Invoice.findAll({
                    where: {
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "invoice", function: "Query type | allInvoices", error, lines: "[ 25 - 37 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT061102")
            }
        },
    },

    Invoice: {
        company: async ({id_company}, args, context, info) => {
            try {
                return await Company.findByPk(id_company)
            } catch (error) {
                logger.error({ file: "invoice", function: "Invoice type | company", error, lines: "[ 41 - 48 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT062201")
            }
        },
    },

    Mutation: {
        createInvoice: async (obj, {content}, context, info) => {
            try {
                const codeInvoice = `Pts-${uid$2(8)}`;
                return await Invoice.create({
                    ...content,
                    price:          content.points * 10,
                    status:         "waiting",
                    code_invoice: codeInvoice
                })
            } catch (error) {
                logger.error({ file: "invoice", function: "Mutation type | createInvoice", error, lines: "[ 52 - 65 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT063301")
            }
        },

        updateInvoice: async (obj, {id, content}, context, info) => {
            try {
                let invoice = await Invoice.update(content, { where: { id } });

                return {
                    status: invoice[0] === 1
                }

            } catch (error) {
                logger.error({ file: "invoice", function: "Mutation type | updateInvoice", error, lines: "[ 67 - 79 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT063302")
            }
        },

        changeStatusInvoice: async (obj, {id, status}, context, info) => {
            try {
                const invoice = await Invoice.findOne({ where: { id } });

                let updateInvoice = null;
                if(status == "active") {
                    updateInvoice = await Invoice.update({status}, { where: { id } });

                    if(updateInvoice[0] === 1) {
                        let company = await Company.increment('points', {
                            by: invoice.points,
                            where: { id: invoice.id_company }
                        });
                    }
                } else {
                    updateInvoice = await Invoice.update({status}, { where: { id } });
                }

                return {
                    status: updateInvoice[0] === 1
                }

            } catch (error) {
                logger.error({ file: "invoice", function: "Mutation type | changeStatusInvoice", error, lines: "[ 81 - 93 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT063302")
            }
        },

        deleteInvoice: async (obj, {id}, context, info) => {
            try {
                let result = await Invoice.update({deleted: true}, { where: { id } });

                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "invoice", function: "Mutation type | deleteInvoice", error, lines: "[ 95 - 106 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT063303")
            }
        }
    }

};

const schema$2 = Joi.object({
    first_name:     Joi.string().min(3).max(50).required(),
    last_name:      Joi.string().min(3).max(50).required(),
    email:          Joi.string().email().max(50).required(),
    phone01:        Joi.string().min(10).max(15).required(),
    phone02:        Joi.string().max(15),
    address:        Joi.string().min(4).max(50).required(),
    id_stock:       Joi.string().min(0).max(50).required()
});

const resolvers$9 = {

    Query: {
        person: async (obj, {id}, context, info) => {
            try {
                return await Person.findByPk(id)
            } catch (error) {
                logger.error({ file: "person", function: "Query type | person", error, lines: "[ 20 - 27 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT071101")
            }
        },
        allPersons: async (obj, args, context, info) => {
            try {
                return await Person.findAll()
            } catch (error) {
                logger.error({ file: "person", function: "Query type | allPersons", error, lines: "[ 28 - 35 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT071102")
            }
        },
    },

    Person: {
        company: async ({id}, args, context, info) => {
            try {
                let stockUser = await StockAccess.findOne({
                    where: { id_person: id },
                    include: {
                        model: Stock, as: "stock",
                        required: true, right: true
                    }
                });

                return await Company.findByPk(stockUser.stock.id_company)
            } catch (error) {
                logger.error({ file: "person", function: "Query type | allMessages", error, lines: "[ 39 - 54 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT072201")
            }
        },
        list_stock_accesses: async ({id}, args, context, info) => {
            try {
                return await StockAccess.findOne({
                    where: {
                        id_person: id
                    }
                })
            } catch (error) {
                logger.error({ file: "person", function: "Query type | allMessages", error, lines: "[ 55 - 66 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT072202")
            }
        },
    },

    StockAccess: {
        stock: async ({id_stock}, args, context, info) => {
            try {
                return await Stock.findByPk( id_stock )
            } catch (error) {
                logger.error({ file: "person", function: "StockAccess type | stock", error, lines: "[ 74 - 82 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT073301")
            }
        },
    },

    Mutation: {
        createPerson: async (obj, {content}, context, info) => {
            try {
                await schema$2.validateAsync(content);
            } catch (errors) {
                throw new apolloServerExpress.UserInputError(errors.message)
            }

            try {
                let person = await Person.findOne({
                    where: {
                        [Op.or]: [
                            {email: content.email},
                            {phone01: content.phone01}
                        ]
                    }
                });

                if (!person) { return new apolloServerExpress.ApolloError('IT000001') }

                person = await Person.create(content);
                await StockAccess.create({
                    id_stock: content.id_stock,
                    id_person: person.id
                });

                return person
            } catch (error) {
                logger.error({ file: "person", function: "Mutation type | createPerson", error, lines: "[ 81 - 111 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT074401")
            }
        },

        updatePerson: async (obj, {id, content}, context, info) => {
            try {
                await schema$2.validateAsync(content);
            } catch (errors) {
                throw new apolloServerExpress.UserInputError(errors.message)
            }

            try {
                let person = await Person.update(content, { where: { id } });

                return {
                    status: person[0] === 1
                }
            } catch (error) {
                logger.error({ file: "person", function: "Mutation type | updatePerson", error, lines: "[ 113 - 130 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT074402")
            }
        },

        deletePerson: async (obj, {id}, context, info) => {
            try {
                let result = await Person.update({deleted: true},{ where: { id } });
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "person", function: "Mutation type | deletePerson", error, lines: "[ 132 - 142 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT074403")
            }
        }
    }
};

const {Op: Op$2, col} = Sequelize;
dotenv.config();

const { hash, compare } = bcrypt;
const SECRET = process.env.SECRET;

Joi.object({
    user_name:      Joi.string().min(3).max(50).required(),
    password:       Joi.string().min(8).max(50).pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])")).required(),
    role:           Joi.string().min(3).max(50).required(),
    id_person:      Joi.string().min(0).max(50).required()
});

const resolvers$8 = {

    Query: {
        user: async (obj, {id}, context, info) =>  {
            try {
                return await User.findByPk(id)
            } catch (error) {
                logger.error({ file: "User", function: "Query type | user", error, lines: "[ 34 - 41 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT091101")
            }
        },

        currentUser: async (obj, args, {isAuth, user}, info) => {
            try {
                if (isAuth) {
                    return user
                }
                return "You must be the authenticated user to get this information";
            } catch (error) {
                logger.error({ file: "User", function: "Query type | currentUser", error, lines: "[ 43 - 53 ]", user: user.user_name });
                throw new apolloServerExpress.ApolloError("error IT091102")
            }
        },

        currentAdmin: async (obj, args, {isAuth, user}, info) => {
            try {
                if (isAuth && user.role === "AdminCompany") {
                    return user
                }
                return "You must be the authenticated user to get this information";
            } catch (error) {
                logger.error({ file: "User", function: "Query type | currentAdmin", error, lines: "[ 55 - 65 ]", user: user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT091102")
            }
        },

        allUsers: async (obj, {deleted, idStock}, context, info) => {
            try {
                return await User.findAll({
                    where: {
                        '$person->stock_accesses.id_stock$': idStock,
                        '$person.deleted$':  deleted
                    },
                    include: {
                        model: Person,
                        as: 'person',
                        required: true,
                        right: true,
                        include: {
                            model: StockAccess,
                            as: 'stock_accesses',
                            required: true,
                            right: true
                        }
                    }
                })
            } catch (error) {
                logger.error({ file: "User", function: "Query type | allUsers", error, lines: "[ 67 - 91 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT091103")
            }
        },

        refreshToken: async (obj, args, {refreshToken, req, isAuth, user}, info) => {
            try {
                //console.log(refreshToken)
                if (!refreshToken || refreshToken === "") {
                    return new apolloServerExpress.AuthenticationError( "Refresh token does not exist" );
                }

                let decodedToken;
                try {
                    decodedToken = jwt.verify(refreshToken, SECRET);
                } catch (err) {
                    return new apolloServerExpress.AuthenticationError("Refresh token invalid or expired")
                }

                // If decoded token is null then set authentication of the request false
                if (!decodedToken) {
                    return new apolloServerExpress.AuthenticationError("Refresh token invalid or expired")
                }

                let useragent = `${req.useragent.browser}: ${req.useragent.version}, ${req.useragent.platform}: ${req.useragent.os}, ${req.useragent.source}`;

                if (useragent !== decodedToken.useragent) {
                    return new apolloServerExpress.AuthenticationError("The user is not properly logged in")
                }

                // If the user has valid token then Find the user by decoded token's id
                let authUser = await User.findByPk(decodedToken.id);
                if (!authUser) {
                    return "User Does not exist";
                }

                let info = await StockAccess.findOne({
                    attributes: ["id", "id_person", "id_stock"],
                    where: { id_person: authUser.id_person },
                    include: {
                        model: Stock,
                        as: 'stock',
                        required: true,
                        right: true,
                        attributes: ["id", "activation"],
                        include: {
                            model: Company,
                            as: 'company',
                            required: true,
                            right: true,
                            attributes: ["id", "activation"]
                        }
                    }
                });

                if (!info) {
                    return new apolloServerExpress.ApolloError("Account is not connect in any stock", "NOT_ACCESS_STOCK");
                } else {
                    if (info.dataValues.stock.dataValues.company.activation === 'desactive') {
                        return new apolloServerExpress.ApolloError("Your Company is not active", "COMPANY_NOT_ACTIVE");
                    } else if (info.dataValues.stock.dataValues.company.activation === 'debt' && authUser.role !== "AdminCompany") {
                        return new apolloServerExpress.ApolloError("Your Company is not active", "COMPANY_NOT_ACTIVE");
                    } else if (info.dataValues.stock.dataValues.company.activation === 'active' && info.dataValues.stock.activation !== 'active' && authUser.role !== "AdminCompany") {
                        return new apolloServerExpress.ApolloError("Your Stock is not active", "STOCK_NOT_ACTIVE");
                    }
                }

                let token = await issueAuthToken({id: authUser.id});

                return {
                    token
                }
            } catch (error) {
                logger.error({ file: "User", function: "Query type | refreshToken", error, lines: "[ 93 - 163 ]", user: user.user_name  });
                return new apolloServerExpress.ApolloError("error IT091104")
            }
        },
    },

    User: {
        person: async (obj, args, context, info) => {
            try {
                return await Person.findByPk(obj.id_person)
            } catch (error) {
                logger.error({ file: "User", function: "User type | person", error, lines: "[ 171 - 178 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT092201")
            }
        }
    },

    // Upload: GraphQLUpload,

    Mutation: {
        authenticateUser: async (obj, {content}, context, info) => {
            try {
                const checkIP = await checkIPBlocked(context.req, context.res);

                if(checkIP) {
                    return new apolloServerExpress.ApolloError(`Too Many Requests you can try after ${checkIP} seconds`, "TOO_MANY_REQUESTS")
                }

                let person = await Person.findOne({
                    attributes: ["id", "email"],
                    where: { email: content.email }
                });

                // Person is exist
                if (!person) {
                    const checkIP = await consumePoint(context.req, context.res);
                    if (checkIP !== true && typeof checkIP == "number") {
                        return new apolloServerExpress.ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                    }
                    return new apolloServerExpress.ApolloError('User not found', 'USER_NOT_EXIST');
                }

                let role = context.req.header('Origin') === "https://stock.qafilaty.com" ? "Factor" :
                    context.req.header('Origin') === "https://client.qafilaty.com" ? "Client" :
                        context.req.header('Origin') === "https://driver.qafilaty.com" ? "Driver" :
                            context.req.header('Origin') === "https://admin.qafilaty.com" ? "AdminCompany" :
                                context.req.header('Origin') === "http://localhost:3000" ? "Dev" : "";


                let user = null;
                if (role === "Dev") {
                    user = await User.findOne({
                        where: {
                            [Op$2.and]: [
                                {id_person: person.id}
                            ]
                        }
                    });
                } else {
                    user = await User.findOne({
                        where: {
                            [Op$2.and]: [
                                {id_person: person.id},
                                {role: role}
                            ]
                        }
                    });
                }

                // User is exist
                if (!user) {
                    const checkIP = await consumePoint(context.req, context.res);
                    if (checkIP !== true && typeof checkIP == "number") {
                        return new apolloServerExpress.ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                    }
                    return new apolloServerExpress.ApolloError('User not found', 'USER_NOT_EXIST');
                }

                let isMatch = await compare(content.password, user.password);

                // If Password don't match
                if (!isMatch) {
                    const checkIP = await consumePoint(context.req, context.res);
                    if (checkIP !== true && typeof checkIP == "number") {
                        return new apolloServerExpress.ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                    }

                    return new apolloServerExpress.ApolloError("Password not incorrect", "PASSWORD_INCORRECT");
                }


                // If Password don't match
                if (!user.email_verify) {
                    const checkIP = await consumePoint(context.req, context.res);
                    if (checkIP !== true && typeof checkIP == "number") {
                        return new apolloServerExpress.ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                    }

                    return new apolloServerExpress.ApolloError("Email not verify", "EMAIL_NOT_VERIFY");
                }

                // If Password don't match
                if (user.activation !== "active") {
                    const checkIP = await consumePoint(context.req, context.res);
                    if (checkIP !== true && typeof checkIP == "number") {
                        return new apolloServerExpress.ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                    }
                    return new apolloServerExpress.ApolloError("Account is not active", "ACCOUNT_NOT_ACTIVE");
                }

                let info = await StockAccess.findOne({
                    attributes: ["id", "id_person", "id_stock"],
                    where: { id_person: person.id },
                    include: {
                        model: Stock,
                        as: 'stock',
                        required: true,
                        right: true,
                        attributes: ["id", "activation"],
                        include: {
                            model: Company,
                            as: 'company',
                            required: true,
                            right: true,
                            attributes: ["id", "activation"]
                        }
                    }
                });

                if (!info) {
                    const checkIP = await consumePoint(context.req, context.res);
                    if (checkIP !== true && typeof checkIP == "number") {
                        return new apolloServerExpress.ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                    }
                    return new apolloServerExpress.ApolloError("Account is not connect in any stock", "NOT_ACCESS_STOCK");
                } else {
                    if (info.dataValues.stock.dataValues.company.activation === 'desactive') {
                        const checkIP = await consumePoint(context.req, context.res);
                        if (checkIP !== true && typeof checkIP == "number") {
                            return new apolloServerExpress.ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                        }
                        return new apolloServerExpress.ApolloError("Your Company is not active", "COMPANY_NOT_ACTIVE");

                    } else if (info.dataValues.stock.dataValues.company.activation === 'debt' && user.role !== "AdminCompany") {
                        const checkIP = await consumePoint(context.req, context.res);
                        if (checkIP !== true && typeof checkIP == "number") {
                            return new apolloServerExpress.ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                        }
                        return new apolloServerExpress.ApolloError("Your Company is not active", "COMPANY_NOT_ACTIVE");

                    } else if (info.dataValues.stock.dataValues.company.activation === 'active' && info.dataValues.stock.activation !== 'active' && user.role !== "AdminCompany") {
                        const checkIP = await consumePoint(context.req, context.res);
                        if (checkIP !== true && typeof checkIP == "number") {
                            return new apolloServerExpress.ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                        }
                        return new apolloServerExpress.ApolloError("Your Stock is not active", "STOCK_NOT_ACTIVE");
                    }
                }

                // Issue Token
                let token = await issueAuthToken({id: user.id, role: user.role});

                let useragent = `${context.req.useragent.browser}: ${context.req.useragent.version}, ${context.req.useragent.platform}: ${context.req.useragent.os}, ${context.req.useragent.source}`;

                let refreshToken = await getRefreshToken({id: user.id, role: user.role, useragent: useragent});

                if (refreshToken !== null && refreshToken !== "") {
                    // context.res.cookie('___refresh_token', refreshToken, {
                    //     //domain: "qafilaty.com",
                    //     maxAge: 3600000*24*1, // Hours * 24 * 7
                    //     httpOnly: true,
                    //     secure: true,
                    //     sameSite: "none"
                    // })

                    context.res.cookie('___refresh_token', refreshToken, {
                        domain: "qafilaty.com",
                        maxAge: 3600000*24*7, // Hours * 24 * 7
                        httpOnly: true,
                        secure: true,
                        sameSite: 'lax',
                    });
                }

                if (token !== null && token !== "") {
                    return {
                        token,
                        user
                    }
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | authenticateUser", error, lines: "[ 186 - 360 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError(error)
            }
        },

        createUser: async (obj, {content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }

            //Person is already Exist.                  => IT000001
            //Person is not Exist.                      => IT000002
            //Username is already Exist.                => IT000003
            //This person already has an account        => IT000004
            //User not found                            => IT000005
            //token is not exist                        => IT000006
            //authorization expired or unauthorized     => IT000007
            //Passwords do not match                    => IT000008

            try {
                let user = await User.findOne({ where: { user_name: content.user_name } });
                if (user) { return new apolloServerExpress.ApolloError('IT000003', "USERNAME_ALREADY_EXIST") }

                user = await User.findOne({ where: { id_person: content.id_person } });
                if (user) { return new apolloServerExpress.ApolloError('IT000004', "ALREADY_HAS_ACCOUNT") }

                let person = await Person.findOne({ where: { id: content.id_person } });
                if (!person) { return new apolloServerExpress.ApolloError('IT000002', "PERSON_NOT_EXIST") }

                // Hash the user password
                let hashPassword = await hash(content.password, 10);

                let result = await User.create({
                    user_name: content.user_name,
                    password: hashPassword,
                    role: content.role,
                    id_person: content.id_person,
                    lastConnection: new Date(),
                    lastDisconnection:  new Date(),
                    email_verify: true
                });

                result = await serializeUser(result);

                let token = await issueAuthToken({id: result.id, role: result.role});

                // await createMail ({
                //     type: "Verification",
                //     to: person.email,
                //     subject: "Email Verification",
                //     token: token.split(" ")[1]
                // });

                return {
                    user: result,
                    token: token
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | createUser", error, lines: "[ 362 - 419 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT093302")
            }
        },

        emailVerification: async (obj, {token}, context, info) => {
            try {
                if (!token || token === "") {
                    return  new apolloServerExpress.ApolloError("IT000006");
                }

                // Verify the extracted token
                let decodedToken;
                try {
                    decodedToken = jwt.verify(token, SECRET);
                } catch (err) {
                    return  new apolloServerExpress.ApolloError(err.message)
                }

                // If decoded token is null then set authentication of the request false
                if (!decodedToken) {
                    return  new apolloServerExpress.ApolloError("IT000007");
                }

                // If the user has valid token then Find the user by decoded token's id
                let authUser = await User.findOne({
                    where: {
                        id: decodedToken.id
                    }
                });

                if (!authUser) {
                    return  new apolloServerExpress.ApolloError("IT000005")
                }

                let user = await User.update({'activation': 'active', 'email_verify': true }, { where: { id: decodedToken.id } });

                console.log(user);
                return {
                    status: user[0] === 1
                }

            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | emailVerification", error, lines: "[ 421 - 462 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError(error)
            }
        },

        resendVerificationEmail: async (obj, {email}, context, info) => {
            try {
                let person = await Person.findOne({ where: { email } });

                // Person is exist
                if (!person) { return new apolloServerExpress.ApolloError('User not found', 'USER_NOT_EXIST');}

                let user = await User.findOne({ where: { id_person: person.id } });

                // User is exist
                if (!user) { return new apolloServerExpress.ApolloError('User not found', 'USER_NOT_EXIST'); }

                let token = await issueAuthToken({
                    id: user.id,
                    id_person: user.id_person,
                    email: person.email
                }, 15);

                const createdMail = await createMail ({
                    type: "Verification",
                    to: email,
                    subject: "Email Verification",
                    token: token.split(" ")[1]
                });

                console.log("createdMail ", createdMail);

                return {
                    status: true
                }

            }  catch (error) {
                logger.error({ file: "User", function: "Mutation type | resendVerificationEmail", error, lines: "[ 464 - 499 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT093304")
            }
        },

        forgetPassword: async (obj, {email}, context, info) => {
            try {
                let person = await Person.findOne({ where: { email } });

                // Person is exist
                if (!person) { return new apolloServerExpress.ApolloError('User not found', 'USER_NOT_EXIST');}

                let user = await User.findOne({ where: { id_person: person.id } });

                // User is exist
                if (!user) { return new apolloServerExpress.ApolloError('User not found', 'USER_NOT_EXIST'); }

                let token = await issueAuthToken({
                    id: user.id,
                    id_person: user.id_person,
                    email: person.email
                }, 15);

                const createdMail = await createMail ({
                    type: "Forget",
                    to: email,
                    subject: "Forget your password",
                    token: token.split(" ")[1]
                });

                return {
                    status: true
                }

            }  catch (error) {
                logger.error({ file: "User", function: "Mutation type | forgetPassword", error, lines: "[ 501 - 534 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT093304")
            }
        },

        changePassword: async (obj, {content}, context, info) => {
            try {
                const {token, password, confirmPassword} = content;

                if (!token || token === "" || password !== confirmPassword) {
                    return  new apolloServerExpress.ApolloError("IT000008");
                }

                // Verify the extracted token
                let decodedToken;
                try {
                    decodedToken = jwt.verify(token, SECRET);
                } catch (err) {
                    return  new apolloServerExpress.ApolloError(err.message)
                }

                // If decoded token is null then set authentication of the request false
                if (!decodedToken) {
                    return  new apolloServerExpress.ApolloError("IT000007");
                }

                let person = await Person.findOne({ where: { email: decodedToken.email } });

                if (!person) {
                    return  new apolloServerExpress.ApolloError('IT000005');
                }

                // Hash the user password
                let hashPassword = await hash(password, 10);

                let user = await User.update({'password': hashPassword}, { where: { id: decodedToken.id } });

                return {
                    status: user[0] === 1
                }

            }  catch (error) {
                logger.error({ file: "User", function: "Mutation type | changePassword", error, lines: "[ 536 - 576 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT093305")
            }
        },

        updateUsers: async (obj, {id_person, content}, context, info) => {
            try {
                let person = [];
                let hashNewPassword = null;
                let result = null;

                if (content.person) {
                    person = await Person.update(content.person, { where: { id: id_person } });
                }

                if (content.newPassword) {
                    hashNewPassword = await hash(content.newPassword, 10);
                }

                if (hashNewPassword !== null) {
                    result = await User.update({
                        user_name: content.user_name,
                        password: hashNewPassword,
                        role: content.role
                    }, { where: { id_person } });
                } else {
                    result = await User.update({
                        user_name: content.user_name,
                        role: content.role
                    }, { where: { id_person } });
                }

                return {
                    status: result[0] === 1 || person[0] === 1
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | updateUsers", error, lines: "[ 578 - 612 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT093306")
            }
        },

        updateMyUser: async (obj, {id_person, content}, context, info) => {
            try {
                let token = "";

                let user = await User.findOne({where: {id_person}});

                let isMatch = await compare(content.oldPassword, user.password);

                if (user && isMatch) {

                    let person = null;
                    let hashNewPassword = null;
                    let result = null;

                    if (content.person) {
                        person = await Person.update(content.person, { where: { id: id_person } });
                    }

                    if (content.newPassword) {
                        hashNewPassword = await hash(content.newPassword, 10);
                    }

                    if (hashNewPassword !== null) {
                        result = await User.update({
                            user_name: content.user_name,
                            password: hashNewPassword,
                            role: content.role
                        }, { where: { id_person } });
                    } else {
                        result = await User.update({
                            user_name: content.user_name,
                            role: content.role
                        }, { where: { id_person } });
                    }

                    result = await serializeUser(result);

                    token = await issueAuthToken(result);

                } else {
                    throw new apolloServerExpress.ApolloError("Old password is incorrect")
                }

                return {
                    token: token
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | updateMyUser", error, lines: "[ 614 - 664 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT093307")
            }
        },

        activeUser: async (obj, {id_person, activation}, context, info) => {
            try {
                let user = await User.update({activation}, { where: { id_person } });

                return {
                    status: user[0] === 1
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | activeUser", error, lines: "[ 666 - 677 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT093308")
            }
        },

        deleteUser: async (obj, {id_person}, context, info) => {
            try {
                let result = await User.destroy({ where: { id_person } });
                return {
                    status: result === 1
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | deleteUser", error, lines: "[ 679 - 689 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT093309")
            }
        },

        updateAccessesStock: async (obj, {idPerson, idStock}, context, info) => {
            try {
                const status = await StockAccess.update({
                    id_stock: idStock
                }, {
                    where: {
                        id_person: idPerson
                    }
                });

                console.log(status);
                return {
                    status: status[0] == 1 || status[0] == 2
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | updateAccessesStock", error, lines: "[ 691 - 709 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError("error IT092201")
            }
        },

        logOut: async (obj, {}, context, info) => {
            try {
                let cookie = context.res.cookie('___refresh_token', '', {
                    domain: "qafilaty.com",
                    maxAge: 0, // Hours * 24 * 7
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                });

                
                return {
                    status: true,
                };
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | logOut", error, lines: "[ 711 - 729 ]", user: context.user.user_name  });
                throw new apolloServerExpress.ApolloError('error IT093309');
            }
        },

        /*singleUpload: async (obj, { file }, context, info) => {
            console.log({ file })
            try {
                const listType = ["JPEG", "JPG", "PNG", "ICO"]
                const { createReadStream, filename, mimetype, encoding } = await file;
                const imgType = filename.split(".")[filename.split(".").length-1].toUpperCase()
                const isImage = listType.find(item => item === imgType)

                if(!isImage) { return new ApolloError("this file is not image") }

                const assetUniqName = UUIDV4() + filename;
                const pathName = path.join(__dirname,   `./../../../uploaded/${assetUniqName}`);
                const stream = createReadStream();
                let up = await stream.pipe( createWriteStream(pathName) );

                //console.log(stream);
                return {
                    url: `http://localhost:4000/${assetUniqName}`
                };

            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | singleUpload", error, lines: "[ 731 - 755 ]", user: context.user.user_name  })
                throw new ApolloError("error IT093310")
            }
        },*/
    }
};

Joi.object({
    name:       Joi.string().min(3).max(50).required(),
    id_company: Joi.string().min(36).max(50).required(),
    address:    Joi.string().empty('').min(0).max(50).required(),
    phone01:    Joi.string().min(9).max(50).required(),
    phone02:    Joi.string().empty('').min(0).max(50)
});

const resolvers$7 = {

    Query: {
        stock:    async (obj, {id}, context, info) => {
            try {
                return await Stock.findOne({where: {id, deleted: false}})
            } catch (error) {
                logger.error({ file: "stock", function: "Query type | stock", error, lines: "[ 19 - 26 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT081101")
            }
        },

        allStock: async (obj, {idCompany}, context, info) => {
            try {
                return await Stock.findAll({
                    where: {
                        id_company: idCompany,
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "stock", function: "Query type | allStock", error, lines: "[ 28 - 40 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT081102")
            }
        },

        getAllStatistics: async (obj, {idStock, idCompany}, context, info) => {
            try {
                let [numberClients] = await DB.query(`
                    SELECT sa.id_stock, COUNT(DISTINCT c.id_person) AS COUNT FROM clients c 
                    JOIN stock_accesses sa ON sa.id_person = c.id_person WHERE sa.id_stock = '${idStock || ""}'`, {
                    type: Sequelize.QueryTypes.SELECT
                });

                let [numberFactors] = await DB.query(`
                    SELECT sa.id_stock, COUNT(DISTINCT f.id_person) AS COUNT FROM factors f
                    JOIN stock_accesses sa ON sa.id_person = f.id_person WHERE sa.id_stock = '${idStock || ""}'`, {
                    type: Sequelize.QueryTypes.SELECT
                });

                let [numberUsers] = await DB.query(`
                    SELECT sa.id_stock, COUNT(DISTINCT u.id_person) AS COUNT FROM users u
                    JOIN stock_accesses sa ON sa.id_person = u.id_person WHERE sa.id_stock = '${idStock || ""}'`, {
                    type: Sequelize.QueryTypes.SELECT
                });

                let numberAllBoxes = await Box.count({
                    where: { id_stock: idStock || "", deleted: false }
                });

                let [numberAllStockBoxes] = await DB.query(`
                    SELECT s.id_company, s.id_company, COUNT(b.id) AS COUNT FROM stocks s
                    JOIN boxes b ON b.id_stock = s.id WHERE b.deleted = false AND s.id_company = '${idCompany}'`, {
                    type: Sequelize.QueryTypes.SELECT
                });

                let numberArchivedBoxes = await Box.count({
                    where: { id_stock: idStock || "", deleted: false, archived: true }
                });

                let numberNotArchivedBoxes = await Box.count({
                    where: { id_stock: idStock || "", deleted: false, archived: false }
                });

                let numberClassicBoxes = await Box.count({
                    where: { id_stock: idStock || "", deleted: false, price_box: 0 }
                });

                let numberCommercialBoxes = await Box.count({
                    where: {
                        id_stock: idStock,
                        deleted: false,
                        price_box: {
                            [Sequelize.Op.gt]: 0
                        }
                    }
                });

                return {
                    numberClients:           numberClients.COUNT,
                    numberFactors:           numberFactors.COUNT,
                    numberUsers:             numberUsers.COUNT,
                    numberAllBoxes:          numberAllBoxes,
                    numberAllStockBoxes:     numberAllStockBoxes.COUNT,
                    numberArchivedBoxes:     numberArchivedBoxes,
                    numberNotArchivedBoxes:  numberNotArchivedBoxes,
                    numberClassicBoxes:      numberClassicBoxes,
                    numberCommercialBoxes:   numberCommercialBoxes,
                    deliveryProfit:          30000.5,
                    readyProfit:             100000.50,
                }
            } catch (error) {
                logger.error({ file: "stock", function: "Query type | getAllStatistics", error, lines: "[ 42 - 111 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT081103")
            }
        },

        statisticsStock: async (obj, {idStock}, context, info) => {
            try {
                const numberAllBox = await Box.count({
                    where: { id_stock: idStock || "", deleted: false }
                });

                const numberAllBoxArchived = await Box.count({
                    where: { id_stock: idStock || "", deleted: false, archived: true  }
                });

                const numberAllBoxNotArchived = await Box.count({
                    where: { id_stock: idStock || "", deleted: false, archived: false }
                });

                const numberClassicBox = await Box.count({
                    where: {
                        id_stock: idStock || "",
                        deleted: false,
                        price_box: 0
                    }
                });

                const numberClassicBoxArchived = await Box.count({
                    where: {
                        id_stock: idStock || "",
                        deleted: false,
                        archived: true
                    }
                });

                const numberClassicBoxNotArchived = await Box.count({
                    where: {
                        id_stock: idStock || "",
                        deleted: false,
                        archived: false
                    }
                });

                const numberCommercialBox = await Box.count({
                    where: {
                        id_stock: idStock || "",
                        deleted: false,
                        price_box: {
                            [Sequelize.Op.gt]: 0
                        }
                    }
                });

                const numberCommercialBoxArchived = await Box.count({
                    where: {
                        id_stock: idStock || "",
                        deleted: false,
                        archived: true,
                        price_box: {
                            [Sequelize.Op.gt]: 0
                        }
                    }
                });

                const numberCommercialBoxNotArchived = await Box.count({
                    where: {
                        id_stock: idStock || "",
                        deleted: false,
                        archived: false,
                        price_box: {
                            [Sequelize.Op.gt]: 0
                        }
                    }
                });

                // money

                const moneyReadyReceive = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_box - (box.price_box * (box.TVA / 100))), 0) AS "total", COALESCE(
                        (SELECT SUM(box.price_delivery) FROM boxes box
                            INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                            WHERE box.deleted = 0 AND box.price_box > 0 AND box.id_stock = "${idStock}"
                            AND (box_trace.status = 12 OR box_trace.status = 11) AND box.payment_type = "free"
                            AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1) 
                            GROUP BY box.id_stock ), 0
                        ) AS "priceDeliveryFree"
                    
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0 AND box.price_box > 0
                    AND box.id_stock = "${idStock}"
                    AND (box_trace.status = 12 OR box_trace.status = 11)
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_stock
                `, {type: Sequelize.QueryTypes.SELECT});

                const moneyDriver = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_box), 0) AS "total", COALESCE(
                        (SELECT SUM(box.price_delivery) FROM boxes box
                            INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                            WHERE box.deleted = 0 AND box.price_box > 0 AND box.id_stock = "${idStock}"
                            AND box_trace.status = 10 AND box.payment_type = "free"
                            AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1) 
                            GROUP BY box.id_stock ), 0
                        ) AS "priceDeliveryFree"
                    
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0 AND box.price_box > 0
                    AND box.id_stock = "${idStock}"
                    AND box_trace.status = 10
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_stock
                `, {type: Sequelize.QueryTypes.SELECT});

                const moneyReceived = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_box - (box.price_box * (box.TVA / 100))), 0) AS "total", COALESCE(
                        (SELECT SUM(box.price_delivery) FROM boxes box
                            INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                            WHERE box.deleted = 0 AND box.price_box > 0 AND box.id_stock = "${idStock}"
                            AND box_trace.status = 13 AND box.payment_type = "free"
                            AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1) 
                            GROUP BY box.id_stock ), 0
                        ) AS "priceDeliveryFree"
                    
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0 AND box.price_box > 0
                    AND box.id_stock = "${idStock}"
                    AND box_trace.status = 13
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_stock
                `, {type: Sequelize.QueryTypes.SELECT});

                // Amount return_price
                const returnPrice = await Stock.findOne({
                    attributes: ["id", "id_company"],
                    where: {
                        id: idStock
                    },
                    include: {
                        model: Company,
                        as: "company",
                        required: true,
                        right: true,
                        attributes: ["id", "return_price"]
                    }
                });

                // console.log("returnPrice ", returnPrice.company.return_price);

                const totalAmountDelivered = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_delivery), 0) AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id

                    WHERE box.deleted = 0
                    AND box.id_stock = "${idStock || ""}"
                    AND box_trace.status >= 8 AND box_trace.status <= 13
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_stock
                `, {type: Sequelize.QueryTypes.SELECT});

                const totalPrepaid = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_delivery), 0) AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id

                    WHERE box.deleted = 0
                    AND box.id_stock = "${idStock || ""}"
                    AND box.paid_in_office = 1
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_stock
                `, {type: Sequelize.QueryTypes.SELECT});

                const totalAmountTax = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_box * (box.TVA / 100)), 0) AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0 AND box.price_box > 0
                    AND box.id_stock = "${idStock || ""}"
                    AND box_trace.status >= 8 AND box_trace.status <= 13
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_stock
                `, {type: Sequelize.QueryTypes.SELECT});

                const totalAmountCancelled = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_return), 0)  AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0
                        AND box.id_stock = "${idStock || ""}"
                        AND box_trace.status = 18
                        AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_stock
                `, {type: Sequelize.QueryTypes.SELECT});

                const totalAmountPickUp = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_pick_up), 0)  AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0
                    
                    AND box_trace.id = (
                        SELECT id FROM box_traces WHERE id_box = box.id AND status = 3
                        AND id_stock = "${idStock}" LIMIT 1
                    )
                    GROUP BY box.id_stock
                `, {type: Sequelize.QueryTypes.SELECT});

                const totalCommissions = (totalAmountDelivered.length > 0 ? totalAmountDelivered[0].total : 0)
                    + (totalAmountTax.length > 0 ? totalAmountTax[0].total : 0)
                    + (totalPrepaid.length > 0 ? totalPrepaid[0].total : 0)
                    + (totalAmountCancelled.length > 0 ? totalAmountCancelled[0].total : 0)
                    + (totalAmountPickUp.length > 0 ? totalAmountPickUp[0].total : 0);

                return {
                    stockID:                       idStock,
                    numberAllBox:                   numberAllBox,
                    numberAllBoxArchived:           numberAllBoxArchived,
                    numberAllBoxNotArchived:        numberAllBoxNotArchived,

                    numberClassicBox:               numberClassicBox,
                    numberClassicBoxArchived:       numberClassicBoxArchived,
                    numberClassicBoxNotArchived:    numberClassicBoxNotArchived,

                    numberCommercialBox:            numberCommercialBox,
                    numberCommercialBoxArchived:    numberCommercialBoxArchived,
                    numberCommercialBoxNotArchived: numberCommercialBoxNotArchived,

                    moneyDriver:        moneyDriver.length > 0 ? moneyDriver[0].total - moneyDriver[0].priceDeliveryFree : 0,
                    moneyReadyReceive:  moneyReadyReceive.length > 0 ? moneyReadyReceive[0].total - moneyReadyReceive[0].priceDeliveryFree : 0,
                    moneyReceived:      moneyReceived.length > 0 ? moneyReceived[0].total - moneyReceived[0].priceDeliveryFree  : 0,

                    totalCommissions:       totalCommissions,
                    totalAmountDelivered:   totalAmountDelivered.length > 0 ? totalAmountDelivered[0].total : 0,
                    totalAmountTax:         totalAmountTax.length > 0 ? totalAmountTax[0].total : 0,
                    totalPrepaid:           totalPrepaid.length > 0 ? totalPrepaid[0].total : 0,
                    totalAmountCancelled:   totalAmountCancelled.length > 0 ? totalAmountCancelled[0].total : 0,
                    totalAmountPickUp:      totalAmountPickUp.length > 0 ? totalAmountPickUp[0].total : 0
                }
            } catch (error) {
                logger.error({ file: "stock", function: "Query type | statisticsStock", error, lines: "[ 113 - 303 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError(error)
            }
        }
    },

    Stock: {
        company: async ({id_company}, args, context, info) => {
            try {
                return await Company.findByPk(id_company)
            } catch (error) {
                logger.error({ file: "stock", function: "Stock type | company", error, lines: "[ 307 - 314 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT082201")
            }
        },

        numberArchivedBoxes: async ({id}, args, context, info) => {
            try {
                return await Box.count({
                    where: { id_stock: id, deleted: false, archived: true }
                })
            } catch (error) {
                logger.error({ file: "stock", function: "Stock type | numberArchivedBoxes", error, lines: "[ 316 - 325 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT082201")
            }
        },

        numberNotArchivedBoxes: async ({id}, args, context, info) => {
            try {
                return await Box.count({
                    where: { id_stock: id, deleted: false, archived: false }
                })
            } catch (error) {
                logger.error({ file: "stock", function: "Stock type | numberNotArchivedBoxes", error, lines: "[ 327 - 336 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT082201")
            }
        },
    },

    StockStatistics: {
        allStatus: async ({stockID}, args, context, info) => {
            try {
                let traces = await DB.query(`
                    SELECT box_trace.status, COUNT(box_trace.status) AS "count" FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0 AND box.id_stock = "${stockID}"
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box_trace.status
                `, {type: Sequelize.QueryTypes.SELECT});

                let traces_Co = await DB.query(`
                    SELECT box_trace.status, COUNT(box_trace.status) AS "count" FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0 AND box.id_stock = "${stockID}" AND box.price_box > 0
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box_trace.status
                `, {type: Sequelize.QueryTypes.SELECT});

                let allTraces = [];

                for (let i = 0; i < traces.length; i++) {
                    let trace = traces[i];
                    allTraces.push({
                        status: trace.status,
                        numberClassic: trace.count,
                        numberCommercial: 0
                    });
                }

                for (let i = 0; i < allTraces.length; i++) {
                    let trace = allTraces[i];
                    for (let j = 0; j < traces_Co.length; j++) {
                        let traceCo = traces_Co[j];
                        if (trace.status == traceCo.status) {
                            allTraces[i] = {
                                ...allTraces[i],
                                numberClassic: trace.numberClassic - traceCo.count,
                                numberCommercial: traceCo.count
                            };
                        }
                    }
                }

                return allTraces
            } catch (error) {
                logger.error({ file: "stock", function: "StockStatistics type | allStatus", error, lines: "[ 341 - 389 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError(error)
            }
        },
        chartMoney: async ({stockID}, args, context, info) => {
            try {
                const weekNow = dateFns.format(new Date(), "w");

                const totalMoneyChart = await DB.query(`
                    SELECT WEEK(box_trace.createdAt) AS 'week', COALESCE(SUM(box.price_box), 0) AS 'total'
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0 AND box.price_box > 0 AND box.id_stock = "${stockID}"
                    AND box_trace.status IN (12, 10, 13, 11)
                    AND WEEK(box_trace.createdAt) IN (${weekNow}, ${weekNow-1}, ${weekNow-2}, ${weekNow-3}, ${weekNow-4})
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY WEEK
                `, {type: Sequelize.QueryTypes.SELECT});

                let chart = [
                    {week: weekNow-4, total: 0 },
                    {week: weekNow-3, total: 0 },
                    {week: weekNow-2, total: 0 },
                    {week: weekNow-1, total: 0 },
                    {week: weekNow, total: 0 }
                ];

                for (let i = 0; i < totalMoneyChart.length; i++) {
                    for (let j = 0; j < chart.length; j++) {
                        if (chart[j].week == totalMoneyChart[i].week) {
                            chart[j] = {...chart[j], total: totalMoneyChart[i].total};
                        }
                    }
                }

                return chart
            } catch (error) {
                logger.error({ file: "stock", function: "StockStatistics type | chartMoney", error, lines: "[ 341 - 389 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT083301")
            }
        },

        chartAmount: async ({stockID}, args, context, info) => {
            try {
                const weekNow = dateFns.format(new Date(), "w");

                // Amount
                const totalAmountDelivered = await DB.query(`
                    SELECT WEEK(box_trace.createdAt) AS 'week', COALESCE(SUM(box.price_delivery), 0) AS "totalDelivery",
                        COALESCE(SUM(box.price_box * (box.TVA / 100)), 0) AS "totalTVA"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0
                    AND box.id_stock = "${stockID}"
                    AND box_trace.status >= 8 AND box_trace.status <= 13
                    AND WEEK(box_trace.createdAt) IN (${weekNow}, ${weekNow-1}, ${weekNow-2}, ${weekNow-3}, ${weekNow-4})
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY WEEK
                `, {type: Sequelize.QueryTypes.SELECT});

                const totalPrepaid = await DB.query(`
                    SELECT WEEK(box_trace.createdAt) AS 'week', COALESCE(SUM(box.price_delivery), 0) AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0
                    AND box.id_stock = "${stockID}"
                    AND box.paid_in_office = 1
                    AND WEEK(box_trace.createdAt) IN (${weekNow}, ${weekNow-1}, ${weekNow-2}, ${weekNow-3}, ${weekNow-4})
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY WEEK
                `, {type: Sequelize.QueryTypes.SELECT});

                let chart = [
                    {week: weekNow-4, total: 0 },
                    {week: weekNow-3, total: 0 },
                    {week: weekNow-2, total: 0 },
                    {week: weekNow-1, total: 0 },
                    {week: weekNow, total: 0 }
                ];

                if (totalAmountDelivered.length > 0 || totalPrepaid.length > 0) {
                    for (let i = 0; i < chart.length; i++) {
                        for (let j = 0; j < totalAmountDelivered.length; j++) {
                            if (chart[i].week == totalAmountDelivered[j].week) {
                                chart[i] = {
                                    week: chart[i].week,
                                    total: chart[i].total + totalAmountDelivered[j].totalDelivery + totalAmountDelivered[j].totalTVA
                                };
                            }
                        }
                        for (let j = 0; j < totalPrepaid.length; j++) {
                            if (chart[i].week == totalPrepaid[j].week) {
                                chart[i] = {
                                    week: chart[i].week,
                                    total: chart[i].total + totalPrepaid[j].total
                                };
                            }
                        }
                    }
                }

                return chart
            } catch (error) {
                logger.error({ file: "stock", function: "StockStatistics type | chartAmount", error, lines: "[ 341 - 389 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT083301")
            }
        }
    },

    Mutation: {
        createStock: async (obj, {content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }
            try {
                return await Stock.create(content);
            } catch (error) {
                logger.error({ file: "stock", function: "Mutation type | createStock", error, lines: "[ 393 - 406 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT083301")
            }
        },

        updateStock: async (obj, {id, content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }
            try {
                let result = await Stock.update(content, { where: { id: id } });
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "stock", function: "Mutation type | updateStock", error, lines: "[ 408 - 424 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT083302")
            }
        },

        deleteStock: async (obj, {id}, context, info) => {
            try {
                let result = await Stock.update({deleted: true}, { where: { id: id } });
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "stock", function: "Mutation type | deleteStock", error, lines: "[ 426 - 437 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT083303")
            }
        },

        activeStock: async (obj, {id, activation}, context, info) => {
            try {
                let result = await Stock.update({activation}, { where: { id } });
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "stock", function: "Mutation type | activeStock", error, lines: "[ 439 - 450 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT083303")
            }
        }
    }
};

const resolvers$6 = {

    Query: {
        allStatisticsQafilaty: async (obj, args, context, info) => {
            try {
                return {
                    totalProfit:    1000.5,
                    totalPointsSpent: 100,
                    totalFreePoints:    500,

                    numberRegisteredCompanies:  10,
                    numberRegisteredBranches:   20,

                    totalAmountShipments:   700.5,
                    totalDeliveryProfit:    300.5,

                    totalNumberUsers:   20,
                    totalNumberEmployees:   15,
                    totalNumberClients: 50
                }
            } catch (error) {
                logger.error({ file: "Report", function: "Query type | allStatisticsQafilaty", error, lines: "[ 9 - 30 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT071102")
            }
        },
    },

    statisticsQafilaty: {
        totalNumberShipments: async (obj, args, context, info) => {
            try {
                return {
                    totalNumber:    10,
                    activeShipments:    2,
                    archivedShipments:    5,
                    deletedShipments:    3
                }
            } catch (error) {
                logger.error({ file: "Report", function: "statisticsQafilaty type | totalNumberShipments", error, lines: "[ 34 - 46 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT071102")
            }
        },

        totalNumberShipmentsDelivered: async (obj, args, context, info) => {
            try {
                return {
                    totalNumber:    15,
                    activeShipments:    5,
                    archivedShipments:    5,
                    deletedShipments:    5
                }
            } catch (error) {
                logger.error({ file: "Report", function: "statisticsQafilaty type | totalNumberShipmentsDelivered", error, lines: "[ 48 - 60 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT071102")
            }
        },

        totalNumberShipmentsFailedDeliver: async (obj, args, context, info) => {
            try {
                return {
                    totalNumber:    8,
                    activeShipments:    1,
                    archivedShipments:    5,
                    deletedShipments:    2
                }
            } catch (error) {
                logger.error({ file: "Report", function: "statisticsQafilaty type | totalNumberShipmentsFailedDeliver", error, lines: "[ 62 - 75 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT071102")
            }
        },
    }
};

const resolvers$5 = {

    Query: {
        allZone: async (obj, {idCompany}, context, info) => {
            try {
                const zone = await Zone.findAll({
                    where: {
                        id_company: idCompany,
                        deleted: false
                    }
                });
                let listZone  = [];

                if (!zone) {
                    return []
                }

                for (let i = 0; i < zone.length; i++) {
                    listZone.push({
                        ...zone[i]["dataValues"],
                        cities: zone[i]["dataValues"].cities == "" ? [] : zone[i]["dataValues"].cities.split("-")
                    });
                }

                return listZone
            } catch (error) {
                logger.error({ file: "Zone", function: "Query type | allZone", error, lines: "[ 8 - 34 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT031101")
            }
        },

        cityZone: async (obj, {idCompany, city}, context, info) => {
            try {
                const zone = await DB.query(`
                    SELECT id, name, cities, deleted, createdAt, updatedAt, id_company
                    FROM zones AS zone
                    WHERE zone.id_company = '${idCompany}' 
                    AND (
                        ( CHAR_LENGTH(zone.cities) > 2 AND  (zone.cities LIKE '%${city}-%' OR zone.cities LIKE '%-${city}%') )
                        OR ( CHAR_LENGTH(zone.cities) <= 2 AND  zone.cities LIKE '${city}' )
                    )
                    LIMIT 1;
                `, {type: Sequelize.QueryTypes.SELECT});
                
                /*const zone = await Zone.findOne({
                    attributes: ["id", "name", "cities", [literal("CHAR_LENGTH(zone.cities)"), "LENGTH"], "deleted", "createdAt", "updatedAt"],
                    where: {
                        id_company: idCompany,
                        [Op.or]: [
                            {[Op.and]: [
                                {
                                    '$LENGTH$': { [Op.gt]: 2 }
                                    
                                },
                                {cities: { 
                                    [Op.or]: [ 
                                        {[Op.substring]: `${city}-`}, 
                                        {[Op.substring]: `-${city}`} 
                                    ]
                                    
                                }}
                            ]},
                            
                            {[Op.and]: [
                                {'$LENGTH$': { [Op.lte]: 2 }},
                                {cities: city}
                            ]},
                        ],
                        deleted: false
                    }
                })*/
                
                if (!zone) {
                    return null
                }

                return {
                    ...zone[0],
                    cities: zone[0].cities == "" ? [] : zone[0].cities.split("-")
                }
            } catch (error) {
                
                    console.log(error);
                logger.error({ file: "Zone", function: "Query type | cityZone", error, lines: "[ 36 - 61 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT031102")
            }
        }
    },

    Zone: {
        listPrice: async (obj, args, context, info) => {
            try {
                return await Pricing.findAll({
                    where: {
                        [Sequelize.Op.or]: [
                            {id_zone_begin: obj.id || ""},
                            {id_zone_end: obj.id || ""}
                        ],
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "Zone", function: "Zone type | listPrice", error, lines: "[ 65 - 80 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT032201")
            }
        }
    },

    Mutation: {
        createZone: async (obj, {content}, context, info) => {
            try {
                const zone = await Zone.create({...content, cities: content.cities.join("-") || ""});
                const allZone = await Zone.findAll({ where: {id_company: content.id_company, deleted: false} });

                for (let i = 0; i < allZone.length; i++) {
                    await Pricing.create({
                        default_price_office:   0,
                        default_price_house:    0,
                        id_zone_begin:          zone.id,
                        id_zone_end:            allZone[i].id
                    });
                }

                return {
                    ...zone["dataValues"],
                    cities: zone["dataValues"].cities == "" ? [] : zone["dataValues"].cities.split("-")
                }
            } catch (error) {
                logger.error({ file: "Zone", function: "Mutation type | createZone", error, lines: "[ 84 - 106 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT033301")
            }
        },

        updateZone: async (obj, {id, content}, context, info) => {
            try {
                const zone = await Zone.update({...content, cities: content.cities.join("-") || ""}, { where: { id } });

                return {
                    status: zone[0] === 1
                }
            } catch (error) {
                logger.error({ file: "Zone", function: "Mutation type | updateZone", error, lines: "[ 108 - 119 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT033302")
            }
        },

        deleteZone: async (obj, {id}, context, info) => {
            try {
                const zone = await Zone.update({deleted: true}, { where: { id } });
                const pricing = await Pricing.update({deleted: true}, {
                    where: {
                        [Sequelize.Op.or]: [
                            {id_zone_begin: id},
                            {id_zone_end: id}
                        ]
                    }
                });

                console.log("pricing ", pricing);

                return {
                    status: zone[0] === 1 && pricing[0] > 0
                }
            } catch (error) {
                logger.error({ file: "Zone", function: "Mutation type | deleteZone", error, lines: "[ 121 - 142 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT033303")
            }
        }
    }
};

const {Op: Op$1} = Sequelize;

const resolvers$4 = {

    Query: {
        allPricing: async (obj, {idZone}, context, info) => {
            try {
                return await Pricing.findAll({
                    where: {
                        [Op$1.or]: [
                            {id_zone_begin: idZone},
                            {id_zone_end: idZone}
                        ],
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "Pricing", function: "Query type | person", error, lines: "[ 9 - 24 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT031101")
            }
        },
    },

    Pricing: {
        zone_begin: async (obj, args, context, info) => {
            try {
                const zone = await Zone.findOne({ where: { id: obj.id_zone_begin || "", deleted: false } });

                if (!zone) {
                    return null
                }

                return {
                    ...zone["dataValues"],
                    cities: zone["dataValues"].cities == "" ? [] : zone["dataValues"].cities.split("-")
                }
            } catch (error) {
                logger.error({ file: "Pricing", function: "Query type | zone_begin", error, lines: "[ 28 - 44 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT032201")
            }
        },

        zone_end: async (obj, args, context, info) => {
            try {
                const zone = await Zone.findOne({ where: { id: obj.id_zone_end || "", deleted: false } });

                if (!zone) {
                    return null
                }

                return {
                    ...zone["dataValues"],
                    cities: zone["dataValues"].cities == "" ? [] : zone["dataValues"].cities.split("-")
                }
            } catch (error) {
                logger.error({ file: "Pricing", function: "Query type | zone_end", error, lines: "[ 46 - 62 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT032202")
            }
        },
    },

    Mutation: {
        createPricing: async (obj, {content}, context, info) => {
            try {
                return await Pricing.create(content)
            } catch (error) {
                logger.error({ file: "Pricing", function: "Mutation type | createPricing", error, lines: "[ 66 - 73 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT033301")
            }
        },

        updatePricing: async (obj, {id, content}, context, info) => {
            try {
                const pricing = await Pricing.update(content, { where: { id } });

                return {
                    status: pricing[0] === 1
                }
            } catch (error) {
                logger.error({ file: "Pricing", function: "Mutation type | updatePricing", error, lines: "[ 75 - 86 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT033302")
            }
        },

        deletePricing: async (obj, {id}, context, info) => {
            try {
                const pricing = await Pricing.update({deleted: true}, { where: { id } });

                return {
                    status: pricing[0] === 1
                }
            } catch (error) {
                logger.error({ file: "Pricing", function: "Mutation type | deletePricing", error, lines: "[ 88 - 99 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT033303")
            }
        }
    }
};

const resolvers$3 = {

  Query: {
    allMessages: async (obj, { idCompany }, context, info) => {
      try {
        return await Messages.findAll({
          where: {
            id_company: idCompany,
            deleted: false
          }
        })
      } catch (error) {
        logger.error({ file: "Messages", function: "Query type | allMessages", error, lines: "[ 9 - 21 ]", user: context.user.user_name });
        throw new apolloServerExpress.ApolloError("error IT021101")
      }
    }
  },

  Mutation: {
    createMessage: async (obj, {content}, context, info) => {
      try {
        return await Messages.create(content)

      } catch (error) {
        logger.error({ file: "Messages", function: "Mutation type | createMessage", error, lines: "[ 25 - 33 ]", user: context.user.user_name });
        throw new apolloServerExpress.ApolloError(error)
      }
    },

    updateMessage: async (obj, {id, content}, context, info) => {
      try {
        let message = await Messages.update(content, { where: { id } });
        return {
          status: message[0] === 1
        }
      } catch (error) {
        logger.error({ file: "Messages", function: "Mutation type | updateMessage", error, lines: "[ 35 - 45 ]", user: context.user.user_name });
        throw new apolloServerExpress.ApolloError("error IT023302")
      }
    },

    deleteMessage: async (obj, {id}, context, info) => {
      try {
        let message = await Messages.update({deleted: true},{ where: { id } });
        return {
          status: message[0] === 1
        }
      } catch (error) {
        logger.error({ file: "Messages", function: "Mutation type | deleteMessage", error, lines: "[ 47 - 57 ]", user: context.user.user_name });
        throw new apolloServerExpress.ApolloError("error IT023303")
      }
    },
  }

};

const resolvers$2 = {

  Query: {
    allPickUpPlans: async (obj, { idCompany }, context, info) => {
      try {
        return await PickUp.findAll({
          where: {
            id_company: idCompany,
            deleted: false
          },
          order: [['createdAt', 'ASC']]
        })
      } catch (error) {
        logger.error({ file: "PickUp", function: "Query type | allPickUpPlans", error, lines: "[ 9 - 21 ]", user: context.user.user_name });
        throw new apolloServerExpress.ApolloError("error IT021101")
      }
    }
  },

  Mutation: {
    createPickUpPlan: async (obj, {content}, context, info) => {
      try {
        return await PickUp.create(content)

      } catch (error) {
        logger.error({ file: "PickUp", function: "Mutation type | createPickUpPlan", error, lines: "[ 25 - 33 ]", user: context.user.user_name });
        throw new apolloServerExpress.ApolloError(error)
      }
    },

    updatePickUpPlan: async (obj, {id, content}, context, info) => {
      try {
        let pickUp = await PickUp.update(content, { where: { id } });
        return {
          status: pickUp[0] === 1
        }
      } catch (error) {
        logger.error({ file: "PickUp", function: "Mutation type | updatePickUpPlan", error, lines: "[ 35 - 45 ]", user: context.user.user_name });
        throw new apolloServerExpress.ApolloError("error IT023302")
      }
    },

    deletePickUpPlan: async (obj, {id}, context, info) => {
      try {
        let pickUp = await PickUp.update({deleted: true},{ where: { id } });
        return {
          status: pickUp[0] === 1
        }
      } catch (error) {
        logger.error({ file: "PickUp", function: "Mutation type | deletePickUpPlan", error, lines: "[ 47 - 57 ]", user: context.user.user_name });
        throw new apolloServerExpress.ApolloError("error IT023303")
      }
    },
  }

};

const resolvers$1 = {

    Query: {
        allCompaniesOffers: async (obj, { idCompany }, context, info) => {
            try {
                return await CompaniesOffers.findAll({
                    where: {
                        id_company: idCompany,
                        deleted: false
                    },
                    order: [['createdAt', 'ASC']]
                })
            } catch (error) {
                logger.error({ file: "CompaniesOffers", function: "Query type | allCompaniesOffers", error, lines: "[ 9 - 21 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT021101")
            }
        }
    },

    Mutation: {
        createCompaniesOffers: async (obj, {content}, context, info) => {
            try {
                return await CompaniesOffers.create(content)

            } catch (error) {
                logger.error({ file: "CompaniesOffers", function: "Mutation type | createCompaniesOffers", error, lines: "[ 25 - 33 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError(error)
            }
        },

        updateCompaniesOffers: async (obj, {id, content}, context, info) => {
            try {
                let companiesOffers = await CompaniesOffers.update(content, { where: { id } });
                return {
                    status: companiesOffers[0] === 1
                }
            } catch (error) {
                logger.error({ file: "CompaniesOffers", function: "Mutation type | updateCompaniesOffers", error, lines: "[ 35 - 45 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT023302")
            }
        },

        deleteCompaniesOffers: async (obj, {id}, context, info) => {
            try {
                let companiesOffers = await CompaniesOffers.update({deleted: true},{ where: { id } });
                return {
                    status: companiesOffers[0] === 1
                }
            } catch (error) {
                logger.error({ file: "CompaniesOffers", function: "Mutation type | deleteCompaniesOffers", error, lines: "[ 47 - 57 ]", user: context.user.user_name });
                throw new apolloServerExpress.ApolloError("error IT023303")
            }
        },
    }

};

const typeDefs = apolloServerExpress.gql`
    directive @date(format: String = "dd/MM/yyyy HH:mm:ss") on FIELD_DEFINITION
    directive @auth(requires: [Role!] = [USER], ) on OBJECT | FIELD_DEFINITION
    
    scalar Date
    scalar Upload
    
    enum Role {
        ADMIN
        USER
        CLIENT
        ADMINCOMPANY
        ANY
    }

    type Query {
        _empty: String
    }

    type Mutation {
        _empty: String
    }

    type Subscription {
        _empty: String
    }


    type statusUpdate {
        status: Boolean
    }

    type statusDelete {
        status: Boolean
    }
`;

const resolvers = {
    Date: new graphql.GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) { return new Date(value); },
        serialize(value) { return value.getTime(); },
        parseLiteral(ast) {
            if (ast.kind === graphql.Kind.INT) { return parseInt(ast.value, 10); }
            return null;
        },
    }),

    Upload: GraphQLUpload
};

let schema = schema$3.makeExecutableSchema({
    typeDefs: [
        typeDefs, typeDefs$f, typeDefs$d, typeDefs$c, typeDefs$1,
        typeDefs$b, typeDefs$a, typeDefs$9, typeDefs$6, typeDefs$3,
        typeDefs$8, typeDefs$e, typeDefs$7, typeDefs$4, typeDefs$5, typeDefs$2
    ],
    resolvers: [
        resolvers, resolvers$e, resolvers$d, resolvers$b, resolvers$3,
        resolvers$c, resolvers$f, resolvers$a, resolvers$6, resolvers$2,
        resolvers$9, resolvers$8, resolvers$7, resolvers$5, resolvers$4,
        resolvers$1
    ]
});

schema = dateDirectiveTransformer(schema);
schema = authDirectiveTransformer(schema);

var schema$1 = schema;

const { generator, uid: uid$1 } = RandToken;
const UNAUTHORIZED = 'You must be the authenticated user to get this information';

class socketServer {

	constructor(httpServer) {
		this.io = new socket_io.Server(httpServer, {
			path: "/socket.io/",
			cors: {
				origin: ["https://stock.qafilaty.com", "https://client.qafilaty.com", "https://driver.qafilaty.com", "https://admin.qafilaty.com"]
			},
			credentials: true
		});

		//instrument(this.io, { auth: false })
		this.online_users = [];
		this.socketConnect = null;
	}

	getIds(id) {
		let data = [];
		this.online_users.map(user_id => {
			if (user_id.split("_")[1] === id) {
				data.push(user_id);
			}
		});
		return data;
	}

	socketConfig() {
		this.io.use( async (socket, next)=>{
			const nowDate = new Date();
			const dateConnection = dateFns.format(nowDate, "yyyy-MM-dd HH:mm:ss");

			let token = socket.handshake.auth.token || "";

			let Authorization = await AuthMiddleware(token);

			if (!Authorization.isAuth) {
				return next(new Error('You must be the authenticated user'));
			}

			if (socket.handshake.query.user_id == undefined || socket.handshake.query.user_id == "undefined") {
				console.log("*** No date config ***");
				return next(new Error("date config empty"));
			}

			socket['id'] = `${uid$1(3)}_${socket.handshake.query.user_id}` || this.online_users.length + 1;

			User.update({lastConnection: dateConnection}, {
				where: { id:  socket.handshake.query.user_id }
			});

			next();
		});
	}

	async connection() {
		this.socketConfig();
		this.socketConnect = await this.io.on('connection', async (socket) => {
			await this.socketInfo(socket);
			await this.sendNotifications(socket);

			this.getStatusBox(socket);

			//this.socketPacketCreate(socket)
			//this.socketPacket(socket)
			//this.socketUpgrade(socket)
			this.socketError(socket);
			this.socketDisconnect(socket);
			return await socket
		});
	}

	async socketInfo(socket) {
		console.log('\n***************************************************************************');
		console.log('*** New user information ************************************************** \n**');
		console.log('** \t A new user here his id => ', socket.id);
		console.log("** \t His room id : ", socket.handshake.query.stock_id);
		console.log("** \t Type transport connection : ", socket.conn.transport.name);
		console.log('**\n***************************************************************************');
		console.log('*** general information *************************************************** \n**');

		socket.join(socket.handshake.query.stock_id);

		let fetchSockets = await this.io.fetchSockets(); // get all sockets
		this.online_users = []; // re-empty list online users
		fetchSockets.map(socket => {
			this.online_users.push(socket.id); // add just id user
		});

		console.log("** \t Number visitor connected ", this.io.of("/").sockets.size);
		console.log("** \t Online users ========> ", this.online_users);

		console.log('**\n***************************************************************************');
		console.log('*************************************************************************** \n');
	}

	async sendNewPoints(stocks, data) {
		let listStocks = [];
		for (let i = 0; i < stocks.length; i++) {
			listStocks.push(stocks[i].id);
		}

		this.socketConnect.to(listStocks).emit("changePoints", data);
	}

	async sendNewData(id_client, stock, data) {
		const Ids = id_client !== 0 ? await this.getIds(id_client) : [];
		Ids.map(id => this.socketConnect.to(id).emit("createBox", data));
		this.socketConnect.to(stock).emit("createBox", data);
	}

	async sendNewTrace(id_client, id_stock, data, id_driver) {
		const Ids = await this.getIds(id_client);
		Ids.map(id => this.socketConnect.to(id).emit("newTrace", data));

		this.socketConnect.to(id_stock).emit("newTrace", data);

		if (id_driver !== 0) {
			const Ids = await this.getIds(id_driver);
			Ids.map(id => this.socketConnect.to(id).emit("newTrace", data));
		}
	}

	async sendNotifications(socket) {
		const stock_id = socket.handshake.query.stock_id;
		const origin = socket.request.headers.origin;
		
		const user = await User.findOne({
			where: { id: socket.id.split("_")[1] || "" }
		});
		
		console.log("sendNotifications ", socket.request.headers.origin);

		if (user.role === 'Client') {
			const dateDisconnection = user.lastDisconnection.getTime() || 0;

			const boxTrace = await BoxTrace.findAll({
				where: {  },
				include: {
					model: Box,
					as: 'box',
					required: true,
					right: true,
					where: { id_client: socket.handshake.query.client_id, deleted: false }
				},
				order: [["createdAt", "DESC"]],
				limit: 50
			});

			let newActions = 0;
			let newTrace = [];
			boxTrace.map(trace => {
				if ("dataValues" in trace && "createdAt" in trace) {
					newTrace.push(trace.dataValues);
					if((trace.createdAt.getTime() - dateDisconnection) > 0) newActions++;
				}
			});

			socket.emit("notifications", {newActions, newTrace});
		} else if (
		    ( (user.role === 'Factor' || user.role === 'AdminCompany') && (origin == 'https://stock.qafilaty.com') ) ||
		    (user.role === 'Driver' && origin == 'https://driver.qafilaty.com') 
	        
		) {
			const dateDisconnection = user.lastDisconnection.getTime() || 0;

			const boxTrace = await BoxTrace.findAll({
				include: {
					model: Box,
					as: 'box',
					required: true,
					right: true,
					attributes: ["code_box"],
					where: { id_stock: stock_id, deleted: false },
					include: {
						model: Client,
						as: 'client',
						required: true,
						right: true,
						include: {
							model: Person,
							as: 'person',
							required: true,
							right: true,
							attributes: ["first_name", "last_name"]
						}
					},
				},
				order: [["createdAt", "DESC"]],
				limit: 50
			});

			let newActions = 0;
			let newTrace = [];
			boxTrace.map(trace => {
				if ("dataValues" in trace && "createdAt" in trace) {
					newTrace.push(trace.dataValues);
					if((trace.createdAt.getTime() - dateDisconnection) > 0) newActions++;
				}
			});

			socket.emit("notifications", {newActions, newTrace});
		}
	}

	getStatusBox(socket) {
		socket.on("status", async ({codeBox}, callback) => {
			callback("got it");
			let lastTrace = null;

			if (codeBox.split("-")[0].toLowerCase() == "qaf") {
				try {
					lastTrace = await BoxTrace.findOne({
						where: {deleted: false},
						include: {
							model: Box,
							as: 'box',
							required: true,
							right: true,
							attributes: ["id_client", "id_stock"],
							where: { code_box: codeBox }
						},
						order: [["createdAt", "DESC"]],
						limit: 1
					});
				} catch (e) {
					console.log(e);
				}

				console.log("lastTrace ", lastTrace);

				const dataTrace = lastTrace ? {...lastTrace.dataValues, id_client: lastTrace.dataValues.box.id_client} : {};

				console.log("dataTrace ", dataTrace);
				socket.emit("statusBox", dataTrace);

			} else if (codeBox.split("-")[0].toLowerCase() === "env") {
				try {
					lastTrace = await DB.query(`
						SELECT box.id AS 'id_box', box.code_box, box.code_envelope, box.id_client, box.id_stock, box_trace.id, box_trace.status
						FROM boxes box
						INNER JOIN box_traces AS box_trace ON box_trace.id_box = box.id
						WHERE box.code_envelope = "${codeBox}"
						AND box_trace.id = ( SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1 )
					`, {type: Sequelize.QueryTypes.SELECT});

				} catch (e) {
					console.log(e);
				}
				const dataTrace = lastTrace ? lastTrace : [];
				console.log("dataTrace", dataTrace);
				socket.emit("statusBox", dataTrace);
			} else if (codeBox.split("-")[0].toLowerCase() === "pic") {
				try {
					lastTrace = await DB.query(`
						SELECT box.id AS 'id_box', box.code_box, box.code_pick_up, box.id_client, box.id_stock, box_trace.id, box_trace.status
						FROM boxes box
						INNER JOIN box_traces AS box_trace ON box_trace.id_box = box.id
						WHERE box.code_pick_up = "${codeBox}"
						AND box_trace.id = ( SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1 )
					`, {type: Sequelize.QueryTypes.SELECT});

				} catch (e) {
					console.log(e);
				}
				//
				const dataTrace = lastTrace ? lastTrace : [];
				console.log("dataTrace", dataTrace);
				socket.emit("statusBox", dataTrace);
			}
		});
	}

	socketError(socket) {
		socket.on("error", (err) => {
			console.log("error", err);
			if (err && err.message === UNAUTHORIZED) {
				socket.disconnect();
			}
			if (err && err.message === "date config empty") {
				socket.disconnect();
			}
		});
	}

	socketDisconnect(socket) {
		socket.on('disconnect',(data)=>{
			const nowDate = new Date();
			const dateDisconnect = dateFns.format(nowDate, "yyyy-MM-dd HH:mm:ss");

			if (socket.id.split("_")[1] != "undefined") {
				User.update({lastDisconnection: dateDisconnect}, {
					where: { id:  socket.id.split("_")[1] }
				});
			}
			console.info(`${dateDisconnect}  | visitor ${socket.id} disconnected 🖐🖐🖐`);
			this.online_users = this.online_users.filter(user => user != socket.id);
		});
	}

	socketPacketCreate(socket) {
		socket.conn.on("packetCreate", ({ type, data }) => {
			console.log("packetCreate");
			console.log({ type, data });
		});
	}

	socketPacket(socket) {
		socket.conn.on("packet", ({ type, data }) => {
			console.log("packet");
			console.log({ type, data });
		});
	}

	socketUpgrade(socket) {
		socket.conn.once("upgrade", () => {
			console.log("upgraded transport", socket.conn.transport.name);
		});
	}
}

// Import all dependencies

const __filename$1 = url.fileURLToPath((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('bundle.cjs', document.baseURI).href)));
const __dirname$1 = path.dirname(__filename$1);

exports.socket = null;

(async function () {
    // Init an Express App.
    const app = express();

    // This `app` is the returned value from `express()`.
    const httpServer = http.createServer(app);

    let whitelist = [
        'https://api.qafilaty.com',
        'https://stock.qafilaty.com',
        'https://qafilaty.com',
        "https://client.qafilaty.com",
        "https://driver.qafilaty.com",
        "https://admin.qafilaty.com",
        "https://www.elamane-cc.com",
        "https://elamane-cc.com",
        "https://track.qafilaty.com"
    ];

    let corsOptionsDelegate = function (req, callback) {
        let corsOptions;
        let regex = /192\.168\.1\.\d?\d?\d?:3000/g; //192.168.1.*

        if ((whitelist.indexOf(req.header('Origin')) !== -1) || regex.test(req.header('Origin')) ) {

            //console.log("context ", req.header('Origin'))

            corsOptions = {origin: req.header('Origin'), credentials: true};
        } else {
            corsOptions = { origin: false, credentials: false };
        }

        callback(null, corsOptions);
    };

    // Middlewares 
    app.use( cors(corsOptionsDelegate) );
    
    app.use(requestIp.mw());

    app.use(cookieParser());
    app.use(expressUseragent.express());
    // Use your dependencies here
    app.use('/images', express.static(path.join(__dirname$1, '../qafilaty')));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(helmet({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false }));
    // limit each IP to 100 requests per 15 minutes
    //app.use(rateLimit({ windowMs: 5 * 60 * 1000, max: 150}));
    // Auth Middleware
    app.use(AuthMiddleware$1);

    app.use(graphqlUploadExpress({
        maxFileSize: 10000000, // 10 MB
        maxFiles: 1,
        maxFieldSize: 10000000 // 10 MB
    }));

    // const queryComplexityRule = queryComplexity({
    //     maximumComplexity: 1000, variables: {},
    //     // eslint-disable-next-line no-console
    //     createError: (max, actual) => new GraphQLError(`Query is too complex: ${actual}. Maximum allowed complexity: ${max}`),
    //     estimators: [ simpleEstimator({ defaultComplexity: 1 }) ],
    // });
    
    const apolloServer = new apolloServerExpress.ApolloServer({ 
        schema: schema$1,
        tracing: false,
        playground: false,
        introspection: false,
        debug: false,
        //uploads: false,
        allowBatchedHttpRequests: false,
        csrfPrevention: true,
        cache: 'bounded',
        validationRules: [ 
            depthLimit(5),
            //queryComplexityRule
        ],
        plugins: [ 
            apolloServerCore.ApolloServerPluginLandingPageDisabled()
            // ApolloServerPluginDrainHttpServer({ httpServer }),
            /*process.env.NODE_ENV === 'production'
                ? ApolloServerPluginLandingPageDisabled()
                : ApolloServerPluginLandingPageGraphQLPlayground({ settings: { 'request.credentials': 'include' } }),*/
        ],
        context: ({ req, res }) => {
            
            let {user, isAuth } = req;

            if (req.header('Origin')) {
                if (res.getHeader('access-control-allow-origin') === '*') {
                    res.setHeader('access-control-allow-origin', req.header('Origin'));
                }
            } else {
                res.setHeader('access-control-allow-origin', "https://graph-api.it-hash.com:4020");
            }
            let refreshToken = req.cookies["___refresh_token"];
            
            return { res, req, user, isAuth, refreshToken };
        }
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app, path: apolloServer.graphqlPath });

    try {
        await DB.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) { 
        logger.error(error);
        console.error('Unable to connect to the database:', error);
    }
    
    try {
        exports.socket = new socketServer(httpServer);
        await exports.socket.connection();
    }  catch (error) {
        console.error('socket server error:', error);
    }

    // set port, listen for requests
    const PORT = process.env.PORT;

    // Start Server here
    httpServer.listen(PORT,() => {
        logger.info(`Server is running is http://localhost:${PORT}${apolloServer.graphqlPath}`);
    });
})();

exports.__dirname = __dirname$1;