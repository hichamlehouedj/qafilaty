import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        factor(id: ID!): Factor @auth(requires: [ANY])
        allFactors(idStock: ID!): [Factor] @auth(requires: [ANY])
        allDriver(idCompany: ID!): [Factor] @auth(requires: [ANY])
        currentDriver: Factor @auth(requires: [ANY])
        currentFactor: Factor @auth(requires: [ANY])
    }

    extend type Mutation {

        createFactor (content: contentFactor!): Factor @auth(requires: [ANY])
    
        updateFactor (id_person: ID!, content: contentFactor!): statusUpdate @auth(requires: [ANY])

        deleteFactor (id_person: ID!): statusDelete @auth(requires: [ANY])
    }

    type Factor {
        id:         ID!
        person:     Person @auth(requires: [ANY])
        department: String
        salary_type: String
        salary: Float
        user: User @auth(requires: [ANY])
    }

    input contentFactor {
        department: String
        salary_type: String
        salary: Float
        person: contentPerson
    }

`;