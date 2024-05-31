import { ApolloError } from 'apollo-server-express';
import { Company, Person, Stock, StockAccess } from '../../models/index.mjs';

import logger from "../../config/Logger.mjs";

export const resolvers = {

    Query: {
        allStatisticsQafilaty: async (obj, args, context, info) => {
            try {
                return {
                    totalProfit:    1000.5,
                    totalPointsSpent: 100,
                    totalFreePoints:    500,

                    numberRegisteredCompanies:  10,
                    numberRegisteredBranches:   20,

                    totalAmountShipments:   700.5,
                    totalDeliveryProfit:    300.5,

                    totalNumberUsers:   20,
                    totalNumberEmployees:   15,
                    totalNumberClients: 50
                }
            } catch (error) {
                logger.error({ file: "Report", function: "Query type | allStatisticsQafilaty", error, lines: "[ 9 - 30 ]", user: context.user.user_name })
                throw new ApolloError("error IT071102")
            }
        },
    },

    statisticsQafilaty: {
        totalNumberShipments: async (obj, args, context, info) => {
            try {
                return {
                    totalNumber:    10,
                    activeShipments:    2,
                    archivedShipments:    5,
                    deletedShipments:    3
                }
            } catch (error) {
                logger.error({ file: "Report", function: "statisticsQafilaty type | totalNumberShipments", error, lines: "[ 34 - 46 ]", user: context.user.user_name })
                throw new ApolloError("error IT071102")
            }
        },

        totalNumberShipmentsDelivered: async (obj, args, context, info) => {
            try {
                return {
                    totalNumber:    15,
                    activeShipments:    5,
                    archivedShipments:    5,
                    deletedShipments:    5
                }
            } catch (error) {
                logger.error({ file: "Report", function: "statisticsQafilaty type | totalNumberShipmentsDelivered", error, lines: "[ 48 - 60 ]", user: context.user.user_name })
                throw new ApolloError("error IT071102")
            }
        },

        totalNumberShipmentsFailedDeliver: async (obj, args, context, info) => {
            try {
                return {
                    totalNumber:    8,
                    activeShipments:    1,
                    archivedShipments:    5,
                    deletedShipments:    2
                }
            } catch (error) {
                logger.error({ file: "Report", function: "statisticsQafilaty type | totalNumberShipmentsFailedDeliver", error, lines: "[ 62 - 75 ]", user: context.user.user_name })
                throw new ApolloError("error IT071102")
            }
        },
    }
}
