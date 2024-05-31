import { ApolloError, UserInputError } from 'apollo-server-express';
import { Box, BoxTrace, Stock, Person, User, Client, Factor, PickUp } from '../../models/index.mjs';
import Joi from "joi"
import {socket} from "../../app.mjs"
import sequelize from "sequelize";
import logger from "../../config/Logger.mjs";
import DB from '../../config/DBContact.mjs';
import { createEmptyPoints } from "../../helpers/index.mjs";
import RandToken from 'rand-token';
const {col, QueryTypes} = sequelize;

const schema = Joi.object({
    status:      Joi.string().min(4).max(50).required(),
    note:        Joi.string().min(0).max(50),
    id_stock:    Joi.string().min(0).max(50).required(),
    id_person:   Joi.string().min(0).max(50).required(),
    id_box:      Joi.string().min(0).max(50).required()
})

export const resolvers = {

    Query: {
        boxTrace:    async (obj, args, context, info) => {
            try {
                return await BoxTrace.findAll({
                    where: {
                        id_box: args.idBox
                    }
                })
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Query type | boxTrace", error, lines: "[ 20 - 31 ]", user: context.user.user_name })
                throw new ApolloError("error IT021101")
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
                logger.error({ file: "boxTrace", function: "Query type | lastTraceBox", error, lines: "[ 32 - 45 ]", user: context.user.user_name })
                throw new ApolloError("error IT021102")
            }
        },
    },

    BoxTrace: {
        stock: async (obj, args, context, info) => {
            try {
                return await Stock.findByPk(obj.id_stock)
            } catch (error) {
                logger.error({ file: "boxTrace", function: "BoxTrace type | stock", error, lines: "[ 49 - 56 ]", user: context.user.user_name })
                throw new ApolloError("error IT022201")
            }
        },
        person: async (obj, args, context, info) => {
            try {
                return await Person.findByPk(obj.id_person)
            } catch (error) {
                logger.error({ file: "boxTrace", function: "BoxTrace type | person", error, lines: "[ 57 - 64 ]", user: context.user.user_name })
                throw new ApolloError("error IT022202")
            }
        },
        box: async (obj, args, context, info) =>  {
            try {
                return await Box.findByPk(obj.id_box)
            } catch (error) {
                logger.error({ file: "boxTrace", function: "BoxTrace type | box", error, lines: "[ 65 - 72 ]", user: context.user.user_name })
                throw new ApolloError("error IT022203")
            }
        },
    },

    Mutation: {
        createBoxTrace: async (obj, {content}, context, info) => {
            try {
                const trace = await BoxTrace.create(content)

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
                    })

                    if (content.status == 2) {
                        await Box.update({
                            code_pick_up: `Pic-${uid(7)}`,
                            status_box: content.status,
                            id_stock: content.id_stock
                        }, {where: {id: content.id_box}})
                    } else if (content.status == 3) {
                        const [box] = await DB.query(`
                            SELECT stock.id_company AS "idCompany" FROM boxes box
                            INNER JOIN stocks stock ON stock.id = box.id_stock
                            WHERE box.id = '${content.id_box}'
                        `, {type: QueryTypes.SELECT});

                        const pricePickUp = await getPriceRange(box.idCompany, 1)

                        await Box.update({
                            price_pick_up: pricePickUp,
                            status_box: content.status,
                            id_stock: content.id_stock
                        }, {where: {id: content.id_box}})
                    } else {
                        await Box.update({
                            status_box: content.status,
                            id_stock: content.id_stock
                        }, {where: {id: content.id_box}})
                    }

                    let userCleint = await User.findOne({where: {id_person: box.client.person.id}})

                    let listRome = [box.id_stock]
                    if(box.id_stock !== content.id_stock) {
                        listRome.push(content.id_stock)
                    }

                    if (box !== null) {
                        await socket.sendNewTrace(userCleint ? userCleint.id : "", listRome, {
                            ...trace["dataValues"],
                            box: box["dataValues"]
                        })
                    }
                }

                return trace
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Mutation type | createBoxTrace", error, lines: "[ 76 - 126 ]", user: context.user.user_name })
                throw new ApolloError("error IT023301")
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
                })

                if (stock == null) {
                    return new ApolloError("This stock not belong company", "STOCK_NOT_COMPANY");
                }

                for (let index = 0; index < content.boxTrace.length; index++) {
                    let date = new Date().getTime() + (1000*index)
                    const trace = await BoxTrace.create({
                        status:    content.boxTrace[index].status,
                        note:      content.note,
                        id_stock:  content.id_stock,
                        id_person: content.id_person,
                        id_box:    content.boxTrace[index].id_box,
                        createdAt: new Date(date)
                    })

                    listTrace.push(trace)

                    if (trace !== null) {
                        const oldBox = await Box.findOne({
                            attributes: ["id_stock"],
                            where: {
                                id: content.boxTrace[index].id_box
                            }
                        })

                        await Box.update({
                            code_pick_up: code_pick,
                            status_box: content.boxTrace[index].status,
                            id_stock: content.id_stock
                        }, {where: {id: content.boxTrace[index].id_box}})

                        const box = await Box.findOne({
                            attributes: ["recipient_name", "code_box", "id_driver", "id_stock", [col("client->person->user.id"), "id_user"]],
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
                        })

                        let listRome = [oldBox.id_stock]
                        if(box.id_stock !== oldBox.id_stock) {
                            listRome.push(box.id_stock)
                        }

                        if (box !== null) {
                            await socket.sendNewTrace(
                                box["dataValues"].id_user,
                                listRome,
                                {...trace["dataValues"], box: box["dataValues"]},
                                0
                            )
                        }
                    }
                }

                return listTrace
            } catch (error) {
                throw new ApolloError(error)
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
                })

                if (stock == null) {
                    return new ApolloError("This stock not belong company", "STOCK_NOT_COMPANY");
                }

                //const codeInvoice = `Inv-${generator({chars: '0-9'}).generate(7)}`

                for (let index = 0; index < content.boxTrace.length; index++) {
                    let date = new Date().getTime() + (1000*index)
                    const trace = await BoxTrace.create({
                        status:    content.boxTrace[index].status,
                        note:      content.note,
                        id_stock:  content.id_stock,
                        id_person: content.id_person,
                        id_box:    content.boxTrace[index].id_box,
                        createdAt: new Date(date)
                    })

                    listTrace.push(trace)

                    if (trace !== null) {
                        const oldBox = await Box.findOne({
                            attributes: ["id_stock"],
                            where: {
                                id: content.boxTrace[index].id_box
                            }
                        })

                        let user = null;
                        if ([3, 5, 7, 10, 16, 17, 21, 22].includes(content.boxTrace[index].status)) {
                            const factor = await Factor.findOne({where: {id_person: content.id_person}})
                            user = await User.findOne({where: {id_person: content.id_person}})

                            if (content.boxTrace[index].status == 3) {
                                const priceRange = await getPriceRange(content.id_company, content.boxTrace.length)
                                const pricePickUp = priceRange / content.boxTrace.length || 0

                                console.log("pricePickUp ", priceRange, pricePickUp)

                                await Box.update({
                                    price_pick_up: pricePickUp,
                                    status_box: content.boxTrace[index].status,
                                    id_driver: factor ? factor.id : ""
                                }, {where: {id: content.boxTrace[index].id_box} })
                            } else {

                                await Box.update({
                                    status_box: content.boxTrace[index].status,
                                    id_driver: factor ? factor.id : ""
                                }, {where: {id: content.boxTrace[index].id_box} })
                            }
                        } else {
                            if (content.boxTrace[index].status == 2) {
                                await Box.update({
                                    code_pick_up: code_pick,
                                    status_box: content.boxTrace[index].status,
                                    id_stock: content.id_stock
                                }, {where: {id: content.boxTrace[index].id_box}})
                            } else {
                                await Box.update({
                                    status_box: content.boxTrace[index].status,
                                    id_stock: content.id_stock
                                }, {where: {id: content.boxTrace[index].id_box }})
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
                        })

                        if ([4, 11, 12].includes(content.boxTrace[index].status)) {
                            const factor = await Factor.findOne({where: {id: box.id_driver}})

                            await Box.update({
                                status_box: content.boxTrace[index].status,
                                id_driver: ""
                            }, {where: {id: content.boxTrace[index].id_box} })
                            if (factor) {
                                user = await User.findOne({where: {id_person: factor.id_person}})
                            }
                        }

                        if ([9].includes(content.boxTrace[index].status)) {
                            const factor = await Factor.findOne({where: {id: box.id_driver}})

                            if (factor) {
                                user = await User.findOne({where: {id_person: factor.id_person}})
                            }
                        }

                        let userCleint = await User.findOne({where: {id_person: box.client.person.id}})

                        let listRome = [oldBox.id_stock]
                        if(box.id_stock !== oldBox.id_stock) {
                            listRome.push(box.id_stock)
                        }

                        if (box !== null) {
                            await socket.sendNewTrace(
                                userCleint ? userCleint.id : "",
                                listRome,
                                {...trace["dataValues"], box: box["dataValues"]},
                                user ? user.id : 0
                            )
                        }
                    }
                }

                return listTrace
            } catch (error) {
                console.log("createMultiTrace ", error)
                logger.error({ file: "boxTrace", function: "Mutation type | createMultiTrace", error, lines: "[ 128 - 244 ]", user: context.user.user_name })
                throw new ApolloError("error IT023302")
            }
        },

        createInvoiceTrace: async (obj, {content}, context, info) => {
            try {
                const {idS, status, note, id_stock, id_person} = content;

                let listTrace = [];

                const codeInvoice = `Inv-${uid(7)}`

                for (let index = 0; index < idS.length; index++) {
                    const trace = await BoxTrace.create({
                        status:    status,
                        note:      note,
                        id_stock:  id_stock,
                        id_person: id_person,
                        id_box:    idS[index]
                    })

                    listTrace.push(trace)

                    if (trace !== null) {
                        await Box.update({
                            status_box: status,
                            code_invoice: codeInvoice,
                            id_stock: id_stock
                        }, {where: {id: idS[index]}})

                        const box = await Box.findOne({
                            attributes: ["recipient_name", "code_box", [col("client->person->user.id"), "id_user"]],
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
                        })
                        if (box !== null) {
                            await socket.sendNewTrace(box["dataValues"].id_user, id_stock, {
                                ...trace["dataValues"],
                                box: box["dataValues"]
                            })
                        }
                    }
                }

                return listTrace
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Mutation type | createInvoiceTrace", error, lines: "[ 246 - 307 ]", user: context.user.user_name })
                throw new ApolloError("error IT023303")
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
                })

                for (let index = 0; index < boxes.length; index++) {
                    const trace = await BoxTrace.create({
                        status:    status,
                        note:      note,
                        id_stock:  id_stock,
                        id_person: id_person,
                        id_box:    boxes[index].id
                    })

                    listTrace.push(trace)

                    if (trace !== null) {
                        await Box.update({
                            status_box: status,
                            id_stock: id_stock
                        }, {where: {id: boxes[index].id}})
                        const box = await Box.findOne({
                            attributes: ["recipient_name", "code_box", [col("client->person->user.id"), "id_user"]],
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
                        })
                        if (box !== null) {
                            await socket.sendNewTrace(box["dataValues"].id_user, id_stock, {
                                ...trace["dataValues"],
                                box: box["dataValues"]
                            })
                        }
                    }
                }

                return listTrace
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Mutation type | updateTraceByCodeEnvelop", error, lines: "[ 309 - 373 ]", user: context.user.user_name })
                throw new ApolloError("error IT023304")
            }
        },

        updateBoxTrace: async (obj, {id, content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }

            try {
                let boxTrace = await BoxTrace.update(content, { where: { id } })
                return {
                    status: boxTrace[0] === 1 ? true : false
                }
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Mutation type | updateBoxTrace", error, lines: "[ 375 - 391 ]", user: context.user.user_name })
                throw new ApolloError("error IT023305")
            }
        },

        deleteBoxTrace: async (obj, {id}, context, info) => {
            try {
                let boxTrace = await BoxTrace.update({deleted: true},{ where: { id } })
                return {
                    status: boxTrace[0] === 1
                }
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Mutation type | deleteBoxTrace", error, lines: "[ 393 - 403 ]", user: context.user.user_name })
                throw new ApolloError("error IT023306")
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

                throw new ApolloError("Box Not Finish delivered");
            } catch (error) {
                logger.error({ file: "boxTrace", function: "Mutation type | accountingFactor", error, lines: "[ 405 - 421 ]", user: context.user.user_name })
                throw new ApolloError("error IT023307")
            }
        }
    }
}

const getPriceRange = async (idCompany, numberBox) => {
    const listPlans = await PickUp.findAll({
        attributes: ["price", "number_box"],
        where: {
            id_company: idCompany,
            deleted: false
        },
        order: [['number_box', 'ASC']]
    })

    if (listPlans) {
        for (let i = 0; i < listPlans.length; i++) {
            if (numberBox <= listPlans[i].number_box) {
                return listPlans[i].price
            }
        }
    } else {
        return 0
    }
}