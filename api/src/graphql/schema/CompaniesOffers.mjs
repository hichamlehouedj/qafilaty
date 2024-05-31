import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        allCompaniesOffers(idCompany: ID!): [CompaniesOffers!] @auth(requires: [ANY])
    }

    extend type Mutation {
        createCompaniesOffers (content: companiesOffersContent!): CompaniesOffers  @auth(requires: [ADMINCOMPANY])

        updateCompaniesOffers (id: ID!, content: pickUpPlanContent!): statusUpdate @auth(requires: [ADMINCOMPANY])

        deleteCompaniesOffers ( id: ID!): statusDelete @auth(requires: [ADMINCOMPANY])
    }

    type CompaniesOffers {
        id:                ID
        title:             String
        description:       String
        discount_return:   Int
        discount_delivery: Int
        status:            String

        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
    }

    input companiesOffersContent {
        title:             String
        description:       String
        discount_return:   Int
        discount_delivery: Int
        status:            String
        id_company:        ID
    }
`;