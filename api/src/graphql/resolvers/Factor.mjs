import {ApolloError, UserInputError} from 'apollo-server-express';
import {Factor, Person, StockAccess, User, Stock} from '../../models/index.mjs';
import Joi from "joi"
import logger from "../../config/Logger.mjs";
import { Op } from 'sequelize'

const schema = Joi.object({
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
})

export const resolvers = {

    Query: {
        factor: async (obj, args, context, info) => {
            try {
                return await Factor.findByPk(args.id)
            } catch (error) {
                logger.error({ file: "Factor", function: "Query type | factor", error, lines: "[ 23 - 30 ]", user: context.user.user_name })
                throw new ApolloError("error IT051101")
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
                })

                console.log(allFactors)

                return allFactors
            } catch (error) {
                logger.error({ file: "Factor", function: "Query type | allFactors", error, lines: "[ 32 - 63 ]", user: context.user.user_name })
                throw new ApolloError("error IT051102")
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
                logger.error({ file: "Factor", function: "Query type | allDriver", error, lines: "[ 65 - 94 ]", user: context.user.user_name })
                throw new ApolloError("error IT051103")
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
                    })
                    return driver
                }
                return "You must be the authenticated user to get this information";
            } catch (error) {
                logger.error({ file: "Factor", function: "Query type | currentDriver", error, lines: "[ 96 - 112 ]", user: user.user_name })
                throw new ApolloError("error IT051104")
            }
        },

        currentFactor: async (obj, args, {isAuth, user}, info) => {
            try {
                if (isAuth) {
                    let driver = await Factor.findOne({
                        where: {
                            id_person: user.id_person,
                            department: {
                                [Op.ne]: "سائق"
                            }
                        }
                    })
                    return driver
                }
                return "You must be the authenticated user to get this information";
            } catch (error) {
                logger.error({ file: "Factor", function: "Query type | currentFactor", error, lines: "[ 114 - 132 ]", user: user.user_name })
                throw new ApolloError("error IT051105")
            }
        }
    },

    Factor: {
        person: async (obj, args, context, info) => {
            try {
                return await Person.findByPk(obj.id_person)
            } catch (error) {
                logger.error({ file: "Factor", function: "Factor type | person", error, lines: "[ 136 - 143 ]", user: context.user.user_name })
                throw new ApolloError("error IT052201")
            }
        },

        user: async ({id_person}, args, context, info) => {
            try {
                return await User.findOne({
                    where: {id_person}
                })
            } catch (error) {
                logger.error({ file: "Factor", function: "Factor type | user", error, lines: "[ 145 - 154 ]", user: context.user.user_name })
                throw new ApolloError("error IT052202")
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
                        [Op.or]: [
                            {email: content.person.email},
                            {phone01: content.person.phone01}
                        ]
                    }
                });

                if (onePerson !== null) {
                    if (onePerson.email === content.person.email) {
                        return new ApolloError('Email already exists', "EMAIL_EXIST", {})
                    } else {
                        return new ApolloError('Phone already exists', "PHONE_EXIST", {})
                    }
                }

                let person = await Person.create(content.person)

                let stock = await StockAccess.create({
                    id_person: person.id,
                    id_stock: content.person.id_stock
                })

                let factor = await Factor.create({
                    id_person: person.id,
                    department: content.department,

                    salary_type: content.salary_type || "wage",
                    salary: content.salary || 0
                })

                if (factor) {
                    return factor
                }

            } catch (error) {
                console.log(error)
                logger.error({ file: "Factor", function: "Mutation type | createFactor", error, lines: "[ 158 - 202 ]", user: context.user.user_name })
                throw new ApolloError("error IT053301")
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
                    person = await Person.update(content.person, { where: { id: id_person } })
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
                    )
                }

                return {
                    status: person[0] === 1 || factor[0] === 1
                }

            } catch (error) {
                logger.error({ file: "Factor", function: "Mutation type | updateFactor", error, lines: "[ 204 - 236 ]", user: context.user.user_name })
                throw new ApolloError("error IT053302")
            }
        },

        deleteFactor: async (obj, {id_person}, context, info) => {
            try {
                let result = await Factor.update({deleted: true}, { where: { id_person } })
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "Factor", function: "Mutation type | deleteFactor", error, lines: "[ 238 - 248 ]", user: context.user.user_name })
                throw new ApolloError("error IT053303")
            }
        }
    }
}
