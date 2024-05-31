import { ApolloError } from 'apollo-server-express';
import {Pricing, Zone} from '../../models/index.mjs';
import sequelize from 'sequelize';
import logger from "../../config/Logger.mjs";
const {Op} = sequelize;

export const resolvers = {

    Query: {
        allPricing: async (obj, {idZone}, context, info) => {
            try {
                return await Pricing.findAll({
                    where: {
                        [Op.or]: [
                            {id_zone_begin: idZone},
                            {id_zone_end: idZone}
                        ],
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "Pricing", function: "Query type | person", error, lines: "[ 9 - 24 ]", user: context.user.user_name })
                throw new ApolloError("error IT031101")
            }
        },
    },

    Pricing: {
        zone_begin: async (obj, args, context, info) => {
            try {
                const zone = await Zone.findOne({ where: { id: obj.id_zone_begin || "", deleted: false } })

                if (!zone) {
                    return null
                }

                return {
                    ...zone["dataValues"],
                    cities: zone["dataValues"].cities == "" ? [] : zone["dataValues"].cities.split("-")
                }
            } catch (error) {
                logger.error({ file: "Pricing", function: "Query type | zone_begin", error, lines: "[ 28 - 44 ]", user: context.user.user_name })
                throw new ApolloError("error IT032201")
            }
        },

        zone_end: async (obj, args, context, info) => {
            try {
                const zone = await Zone.findOne({ where: { id: obj.id_zone_end || "", deleted: false } })

                if (!zone) {
                    return null
                }

                return {
                    ...zone["dataValues"],
                    cities: zone["dataValues"].cities == "" ? [] : zone["dataValues"].cities.split("-")
                }
            } catch (error) {
                logger.error({ file: "Pricing", function: "Query type | zone_end", error, lines: "[ 46 - 62 ]", user: context.user.user_name })
                throw new ApolloError("error IT032202")
            }
        },
    },

    Mutation: {
        createPricing: async (obj, {content}, context, info) => {
            try {
                return await Pricing.create(content)
            } catch (error) {
                logger.error({ file: "Pricing", function: "Mutation type | createPricing", error, lines: "[ 66 - 73 ]", user: context.user.user_name })
                throw new ApolloError("error IT033301")
            }
        },

        updatePricing: async (obj, {id, content}, context, info) => {
            try {
                const pricing = await Pricing.update(content, { where: { id } })

                return {
                    status: pricing[0] === 1
                }
            } catch (error) {
                logger.error({ file: "Pricing", function: "Mutation type | updatePricing", error, lines: "[ 75 - 86 ]", user: context.user.user_name })
                throw new ApolloError("error IT033302")
            }
        },

        deletePricing: async (obj, {id}, context, info) => {
            try {
                const pricing = await Pricing.update({deleted: true}, { where: { id } })

                return {
                    status: pricing[0] === 1
                }
            } catch (error) {
                logger.error({ file: "Pricing", function: "Mutation type | deletePricing", error, lines: "[ 88 - 99 ]", user: context.user.user_name })
                throw new ApolloError("error IT033303")
            }
        }
    }
}
