import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        stock(id: ID!): Stock! @auth(requires: [ANY])
        allStock(idCompany: ID!): [Stock!] @auth(requires: [ANY])
        getAllStatistics(idCompany: ID, idStock: ID): allStatistics! @auth(requires: [ANY])
        statisticsStock(idStock: ID): StockStatistics! @auth(requires: [ANY])
    }

    extend type Mutation {
        createStock (content: stockContent): Stock @auth(requires: [ANY])
        
        updateStock (id: ID!, content: stockContent): statusUpdate @auth(requires: [ANY])

        deleteStock ( id: ID! ): statusDelete @auth(requires: [ANY])
        
        activeStock ( id: ID!, activation: String ): statusUpdate @auth(requires: [ANY])
    }

    type Stock {
        id:                      ID!
        name:                    String
        city:                    String
        address:                 String
        phone01:                 String
        phone02:                 String
        activation:              String
        numberArchivedBoxes:     Int
        numberNotArchivedBoxes:  Int
        createdAt:   Date @date(format: "dd/MM/yyyy HH:mm:ss")
        company:     Company @auth(requires: [ANY])
    }

    type StockStatistics {
        numberAllBox:                   Int
        numberAllBoxArchived:           Int
        numberAllBoxNotArchived:        Int

        numberClassicBox:               Int
        numberClassicBoxArchived:       Int
        numberClassicBoxNotArchived:    Int

        numberCommercialBox:            Int
        numberCommercialBoxArchived:    Int
        numberCommercialBoxNotArchived: Int

        moneyDriver:            Float
        moneyReadyReceive:      Float
        moneyReceived:          Float

        totalCommissions:       Float
        totalAmountDelivered:   Float
        totalAmountTax:         Float
        totalPrepaid:           Float
        totalAmountCancelled:   Float
        totalAmountPickUp:      Float

        allStatus:              [statusContent!]

        chartMoney:     [Chart!]
        
        chartAmount:    [Chart!]
    }

    type Chart {
        week:  Int
        total:  Float
    }
    
    type allStatistics {
        numberClients:           Int
        numberFactors:           Int
        numberUsers:             Int
        numberAllBoxes:          Int
        numberAllStockBoxes:     Int
        numberArchivedBoxes:     Int
        numberNotArchivedBoxes:  Int
        numberClassicBoxes:      Int
        numberCommercialBoxes:   Int
        deliveryProfit:          Float
        readyProfit:             Float
    }

    type StockAccessIds {
        id: ID
        id_stock: ID
        id_person: ID
    }

    input stockContent {
        name:        String
        city:        String
        address:     String
        phone01:     String
        phone02:     String
        id_company:  ID!
    }
`;