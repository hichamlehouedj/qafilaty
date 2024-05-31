import Sequelize from 'sequelize'
import DB from '../config/DBContact.mjs'

// import models

import companyModel         from './Company.mjs'
import personModel          from "./Person.mjs";
import factorModel          from "./Factor.mjs";
import clientModel          from "./Client.mjs";
import userModel            from './User.mjs';
import authTraceModel       from './AuthTrace.mjs';
import invoiceModel         from './Invoice.mjs';
import boxModel             from './Box.mjs';
import boxTraceModel        from './BoxTrace.mjs';
import stockModel           from './Stock.mjs';
import stockAccessModel     from './StockAccess.mjs';
import zoneModel            from './Zone.mjs';
import pricingModel         from './Pricing.mjs';
import messagesModel        from './Messages.mjs';
import pickUpModel          from './PickUp.mjs';
import companiesOffersModel from './CompaniesOffers.mjs';

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
Company.hasMany(Invoice, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
Invoice.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Company 1 * Messages
Company.hasMany(Messages, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
Messages.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Company 1 * Zone
Company.hasMany(Zone, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
Zone.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Zone 1 * Pricing
Zone.hasMany(Pricing, { foreignKey: { name: 'id_zone_begin' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
Pricing.belongsTo(Zone, { foreignKey: { name: 'id_zone_begin' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Zone 1 * Pricing
Zone.hasMany(Pricing, { foreignKey: { name: 'id_zone_end' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
Pricing.belongsTo(Zone, { foreignKey: { name: 'id_zone_end' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Company 1 * AuthTrace
Company.hasMany(AuthTrace, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
AuthTrace.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Company 1 * Stock
Company.hasMany(Stock, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
Stock.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Company 1 * PickUp Plan
Company.hasMany(PickUp, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
PickUp.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Company 1 * Companies Offers
Company.hasMany(CompaniesOffers, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
CompaniesOffers.belongsTo(Company, { foreignKey: { name: 'id_company' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Person 1 1 User
Person.hasOne(User, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
User.belongsTo(Person, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Person 1 1 Client
Person.hasOne(Client, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
Client.belongsTo(Person, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Person 1 1 Factor
Person.hasOne(Factor, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
Factor.belongsTo(Person, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

// Client 1 * Box
Client.hasMany(Box, { foreignKey: { name: 'id_client' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
Box.belongsTo(Client, { foreignKey: { name: 'id_client' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Client 1 * Box
Box.hasMany(BoxTrace, { foreignKey: { name: 'id_box' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
BoxTrace.belongsTo(Box, { foreignKey: { name: 'id_box' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Stock 1 * BoxTrace
Stock.hasMany(BoxTrace, { foreignKey: { name: 'id_stock' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
BoxTrace.belongsTo(Stock, { foreignKey: { name: 'id_stock' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Person 1 * BoxTrace
Person.hasMany(BoxTrace, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
BoxTrace.belongsTo(Person, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Stock 1 * BoxTrace
Stock.hasMany(StockAccess, { foreignKey: { name: 'id_stock' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
StockAccess.belongsTo(Stock, { foreignKey: { name: 'id_stock' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })

// Person 1 * BoxTrace
Person.hasMany(StockAccess, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })
StockAccess.belongsTo(Person, { foreignKey: { name: 'id_person' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'  })



// Tables are updated without being deleted
DB.sync({ alter: true, force: false })
.then(() => console.log('Tables are updated without being deleted.'))
.catch ((error) => console.error('Unable to update Tables:', error))


export { Company, User, AuthTrace, Person, Factor, Client, Invoice, Box, BoxTrace, Stock, StockAccess, Zone, Pricing, Messages, PickUp, CompaniesOffers }