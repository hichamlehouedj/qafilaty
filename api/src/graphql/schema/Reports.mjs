import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        #        person(id: ID!): Person! @auth(requires: [ANY])
        allStatisticsQafilaty: statisticsQafilaty @auth(requires: [ANY])
    }

    type statisticsQafilaty {
        totalProfit:    Float
        totalPointsSpent: Int
        totalFreePoints:    Int

        numberRegisteredCompanies:  Int
        numberRegisteredBranches:   Int

        totalAmountShipments:   Float
        totalDeliveryProfit:    Float

        totalNumberUsers:   Int
        totalNumberEmployees:   Int
        totalNumberClients: Int

        totalNumberShipments:   Shipments
        totalNumberShipmentsDelivered:  Shipments
        totalNumberShipmentsFailedDeliver:  Shipments
    }

    type Shipments {
        totalNumber:    Int

        activeShipments:    Int
        archivedShipments:    Int
        deletedShipments:    Int
    }

`;