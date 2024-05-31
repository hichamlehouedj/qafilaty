import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        boxTrace(idBox: ID!): [BoxTrace!]!
        lastTraceBox(idBox: ID!): [BoxTrace]
    }

    extend type Mutation {
        createBoxTrace (content: boxTraceContent!): BoxTrace  @auth(requires: [ANY])

        addBoxToPickUpGroup (codePickUp: String!, content: multiTraceContent!): BoxTrace  @auth(requires: [ANY])
        
        createMultiTrace (content: multiTraceContent): [BoxTrace]  @auth(requires: [ANY])
        
        createInvoiceTrace (content: invoiceTraceContent): [BoxTrace]  @auth(requires: [ANY])
        
        updateBoxTrace (id: ID!, content: boxTraceContent!): statusUpdate @auth(requires: [ANY])
        
        updateTraceByCodeEnvelop (codeEnvelop: String, content: envelopTraceContent!): [BoxTrace] @auth(requires: [ANY])
        
#        validationBoxTrace (id: ID!, content: validationTrace! ): statusUpdate

        deleteBoxTrace ( id: ID!): statusDelete @auth(requires: [ANY])
        
        accountingFactor (content: boxTraceContent!): BoxTrace @auth(requires: [ANY])
    }

    type BoxTrace {
        id:             ID
        status:         Int
        note:           String
        validation:     Boolean
        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        stock:          Stock
        person:         Person
        box:            Box
    }

    input boxTraceContent {
        status:         Int
        note:           String
        id_stock:       ID
        id_person:      ID
        id_box:         ID
    }

    input envelopTraceContent {
        status:     Int
        note:       String
        id_stock:   ID
        id_person:  ID
    }
    
    input invoiceTraceContent {
        idS:        [ID]!
        status:     Int
        note:       String
        id_stock:   ID
        id_person:  ID
    }
    
    input multiTraceContent {
        boxTrace: [multiTrace]!
        note:           String
        id_stock:       ID
        id_person:      ID
        id_company:      ID
    }

    input multiTrace {
        id_box:  ID
        status:  Int
    }

#    input validationTrace {
#        id_box:     ID!
#        id_person:  ID!
#        id_stock:   ID!
#    }
`;