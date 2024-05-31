import { ApolloError } from 'apollo-server-express';
import {Company, Invoice} from '../../models/index.mjs';
import Joi from "joi"
import logger from "../../config/Logger.mjs";

import { createEmptyPoints } from "../../helpers/index.mjs";
import RandToken from 'rand-token';

const { generator, uid } = RandToken;

const schema = Joi.object({
    product:        Joi.string().min(0).max(50).required(),
    price:          Joi.string().min(0).max(50).required(),
    id_company:     Joi.string().min(0).max(50).required()
})

export const resolvers = {

    Query: {
        invoice: async (obj, {id}, context, info) => {
            try {
                return await Invoice.findByPk(id)
            } catch (error) {
                logger.error({ file: "invoice", function: "Query type | invoice", error, lines: "[ 16 - 23 ]", user: context.user.user_name })
                throw new ApolloError("error IT061101")
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
                logger.error({ file: "invoice", function: "Query type | allInvoices", error, lines: "[ 25 - 37 ]", user: context.user.user_name })
                throw new ApolloError("error IT061102")
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
                logger.error({ file: "invoice", function: "Query type | allInvoices", error, lines: "[ 25 - 37 ]", user: context.user.user_name })
                throw new ApolloError("error IT061102")
            }
        },
    },

    Invoice: {
        company: async ({id_company}, args, context, info) => {
            try {
                return await Company.findByPk(id_company)
            } catch (error) {
                logger.error({ file: "invoice", function: "Invoice type | company", error, lines: "[ 41 - 48 ]", user: context.user.user_name })
                throw new ApolloError("error IT062201")
            }
        },
    },

    Mutation: {
        createInvoice: async (obj, {content}, context, info) => {
            try {
                const codeInvoice = `Pts-${uid(8)}`
                return await Invoice.create({
                    ...content,
                    price:          content.points * 10,
                    status:         "waiting",
                    code_invoice: codeInvoice
                })
            } catch (error) {
                logger.error({ file: "invoice", function: "Mutation type | createInvoice", error, lines: "[ 52 - 65 ]", user: context.user.user_name })
                throw new ApolloError("error IT063301")
            }
        },

        updateInvoice: async (obj, {id, content}, context, info) => {
            try {
                let invoice = await Invoice.update(content, { where: { id } })

                return {
                    status: invoice[0] === 1
                }

            } catch (error) {
                logger.error({ file: "invoice", function: "Mutation type | updateInvoice", error, lines: "[ 67 - 79 ]", user: context.user.user_name })
                throw new ApolloError("error IT063302")
            }
        },

        changeStatusInvoice: async (obj, {id, status}, context, info) => {
            try {
                const invoice = await Invoice.findOne({ where: { id } })

                let updateInvoice = null
                if(status == "active") {
                    updateInvoice = await Invoice.update({status}, { where: { id } })

                    if(updateInvoice[0] === 1) {
                        let company = await Company.increment('points', {
                            by: invoice.points,
                            where: { id: invoice.id_company }
                        });
                    }
                } else {
                    updateInvoice = await Invoice.update({status}, { where: { id } })
                }

                return {
                    status: updateInvoice[0] === 1
                }

            } catch (error) {
                logger.error({ file: "invoice", function: "Mutation type | changeStatusInvoice", error, lines: "[ 81 - 93 ]", user: context.user.user_name })
                throw new ApolloError("error IT063302")
            }
        },

        deleteInvoice: async (obj, {id}, context, info) => {
            try {
                let result = await Invoice.update({deleted: true}, { where: { id } })

                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "invoice", function: "Mutation type | deleteInvoice", error, lines: "[ 95 - 106 ]", user: context.user.user_name })
                throw new ApolloError("error IT063303")
            }
        }
    }

}
