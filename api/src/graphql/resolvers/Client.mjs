import { ApolloError, UserInputError } from 'apollo-server-express';
import { Person, Client, StockAccess, Stock, User, Box } from '../../models/index.mjs';
import Joi from "joi"
import { Op, QueryTypes } from 'sequelize';
import DB from '../../config/DBContact.mjs'
import logger from "../../config/Logger.mjs";

const schema = Joi.object({
    person: Joi.object({
        first_name:     Joi.string().min(3).max(50).required(),
        last_name:      Joi.string().min(3).max(50).required(),
        email:          Joi.string().email().max(50).required(),
        phone01:        Joi.string().min(10).max(15).required(),
        phone02:        Joi.string().max(15),
        address:        Joi.string().min(4).max(50).required(),
        id_stock:       Joi.string().min(0).max(50).required()
    })
})

export const resolvers = {

    Query: {
        client: async (obj, args, context, info) => {
            try {
                return await Client.findByPk(args.id)
            } catch (error) {
                logger.error({ file: "client", function: "Query type | client", error, lines: "[ 22 - 29 ]", user: context.user.user_name })
                throw new ApolloError("error IT031101")
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
                logger.error({ file: "client", function: "Query type | allClients", error, lines: "[ 31 - 56 ]", user: context.user.user_name })
                throw new ApolloError("error IT031102")
            }
        },

        currentClient: async (obj, args, {isAuth, user}, info) => {
            try {
                if (isAuth) {
                    let cleint = await Client.findOne({
                        where: {id_person: user.id_person}
                    })
                    return cleint
                }
                return "You must be the authenticated user to get this information";
            } catch (error) {
                logger.error({ file: "client", function: "Query type | currentClient", error, lines: "[ 58 - 71 ]", user: user.user_name })
                throw new ApolloError("error IT031103")
            }
        },

        statisticsClient: async (obj, {idClient}, context, info) => {
            try {
                const numberAllBox = await Box.count({
                    where: { id_client: idClient, deleted: false }
                })

                const numberAllBoxArchived = await Box.count({
                    where: { id_client: idClient, deleted: false, archived: true  }
                })

                const numberAllBoxNotArchived = await Box.count({
                    where: { id_client: idClient, deleted: false, archived: false }
                })

                const numberClassicBox = await Box.count({
                    where: {
                        id_client: idClient,
                        deleted: false,
                        price_box: 0
                    }
                })

                const numberClassicBoxArchived = await Box.count({
                    where: {
                        id_client: idClient,
                        deleted: false,
                        archived: true
                    }
                })

                const numberClassicBoxNotArchived = await Box.count({
                    where: {
                        id_client: idClient,
                        deleted: false,
                        archived: false
                    }
                })

                const numberCommercialBox = await Box.count({
                    where: {
                        id_client: idClient,
                        deleted: false,
                        price_box: {
                            [Op.gt]: 0
                        }
                    }
                })

                const numberCommercialBoxArchived = await Box.count({
                    where: {
                        id_client: idClient,
                        deleted: false,
                        archived: true,
                        price_box: {
                            [Op.gt]: 0
                        }
                    }
                })

                const numberCommercialBoxNotArchived = await Box.count({
                    where: {
                        id_client: idClient,
                        deleted: false,
                        archived: false,
                        price_box: {
                            [Op.gt]: 0
                        }
                    }
                })

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
                `, {type: QueryTypes.SELECT});

                const totalAmountDelivered = await DB.query(`
                    SELECT box.id_client, SUM(box.price_delivery) AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0
                    AND box.id_client = "${idClient}"
                    AND box_trace.status >= 8 AND box_trace.status <= 13
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_client
                `, {type: QueryTypes.SELECT});

                const totalPrepaid = await DB.query(`
                    SELECT box.id_client, SUM(box.price_delivery) AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0
                    AND box.id_client = "${idClient}"
                    AND box.paid_in_office = 1
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_client
                `, {type: QueryTypes.SELECT});

                const totalAmountTax = await DB.query(`
                    SELECT box.id_client, SUM(box.price_box * (box.TVA / 100)) AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0 AND box.price_box > 0
                    AND box.id_client = "${idClient}"
                    AND box_trace.status >= 8 AND box_trace.status <= 13
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_client
                `, {type: QueryTypes.SELECT});

                const totalAmountCancelled = await DB.query(`
                    SELECT box.id_client, COALESCE(SUM(box.price_return), 0)  AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0
                        AND box.id_client = "${idClient}"
                        AND box_trace.status = 18
                        AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_client
                `, {type: QueryTypes.SELECT});

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
                `, {type: QueryTypes.SELECT});

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
                `, {type: QueryTypes.SELECT});

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
                `, {type: QueryTypes.SELECT});

                const totalAmountPickUp = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_pick_up), 0)  AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0
                        AND box.id_client = "${idClient}"
                        AND box_trace.id = ( SELECT id FROM box_traces WHERE id_box = box.id AND status = 3 LIMIT 1 )
                    GROUP BY box.id_stock
                `, {type: QueryTypes.SELECT});

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
                logger.error({ file: "client", function: "Query type | statisticsClient", error, lines: "[ 73 - 290 ]", user: context.user.user_name })
                throw new ApolloError(error)
            }
        }
    },

    Client: {
        person: async (obj, args, context, info) =>  {
            try {
                return Person.findByPk(obj.id_person)
            } catch (error) {
                logger.error({ file: "client", function: "Client type | person", error, lines: "[ 294 - 301 ]", user: context.user.user_name })
                throw new ApolloError("error IT032201")
            }
        },
        user: async ({id_person}, args, context, info) =>  {
            try {
                return await User.findOne({
                    where: {id_person}
                })
            } catch (error) {
                logger.error({ file: "client", function: "Client type | user", error, lines: "[ 302 - 311 ]", user: context.user.user_name })
                throw new ApolloError("error IT032202")
            }
        },
        stock_accesses: async ({id_person}, args, context, info) => {
            try {
                let stock = await StockAccess.findAll({
                    where: {id_person},
                    attributes:['id_stock']
                })

                return stock
            } catch (error) {
                logger.error({ file: "client", function: "Client type | stock_accesses", error, lines: "[ 312 - 324 ]", user: context.user.user_name })
                throw new ApolloError("error IT032203")
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
                    type: QueryTypes.SELECT
                });

                let traces_Co = await DB.query(`
                    SELECT box_trace.status, COUNT(box_trace.status) AS "count" FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0 AND box.id_client = "${clientID}" AND box.price_box > 0
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box_trace.status
                `, {
                    type: QueryTypes.SELECT
                });

                let allTraces = [];

                for (let i = 0; i < traces.length; i++) {
                    let trace = traces[i]
                    allTraces.push({
                        status: trace.status,
                        numberClassic: trace.count,
                        numberCommercial: 0
                    })
                }

                for (let i = 0; i < allTraces.length; i++) {
                    let trace = allTraces[i]
                    for (let j = 0; j < traces_Co.length; j++) {
                        let traceCo = traces_Co[j]
                        if (trace.status == traceCo.status) {
                            allTraces[i] = {
                                ...allTraces[i],
                                numberClassic: trace.numberClassic - traceCo.count,
                                numberCommercial: traceCo.count
                            }
                        }
                    }
                }

                return allTraces
            } catch (error) {
                logger.error({ file: "client", function: "ClientStatistics type | allStatus", error, lines: "[ 328 - 380 ]", user: context.user.user_name })
                throw new ApolloError("error IT032204")
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
                        [Op.or]: [
                            {email: content.person.email || ""},
                            {phone01: content.person.phone01 || ""}
                        ]
                    }
                });

                if (person !== null) {
                    if (person.email === content.person.email) {
                        return new ApolloError('Email already exists', "EMAIL_EXIST")
                    } else {
                        return new ApolloError('Phone already exists', "PHONE_EXIST")
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
                logger.error({ file: "client", function: "Mutation type | createClient", error, lines: "[ 384 - 427 ]", user: context.user.user_name })
                throw new ApolloError("error IT033301")
            }
        },

        updateClient: async (obj, {id_person, content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }
            try {
                let person = await Person.update(content.person, { where: { id: id_person } })

                return {
                    status: person[0] === 1
                }

            } catch (error) {
                logger.error({ file: "client", function: "Mutation type | updateClient", error, lines: "[ 429 - 446 ]", user: context.user.user_name })
                throw new ApolloError("error IT033302")
            }
        },

        deleteClient: async (obj, {id_person}, context, info) => {
            try {
                let result = await Client.update({deleted: true},{ where: { id_person } })
                return {
                    status: result[0] === 1 ? true : false
                }
            } catch (error) {
                logger.error({ file: "client", function: "Mutation type | deleteClient", error, lines: "[ 448 - 458 ]", user: context.user.user_name })
                throw new ApolloError("error IT033303")
            }
        }
    }
}
