import { ApolloError, UserInputError } from 'apollo-server-express';
import {Box, BoxTrace, Client, Person, Stock, Company, User, Factor} from '../../models/index.mjs';
import Joi from "joi"
import {socket} from "../../app.mjs"
import logger from "../../config/Logger.mjs";
import {Op, col, QueryTypes, literal} from 'sequelize';
import DB from '../../config/DBContact.mjs'
import { createEmptyPoints } from "../../helpers/index.mjs";
import RandToken from 'rand-token';

const { generator, uid } = RandToken;

const schema = Joi.object({
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
})

export const resolvers = {
    Query: {
        box: async (obj, args, context, info) => {
            try {
                return await Box.findByPk(args.id)
            } catch (error) {
                logger.error({ file: "box", function: "Query type | box", error, lines: "[ 32 - 39 ]", user: context.user.user_name })
                return new ApolloError("error IT011101")
            }
        },
        getBoxs: async (obj, {ids}, context, info) => {
            try {
                return await Box.findAll({
                    where: {
                        id: {
                            [Op.in]: ids,
                        },
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "box", function: "Query type | getBoxs", error, lines: "[ 43 - 55 ]", user: context.user.user_name })
                return new ApolloError("error IT011102")
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
                logger.error({ file: "box", function: "Query type | allBox", error, lines: "[ 43 - 55 ]", user: context.user.user_name })
                return new ApolloError("error IT011102")
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
                logger.error({ file: "box", function: "Query type | boxClient", error, lines: "[ 57 - 69 ]", user: context.user.user_name })
                return new ApolloError("error IT011103")
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
                logger.error({ file: "box", function: "Query type | boxInvoice", error, lines: "[ 71 - 83 ]", user: context.user.user_name })
                return new ApolloError("error IT011103")
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
                logger.error({ file: "box", function: "Query type | boxInvoiceDriver", error, lines: "[ 71 - 83 ]", user: context.user.user_name })
                return new ApolloError("error IT011103")
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
                logger.error({ file: "box", function: "Query type | boxInvoiceDriverPickUp", error, lines: "[ 71 - 83 ]", user: context.user.user_name })
                return new ApolloError("error IT011103")
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
                logger.error({ file: "box", function: "Query type | boxEnvelope", error, lines: "[ 85 - 98 ]", user: context.user.user_name })
                return new ApolloError("error IT011103")
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
                `, {type: QueryTypes.SELECT});
            } catch (error) {
                logger.error({ file: "box", function: "Query type | boxDriver", error, lines: "[ 99 - 122 ]", user: context.user.user_name })
                return new ApolloError("error IT011103")
            }
        },
        profileClient: async (obj, {idClient}, context, info) =>  {
            try {
                const boxs = await Box.findAll({
                    where: {
                        id_client: idClient || "",
                        deleted: false,
                        status_box: {
                            [Op.notIn]: [10, 11, 12, 13]
                        }
                    }
                })

                const amountsUnderCollection = await Box.findAll({
                    where: {
                        id_client: idClient || "",
                        deleted: false,
                        status_box: {
                            [Op.notIn]: [10, 11]
                        }
                    }
                })

                const amountsCollected = await Box.findAll({
                    where: {
                        id_client: idClient || "",
                        deleted: false,
                        status_box: 12
                    }
                })

                return {
                    boxs: boxs,
                    amountsUnderCollection,
                    amountsCollected
                }
            } catch (error) {
                logger.error({ file: "box", function: "Query type | profileClient", error, lines: "[ 123 - 163 ]", user: context.user.user_name })
                return new ApolloError("error IT011104")
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
                `, {type: QueryTypes.SELECT});

                return moneyCity
            } catch (e) {
                logger.error({ file: "box", function: "Query type | openEnvelopeCity", error, lines: "[ 164 - 183 ]", user: context.user.user_name })
                throw new ApolloError("error IT011105")
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
                `, {type: QueryTypes.SELECT});

                // console.log("moneyCity ", moneyCity)

                return moneyCity
            } catch (error) {
                logger.error({ file: "box", function: "Query type | closeEnvelopeCity", error, lines: "[ 184 - 205 ]", user: context.user.user_name })
                throw new ApolloError("error IT011106")
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
                `, {type: QueryTypes.SELECT});

                //console.log("moneyCity ", moneyCity)

                return moneyCity
            } catch (error) {
                logger.error({ file: "box", function: "Query type | readyEnvelopeCity", error, lines: "[ 206 - 227 ]", user: context.user.user_name })
                throw new ApolloError("error IT011107")
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
                `, {type: QueryTypes.SELECT});

                return moneyCity
            } catch (error) {
                logger.error({ file: "box", function: "Query type | deliveryEnvelopeCity", error, lines: "[ 228 - 247 ]", user: context.user.user_name })
                throw new ApolloError("error IT011108")
            }
        },
        listPickUpClient: async (obj, { idClient }, context, info) => {
            try {
                const list = await Box.findAll({
                    attributes: [[col("code_pick_up"), "code"], [literal(`COUNT(box.id)`), "numberBox"], [col("box_traces.status"), "status"], [col("box_traces.createdAt"), "createdAt"]],
                    where: {
                        id_client: idClient,
                        deleted: false,
                        code_pick_up: {
                            [Op.not]: ""
                        },
                        "$box_traces.status$": {
                            [Op.in]: [2, 3]
                        },
                        "$box_traces.id$": {
                            [Op.eq]: literal(`(
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
                })

                let listPickUp = []

                for (let i = 0; i < list.length; i++) {
                    listPickUp.push(list[i]["dataValues"])
                }

                return listPickUp
            } catch (error) {
                logger.error({ file: "box", function: "Query type | listPickUpClient", error, lines: "[ 228 - 247 ]", user: context.user.user_name })
                throw new ApolloError("error IT011108")
            }
        },
        deliveredDriverBox: async (obj, { idDriver }, context, info) => {
            try {
                const driver = await Factor.findByPk(idDriver)

                return await Box.findAll({
                    where: {
                        deleted: false,
                        "$box_traces.id$": {
                            [Op.eq]: literal(`(
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
                logger.error({ file: "box", function: "Query type | deliveredDriverBox", error, lines: "[ 228 - 247 ]", user: context.user.user_name })
                throw new ApolloError("error IT011108")
            }
        },

        pickedUpBox: async (obj, { idDriver }, context, info) => {
            try {
                const driver = await Factor.findOne({
                    attributes: ["id", "id_person"],
                    where: {
                        id: idDriver
                    }
                })

                return await Box.findAll({
                    where: {
                        deleted: false,
                        "$box_traces.id$": {
                            [Op.eq]: literal(`(
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
                logger.error({ file: "box", function: "Query type | pickedUpBox", error, lines: "[ 228 - 247 ]", user: context.user.user_name })
                throw new ApolloError("error IT011108")
            }
        },
    },

    Box: {
        stock: async (obj, args, context, info) => {
            try {
                return await Stock.findByPk(obj.id_stock)
            } catch (error) {
                logger.error({ file: "box", function: "Box type | stock", error, lines: "[ 251 - 259 ]", user: context.user.user_name })
                return new ApolloError("error IT012201")
            }
        },
        client: async (obj, args, context, info) => {
            try {
                return await Client.findByPk(obj.id_client);
            } catch (error) {
                logger.error({ file: "box", function: "Box type | client", error, lines: "[ 260 - 268 ]", user: context.user.user_name })
                throw new ApolloError("error IT012202")
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
                logger.error({ file: "box", function: "Box type | lastTrace", error, lines: "[ 269 - 284 ]", user: context.user.user_name })
                throw new ApolloError("error IT012203")
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
                logger.error({ file: "box", function: "Box type | traceBox", error, lines: "[ 285 - 299 ]", user: context.user.user_name })
                throw new ApolloError("error IT012204")
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
                logger.error({ file: "box", function: "Mutation type | trackBox", error, lines: "[ 303 - 315 ]"})
                return new ApolloError("error IT011101")
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
                })

                const pointsCompany = stock["dataValues"].company.points

                if (pointsCompany == 0) {
                    let company = await Company.update({
                        lastDateEmptyPoints: new Date()
                    }, {
                        where: { id: stock.id_company }
                    });
                    await createEmptyPoints({
                        to: stock["dataValues"].company.email
                    })
                    //return new ApolloError("You don't have points until you do this process", "BALANCE_EMPTY")
                }

                let box = await Box.create({
                    ...content,
                    code_box: `Qaf-${uid(7)}`,
                    price_return: stock["dataValues"].company.return_price
                })

                let id_box = box.id;

                let boxTrace = await BoxTrace.create({
                    status:         content.status_box,
                    note:           content.note,
                    id_stock:       content.id_stock,
                    id_person:      content.id_person,
                    validation:     true,
                    id_box:         id_box
                })

                let person = await Person.findOne({
                    where: {
                        id: boxTrace.id_person
                    }
                });

                
                let clientBox = await getClientBox(box.id_client)

                const boxOne = await Box.findOne({
                    attributes: ["id", "recipient_city", "price_box", "recipient_name", "createdAt", "archived", "code_box", [col("client->person->user.id"), "id_user"]],
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
                })

                const userClient = clientBox.client[0]["dataValues"].person.user ? clientBox.client[0]["dataValues"].person.user.id : 0

                if (boxOne) {
                    try {
                        await socket.sendNewData(userClient, content.id_stock, {
                            ...boxOne["dataValues"],
                            lastTrace: [{
                                ...boxTrace["dataValues"],
                                person: person["dataValues"],
                                stock: stock["dataValues"]
                            }],
                            ...clientBox
                        })
                        console.log("createBox.sendNewData ======================================================> ")
                    } catch (error) {
                        console.log(error)
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
                })
                await socket.sendNewPoints(allStock, {points: pointsCompany - 1})

                return box;
            } catch (error) {
                logger.error({ file: "box", function: "Mutation type | createBox", error, lines: "[ 317 - 427 ]", user: context.user.user_name })
                return new ApolloError("error IT013301")
            }
        },

        updateBox: async (obj, {id, content, noteTrace}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }

            try {
                let result = await Box.update(content, { where: { id: id } })

                // if (result[0] === 1) {
                //     pubsub.publish('BOX_UPDATED', { boxUpdated: boxTrace["dataValues"] });
                // }

                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "box", function: "Mutation type | updateBox", error, lines: "[ 429 - 451 ]", user: context.user.user_name })
                throw new ApolloError("error IT013302")
            }
        },

        deleteBox: async (obj, {id}, context, info) => {
            try {
                let result = await Box.update({deleted: true}, { where: { id } })
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "box", function: "Mutation type | deleteBox", error, lines: "[ 453 - 464 ]", user: context.user.user_name })
                throw new ApolloError("error IT013303")
            }
        },

        archiveBox: async (obj, {id}, context, info) => {
            try {
                const PAYMENT_TYPE = 'مدفوع';
                const TRACE_DELIVERED = 'تم التسليم';
                const TRACE_CHARGED = 'تمت محاسبة المندوب';
                const TRACE_PAID = "تم الدفع للعميل"


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
                logger.error({ file: "box", function: "Mutation type | archiveBox", error, lines: "[ 466 - 496 ]", user: context.user.user_name })
                throw new ApolloError("error IT013304")
            }
        },

        addEnvelopeCode: async (obj, {idStock, city}, context, info) => {
            try {
                const codeInvoice = `Env-${uid(7)}`
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
                `, {type: QueryTypes.UPDATE});


                return {
                    codeEnvelope: moneyCity[1] > 0 ? codeInvoice : "0"
                }
            } catch (e) {
                logger.error({ file: "box", function: "Mutation type | addEnvelopeCode", error, lines: "[ 498 - 526 ]", user: context.user.user_name })
                throw new ApolloError(e)
            }
        },

        deleteEnvelopeCode: async (obj, {idStock, codeEnvelope}, context, info) => {
            try {
                const deleteEnvelope = await Box.update({code_envelope: "0"}, { where: { code_envelope: codeEnvelope } })

                return {
                    codeEnvelope: deleteEnvelope[0] > 0 ? "0" : code_envelope
                }
            } catch (e) {
                logger.error({ file: "box", function: "Mutation type | deleteEnvelopeCode", error, lines: "[ 528 - 539 ]", user: context.user.user_name })
                throw new ApolloError(e)
            }
        },

        driverCommission: async (obj, {idBoxes}, context, info) => {
            try {
                const boxes = await Box.update({
                    code_driver_commission: `DCom-${uid(7)}`
                }, {
                    where: {
                        id: {
                            [Op.in]: idBoxes
                        }
                    }
                })

                return {
                    status: boxes[0] > 0
                }
            } catch (e) {
                throw new ApolloError(e)
            }
        },

        driverCommissionPickUp: async (obj, {idBoxes}, context, info) => {
            try {
                const boxes = await Box.update({
                    cd_commission_pickup: `DCom-${uid(7)}`
                }, {
                    where: {
                        id: {
                            [Op.in]: idBoxes
                        }
                    }
                })

                return {
                    status: boxes[0] > 0
                }
            } catch (e) {
                throw new ApolloError(e)
            }
        }
    },
}

const archivedBox = async (id_box, status) => {
    const DATE_NOW = new Date();
    const DAY_IN_MILLISECONDS = 86400000;
    try {
        let traceBox = await BoxTrace.findOne({
            where: { id_box, deleted: false, status}
        });

        if (traceBox) {
            if (((DATE_NOW - traceBox.createdAt) / DAY_IN_MILLISECONDS) >= 2) {
                let result = await Box.update({archived: true}, { where: { id: id_box } })
                return result[0] === 1;
            } else {
                return new ApolloError("You can't archive the box yet");
            }
        } else {
            return new ApolloError("Box Not Finish delivered");
        }
    } catch (error) {
        logger.error({ file: "box", function: "archivedBox", error, lines: "[ 543 - 566 ]" })
        throw new ApolloError("error IT014401")
    }
}

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
        logger.error({ file: "box", function: "getClientBox", error, lines: "[ 568 - 597 ]" })
        throw new ApolloError(error)
    }

    return {
        client: [client]
    }
}