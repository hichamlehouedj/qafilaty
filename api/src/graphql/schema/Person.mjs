import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        person(id: ID!): Person! @auth(requires: [ANY])
        allPersons: [Person!]! @auth(requires: [ANY])
    }

    extend type Mutation {
        createPerson (content: contentPerson): Person @auth(requires: [ANY])
        updatePerson (id: ID!, content: contentPerson!): statusUpdate @auth(requires: [ANY])
        deletePerson (id: ID!): statusDelete @auth(requires: [ANY])
    }

    type Person {
        id:                     ID!
        first_name:             String
        last_name:              String
        email:                  String
        phone01:                String
        phone02:                String
        city:                   String
        address:                String
        deleted:                Boolean
        createdAt:              Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:              Date @date(format: "dd/MM/yyyy HH:mm:ss")
        list_stock_accesses:    StockAccess
        company:                Company @auth(requires: [ANY])
    }

    type StockAccess {
        id:             ID!
        createdAt:      Date
        updatedAt:      Date
        stock:          Stock
        # person:         Person
    }

    input contentPerson {
        first_name:     String
        last_name:      String
        email:          String
        phone01:        String
        phone02:        String
        city:           String
        address:        String
        id_stock:       ID
    }
`;