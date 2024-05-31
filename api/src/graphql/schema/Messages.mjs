import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        allMessages(idCompany: ID!): [Messages!]!
    }

    extend type Mutation {
        createMessage (content: messagesContent!): Messages  @auth(requires: [ANY])

        updateMessage (id: ID!, content: messagesContent!): statusUpdate @auth(requires: [ANY])

        deleteMessage ( id: ID!): statusDelete @auth(requires: [ANY])
    }

    type Messages {
        id:        ID
        type:      String
        message:   String
        
        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
    }

    input messagesContent {
        type:           String
        message:        String
        id_company:     ID
    }
`;