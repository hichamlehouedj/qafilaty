import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        client(id: ID!): Client  @auth(requires: [ANY])
        # allClientsStock(idStock: ID!): [Client!]!
        # allClientsCompany(idCompany: ID!): [Client!]!
        allClients(idStock: ID!): [Client!]  @auth(requires: [ANY])
        currentClient: Client @auth(requires: [ANY])
        statisticsClient(idClient: ID): ClientStatistics!  @auth(requires: [ANY])
    }

    extend type Mutation {
        createClient (content: contentClient): Client  @auth(requires: [ANY])
        updateClient (id_person: ID!, content: contentClient!): statusUpdate  @auth(requires: [ANY])
        deleteClient (id_person: ID!): statusDelete  @auth(requires: [ANY])
    }


    type Client {
        id:     ID!
        person: Person  @auth(requires: [ANY])
        user: User  @auth(requires: [ANY])
        stock_accesses: [StockAccessIds!]
    }

    input contentClient {
        person: contentPerson
    }

    type ClientStatistics {
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
        moneyStock:             Float
        moneyReadyReceive:      Float
        moneyReceived:          Float

        totalCommissions:       Float
        totalAmountDelivered:   Float
        totalAmountTax:         Float
        totalPrepaid:           Float
        totalAmountCancelled:   Float
        totalAmountPickUp:      Float
        
        allStatus:              [statusContent!]
    }

    type statusContent {
        status:         Int
        numberClassic:  Int
        numberCommercial: Int
    }
`;