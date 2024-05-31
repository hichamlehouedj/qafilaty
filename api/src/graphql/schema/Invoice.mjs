import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        invoice(id: ID!): Invoice @auth(requires: [ANY])
        allInvoicesCompany(id_company: ID): [Invoice!] @auth(requires: [ANY])
        allInvoices: [Invoice!] @auth(requires: [ANY])
    }

    extend type Mutation {
        createInvoice (content: contentInvoice!): Invoice! @auth(requires: [ANY])
        updateInvoice (id: ID!, content: contentInvoice!): statusUpdate @auth(requires: [ANY])
        changeStatusInvoice (id: ID!, status: String!): statusUpdate @auth(requires: [ANY])
        deleteInvoice (id: ID!): statusDelete @auth(requires: [ANY])
    }

    type Invoice {
        id:             ID!
        code_invoice:   String
        points:         Int
        price:          Float
        status:         String
        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        company:        Company @auth(requires: [ANY])
    }

    input contentInvoice {
        points:         Int
        id_company:     ID!
    }
`;
