import {ApolloError, UserInputError} from 'apollo-server-express';
import {Op, QueryTypes} from 'sequelize';
import DB from '../../config/DBContact.mjs';
import {Box, Company, Stock} from '../../models/index.mjs';
import Joi from "joi"
import logger from "../../config/Logger.mjs";
import { format as dateFormat } from 'date-fns'

const schema = Joi.object({
    name:       Joi.string().min(3).max(50).required(),
    id_company: Joi.string().min(36).max(50).required(),
    address:    Joi.string().empty('').min(0).max(50).required(),
    phone01:    Joi.string().min(9).max(50).required(),
    phone02:    Joi.string().empty('').min(0).max(50)
})

export const resolvers = {

    Query: {
        stock:    async (obj, {id}, context, info) => {
            try {
                return await Stock.findOne({where: {id, deleted: false}})
            } catch (error) {
                logger.error({ file: "stock", function: "Query type | stock", error, lines: "[ 19 - 26 ]", user: context.user.user_name })
                throw new ApolloError("error IT081101")
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
                logger.error({ file: "stock", function: "Query type | allStock", error, lines: "[ 28 - 40 ]", user: context.user.user_name })
                throw new ApolloError("error IT081102")
            }
        },

        getAllStatistics: async (obj, {idStock, idCompany}, context, info) => {
            try {
                let [numberClients] = await DB.query(`
                    SELECT sa.id_stock, COUNT(DISTINCT c.id_person) AS COUNT FROM clients c 
                    JOIN stock_accesses sa ON sa.id_person = c.id_person WHERE sa.id_stock = '${idStock || ""}'`, {
                    type: QueryTypes.SELECT
                });

                let [numberFactors] = await DB.query(`
                    SELECT sa.id_stock, COUNT(DISTINCT f.id_person) AS COUNT FROM factors f
                    JOIN stock_accesses sa ON sa.id_person = f.id_person WHERE sa.id_stock = '${idStock || ""}'`, {
                    type: QueryTypes.SELECT
                });

                let [numberUsers] = await DB.query(`
                    SELECT sa.id_stock, COUNT(DISTINCT u.id_person) AS COUNT FROM users u
                    JOIN stock_accesses sa ON sa.id_person = u.id_person WHERE sa.id_stock = '${idStock || ""}'`, {
                    type: QueryTypes.SELECT
                });

                let numberAllBoxes = await Box.count({
                    where: { id_stock: idStock || "", deleted: false }
                })

                let [numberAllStockBoxes] = await DB.query(`
                    SELECT s.id_company, s.id_company, COUNT(b.id) AS COUNT FROM stocks s
                    JOIN boxes b ON b.id_stock = s.id WHERE b.deleted = false AND s.id_company = '${idCompany}'`, {
                    type: QueryTypes.SELECT
                });

                let numberArchivedBoxes = await Box.count({
                    where: { id_stock: idStock || "", deleted: false, archived: true }
                })

                let numberNotArchivedBoxes = await Box.count({
                    where: { id_stock: idStock || "", deleted: false, archived: false }
                })

                let numberClassicBoxes = await Box.count({
                    where: { id_stock: idStock || "", deleted: false, price_box: 0 }
                })

                let numberCommercialBoxes = await Box.count({
                    where: {
                        id_stock: idStock,
                        deleted: false,
                        price_box: {
                            [Op.gt]: 0
                        }
                    }
                })

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
                logger.error({ file: "stock", function: "Query type | getAllStatistics", error, lines: "[ 42 - 111 ]", user: context.user.user_name })
                throw new ApolloError("error IT081103")
            }
        },

        statisticsStock: async (obj, {idStock}, context, info) => {
            try {
                const numberAllBox = await Box.count({
                    where: { id_stock: idStock || "", deleted: false }
                })

                const numberAllBoxArchived = await Box.count({
                    where: { id_stock: idStock || "", deleted: false, archived: true  }
                })

                const numberAllBoxNotArchived = await Box.count({
                    where: { id_stock: idStock || "", deleted: false, archived: false }
                })

                const numberClassicBox = await Box.count({
                    where: {
                        id_stock: idStock || "",
                        deleted: false,
                        price_box: 0
                    }
                })

                const numberClassicBoxArchived = await Box.count({
                    where: {
                        id_stock: idStock || "",
                        deleted: false,
                        archived: true
                    }
                })

                const numberClassicBoxNotArchived = await Box.count({
                    where: {
                        id_stock: idStock || "",
                        deleted: false,
                        archived: false
                    }
                })

                const numberCommercialBox = await Box.count({
                    where: {
                        id_stock: idStock || "",
                        deleted: false,
                        price_box: {
                            [Op.gt]: 0
                        }
                    }
                })

                const numberCommercialBoxArchived = await Box.count({
                    where: {
                        id_stock: idStock || "",
                        deleted: false,
                        archived: true,
                        price_box: {
                            [Op.gt]: 0
                        }
                    }
                })

                const numberCommercialBoxNotArchived = await Box.count({
                    where: {
                        id_stock: idStock || "",
                        deleted: false,
                        archived: false,
                        price_box: {
                            [Op.gt]: 0
                        }
                    }
                })

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
                `, {type: QueryTypes.SELECT});

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
                `, {type: QueryTypes.SELECT});

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
                `, {type: QueryTypes.SELECT});

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
                })

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
                `, {type: QueryTypes.SELECT});

                const totalPrepaid = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_delivery), 0) AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id

                    WHERE box.deleted = 0
                    AND box.id_stock = "${idStock || ""}"
                    AND box.paid_in_office = 1
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_stock
                `, {type: QueryTypes.SELECT});

                const totalAmountTax = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_box * (box.TVA / 100)), 0) AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0 AND box.price_box > 0
                    AND box.id_stock = "${idStock || ""}"
                    AND box_trace.status >= 8 AND box_trace.status <= 13
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_stock
                `, {type: QueryTypes.SELECT});

                const totalAmountCancelled = await DB.query(`
                    SELECT box.id_stock, COALESCE(SUM(box.price_return), 0)  AS "total"
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    
                    WHERE box.deleted = 0
                        AND box.id_stock = "${idStock || ""}"
                        AND box_trace.status = 18
                        AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box.id_stock
                `, {type: QueryTypes.SELECT});

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
                `, {type: QueryTypes.SELECT});

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
                logger.error({ file: "stock", function: "Query type | statisticsStock", error, lines: "[ 113 - 303 ]", user: context.user.user_name })
                throw new ApolloError(error)
            }
        }
    },

    Stock: {
        company: async ({id_company}, args, context, info) => {
            try {
                return await Company.findByPk(id_company)
            } catch (error) {
                logger.error({ file: "stock", function: "Stock type | company", error, lines: "[ 307 - 314 ]", user: context.user.user_name })
                throw new ApolloError("error IT082201")
            }
        },

        numberArchivedBoxes: async ({id}, args, context, info) => {
            try {
                return await Box.count({
                    where: { id_stock: id, deleted: false, archived: true }
                })
            } catch (error) {
                logger.error({ file: "stock", function: "Stock type | numberArchivedBoxes", error, lines: "[ 316 - 325 ]", user: context.user.user_name })
                throw new ApolloError("error IT082201")
            }
        },

        numberNotArchivedBoxes: async ({id}, args, context, info) => {
            try {
                return await Box.count({
                    where: { id_stock: id, deleted: false, archived: false }
                })
            } catch (error) {
                logger.error({ file: "stock", function: "Stock type | numberNotArchivedBoxes", error, lines: "[ 327 - 336 ]", user: context.user.user_name })
                throw new ApolloError("error IT082201")
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
                `, {type: QueryTypes.SELECT});

                let traces_Co = await DB.query(`
                    SELECT box_trace.status, COUNT(box_trace.status) AS "count" FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0 AND box.id_stock = "${stockID}" AND box.price_box > 0
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY box_trace.status
                `, {type: QueryTypes.SELECT});

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
                logger.error({ file: "stock", function: "StockStatistics type | allStatus", error, lines: "[ 341 - 389 ]", user: context.user.user_name })
                throw new ApolloError(error)
            }
        },
        chartMoney: async ({stockID}, args, context, info) => {
            try {
                const weekNow = dateFormat(new Date(), "w");

                const totalMoneyChart = await DB.query(`
                    SELECT WEEK(box_trace.createdAt) AS 'week', COALESCE(SUM(box.price_box), 0) AS 'total'
                    FROM boxes box
                    INNER JOIN box_traces box_trace ON box_trace.id_box = box.id
                    WHERE box.deleted = 0 AND box.price_box > 0 AND box.id_stock = "${stockID}"
                    AND box_trace.status IN (12, 10, 13, 11)
                    AND WEEK(box_trace.createdAt) IN (${weekNow}, ${weekNow-1}, ${weekNow-2}, ${weekNow-3}, ${weekNow-4})
                    AND box_trace.id = (SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1)
                    GROUP BY WEEK
                `, {type: QueryTypes.SELECT});

                let chart = [
                    {week: weekNow-4, total: 0 },
                    {week: weekNow-3, total: 0 },
                    {week: weekNow-2, total: 0 },
                    {week: weekNow-1, total: 0 },
                    {week: weekNow, total: 0 }
                ]

                for (let i = 0; i < totalMoneyChart.length; i++) {
                    for (let j = 0; j < chart.length; j++) {
                        if (chart[j].week == totalMoneyChart[i].week) {
                            chart[j] = {...chart[j], total: totalMoneyChart[i].total}
                        }
                    }
                }

                return chart
            } catch (error) {
                logger.error({ file: "stock", function: "StockStatistics type | chartMoney", error, lines: "[ 341 - 389 ]", user: context.user.user_name })
                throw new ApolloError("error IT083301")
            }
        },

        chartAmount: async ({stockID}, args, context, info) => {
            try {
                const weekNow = dateFormat(new Date(), "w");

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
                `, {type: QueryTypes.SELECT});

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
                `, {type: QueryTypes.SELECT});

                let chart = [
                    {week: weekNow-4, total: 0 },
                    {week: weekNow-3, total: 0 },
                    {week: weekNow-2, total: 0 },
                    {week: weekNow-1, total: 0 },
                    {week: weekNow, total: 0 }
                ]

                if (totalAmountDelivered.length > 0 || totalPrepaid.length > 0) {
                    for (let i = 0; i < chart.length; i++) {
                        for (let j = 0; j < totalAmountDelivered.length; j++) {
                            if (chart[i].week == totalAmountDelivered[j].week) {
                                chart[i] = {
                                    week: chart[i].week,
                                    total: chart[i].total + totalAmountDelivered[j].totalDelivery + totalAmountDelivered[j].totalTVA
                                }
                            }
                        }
                        for (let j = 0; j < totalPrepaid.length; j++) {
                            if (chart[i].week == totalPrepaid[j].week) {
                                chart[i] = {
                                    week: chart[i].week,
                                    total: chart[i].total + totalPrepaid[j].total
                                }
                            }
                        }
                    }
                }

                return chart
            } catch (error) {
                logger.error({ file: "stock", function: "StockStatistics type | chartAmount", error, lines: "[ 341 - 389 ]", user: context.user.user_name })
                throw new ApolloError("error IT083301")
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
                logger.error({ file: "stock", function: "Mutation type | createStock", error, lines: "[ 393 - 406 ]", user: context.user.user_name })
                throw new ApolloError("error IT083301")
            }
        },

        updateStock: async (obj, {id, content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }
            try {
                let result = await Stock.update(content, { where: { id: id } })
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "stock", function: "Mutation type | updateStock", error, lines: "[ 408 - 424 ]", user: context.user.user_name })
                throw new ApolloError("error IT083302")
            }
        },

        deleteStock: async (obj, {id}, context, info) => {
            try {
                let result = await Stock.update({deleted: true}, { where: { id: id } })
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "stock", function: "Mutation type | deleteStock", error, lines: "[ 426 - 437 ]", user: context.user.user_name })
                throw new ApolloError("error IT083303")
            }
        },

        activeStock: async (obj, {id, activation}, context, info) => {
            try {
                let result = await Stock.update({activation}, { where: { id } })
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "stock", function: "Mutation type | activeStock", error, lines: "[ 439 - 450 ]", user: context.user.user_name })
                throw new ApolloError("error IT083303")
            }
        }
    }
}
