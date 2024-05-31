import { ApolloError, UserInputError } from 'apollo-server-express';
import { Company, Person, Stock, StockAccess } from '../../models/index.mjs';

import Joi from "joi"
import logger from "../../config/Logger.mjs";

const schema = Joi.object({
    first_name:     Joi.string().min(3).max(50).required(),
    last_name:      Joi.string().min(3).max(50).required(),
    email:          Joi.string().email().max(50).required(),
    phone01:        Joi.string().min(10).max(15).required(),
    phone02:        Joi.string().max(15),
    address:        Joi.string().min(4).max(50).required(),
    id_stock:       Joi.string().min(0).max(50).required()
})

export const resolvers = {

    Query: {
        person: async (obj, {id}, context, info) => {
            try {
                return await Person.findByPk(id)
            } catch (error) {
                logger.error({ file: "person", function: "Query type | person", error, lines: "[ 20 - 27 ]", user: context.user.user_name })
                throw new ApolloError("error IT071101")
            }
        },
        allPersons: async (obj, args, context, info) => {
            try {
                return await Person.findAll()
            } catch (error) {
                logger.error({ file: "person", function: "Query type | allPersons", error, lines: "[ 28 - 35 ]", user: context.user.user_name })
                throw new ApolloError("error IT071102")
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
                })

                return await Company.findByPk(stockUser.stock.id_company)
            } catch (error) {
                logger.error({ file: "person", function: "Query type | allMessages", error, lines: "[ 39 - 54 ]", user: context.user.user_name })
                throw new ApolloError("error IT072201")
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
                logger.error({ file: "person", function: "Query type | allMessages", error, lines: "[ 55 - 66 ]", user: context.user.user_name })
                throw new ApolloError("error IT072202")
            }
        },
    },

    StockAccess: {
        stock: async ({id_stock}, args, context, info) => {
            try {
                return await Stock.findByPk( id_stock )
            } catch (error) {
                logger.error({ file: "person", function: "StockAccess type | stock", error, lines: "[ 74 - 82 ]", user: context.user.user_name })
                throw new ApolloError("error IT073301")
            }
        },
    },

    Mutation: {
        createPerson: async (obj, {content}, context, info) => {
            try {
                await schema.validateAsync(content);
            } catch (errors) {
                throw new UserInputError(errors.message)
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

                if (!person) { return new ApolloError('IT000001') }

                person = await Person.create(content)
                await StockAccess.create({
                    id_stock: content.id_stock,
                    id_person: person.id
                })

                return person
            } catch (error) {
                logger.error({ file: "person", function: "Mutation type | createPerson", error, lines: "[ 81 - 111 ]", user: context.user.user_name })
                throw new ApolloError("error IT074401")
            }
        },

        updatePerson: async (obj, {id, content}, context, info) => {
            try {
                await schema.validateAsync(content);
            } catch (errors) {
                throw new UserInputError(errors.message)
            }

            try {
                let person = await Person.update(content, { where: { id } })

                return {
                    status: person[0] === 1
                }
            } catch (error) {
                logger.error({ file: "person", function: "Mutation type | updatePerson", error, lines: "[ 113 - 130 ]", user: context.user.user_name })
                throw new ApolloError("error IT074402")
            }
        },

        deletePerson: async (obj, {id}, context, info) => {
            try {
                let result = await Person.update({deleted: true},{ where: { id } })
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "person", function: "Mutation type | deletePerson", error, lines: "[ 132 - 142 ]", user: context.user.user_name })
                throw new ApolloError("error IT074403")
            }
        }
    }
}
