import { GraphQLScalarType, Kind } from 'graphql';
import { gql } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';

import {authDirectiveTransformer, authDirectiveTypeDefs, dateDirectiveTransformer, dateDirectiveTypeDefs} from './directives/index.mjs';

import {
    typeDefsBox, typeDefsClient, typeDefsCompany, typeDefsFactor, typeDefsInvoice, typeDefsPerson, typeDefsUser,
    typeDefsBoxTrace, typeDefsStock, typeDefsReports, typeDefsPricing, typeDefsZone, typeDefsMessages, typeDefsPickUp,
    typeDefsCompaniesOffers
} from './schema/index.mjs';
import {
    resolversBox, resolversBoxTrace, resolversClient, resolversFactor, resolversCompany, resolversInvoice, resolversPerson,
    resolversUser, resolversStock, resolversReports, resolversZone, resolversPricing, resolversMessages, resolversPickUp,
    resolversCompaniesOffers
} from './resolvers/index.mjs'
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";

const typeDefs = gql`
    directive @date(format: String = "dd/MM/yyyy HH:mm:ss") on FIELD_DEFINITION
    directive @auth(requires: [Role!] = [USER], ) on OBJECT | FIELD_DEFINITION
    
    scalar Date
    scalar Upload
    
    enum Role {
        ADMIN
        USER
        CLIENT
        ADMINCOMPANY
        ANY
    }

    type Query {
        _empty: String
    }

    type Mutation {
        _empty: String
    }

    type Subscription {
        _empty: String
    }


    type statusUpdate {
        status: Boolean
    }

    type statusDelete {
        status: Boolean
    }
`;

const resolvers = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) { return new Date(value); },
        serialize(value) { return value.getTime(); },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) { return parseInt(ast.value, 10); }
            return null;
        },
    }),

    Upload: GraphQLUpload
}

let schema = makeExecutableSchema({
    typeDefs: [
        typeDefs, typeDefsBox, typeDefsClient, typeDefsCompany, typeDefsCompaniesOffers,
        typeDefsFactor, typeDefsInvoice, typeDefsPerson, typeDefsReports, typeDefsMessages,
        typeDefsUser, typeDefsBoxTrace, typeDefsStock, typeDefsPricing, typeDefsZone, typeDefsPickUp
    ],
    resolvers: [
        resolvers, resolversBox, resolversBoxTrace, resolversFactor, resolversMessages,
        resolversClient, resolversCompany, resolversInvoice, resolversReports, resolversPickUp,
        resolversPerson, resolversUser, resolversStock, resolversZone, resolversPricing,
        resolversCompaniesOffers
    ]
});

schema = dateDirectiveTransformer(schema)
schema = authDirectiveTransformer(schema)

export default schema