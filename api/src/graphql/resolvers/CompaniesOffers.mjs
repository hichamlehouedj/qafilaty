import { ApolloError } from 'apollo-server-express';
import { CompaniesOffers } from '../../models/index.mjs';
import logger from "../../config/Logger.mjs";

export const resolvers = {

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
                logger.error({ file: "CompaniesOffers", function: "Query type | allCompaniesOffers", error, lines: "[ 9 - 21 ]", user: context.user.user_name })
                throw new ApolloError("error IT021101")
            }
        }
    },

    Mutation: {
        createCompaniesOffers: async (obj, {content}, context, info) => {
            try {
                return await CompaniesOffers.create(content)

            } catch (error) {
                logger.error({ file: "CompaniesOffers", function: "Mutation type | createCompaniesOffers", error, lines: "[ 25 - 33 ]", user: context.user.user_name })
                throw new ApolloError(error)
            }
        },

        updateCompaniesOffers: async (obj, {id, content}, context, info) => {
            try {
                let companiesOffers = await CompaniesOffers.update(content, { where: { id } })
                return {
                    status: companiesOffers[0] === 1
                }
            } catch (error) {
                logger.error({ file: "CompaniesOffers", function: "Mutation type | updateCompaniesOffers", error, lines: "[ 35 - 45 ]", user: context.user.user_name })
                throw new ApolloError("error IT023302")
            }
        },

        deleteCompaniesOffers: async (obj, {id}, context, info) => {
            try {
                let companiesOffers = await CompaniesOffers.update({deleted: true},{ where: { id } })
                return {
                    status: companiesOffers[0] === 1
                }
            } catch (error) {
                logger.error({ file: "CompaniesOffers", function: "Mutation type | deleteCompaniesOffers", error, lines: "[ 47 - 57 ]", user: context.user.user_name })
                throw new ApolloError("error IT023303")
            }
        },
    }

}
