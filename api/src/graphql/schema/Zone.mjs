import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        allZone(idCompany: ID): [Zone!]! @auth(requires: [ANY])
        cityZone(idCompany: ID!, city: String!): Zone @auth(requires: [ANY])
    }

    extend type Mutation {
        createZone (content: zoneContent!): Zone @auth(requires: [ANY])

        updateZone (id: ID!, content: zoneContent!): statusUpdate @auth(requires: [ANY])

        deleteZone ( id: ID!): statusDelete @auth(requires: [ANY])
    }

    type Zone {
        id:         ID
        name:       String
        cities:     [String]
        listPrice:  [Pricing]
        createdAt:  Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:  Date @date(format: "dd/MM/yyyy HH:mm:ss")
        id_company: ID
    }

    input zoneContent {
        name:       String
        cities:     [String]!
        id_company: ID
    }
`;