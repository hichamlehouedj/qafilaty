import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        allPricing(idZone: ID): [Pricing!]! @auth(requires: [ANY])
    }

    extend type Mutation {
        createPricing (content: pricingContent!): Pricing @auth(requires: [ANY])

        updatePricing (id: ID!, content: pricingContent!): statusUpdate @auth(requires: [ANY])

        deletePricing ( id: ID!): statusDelete @auth(requires: [ANY])
    }

    type Pricing {
        id:                     ID
        default_price_office:   Float
        default_price_house:    Float
        createdAt:              Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:              Date @date(format: "dd/MM/yyyy HH:mm:ss")
        zone_begin:             Zone
        zone_end:               Zone
    }

    input pricingContent {
        default_price_office:   Float
        default_price_house:    Float
        id_zone_begin:     ID
        id_zone_end:       ID
    }

`;