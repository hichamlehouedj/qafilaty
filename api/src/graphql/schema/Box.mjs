import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        box(id: ID): Box!  @auth(requires: [ANY])
        getBoxs(ids: [ID!]): [Box!]  @auth(requires: [ANY])
        allBox(idStock: ID!): [Box!]  @auth(requires: [ANY])
        boxClient(idClient: ID): [Box!]  @auth(requires: [ANY])
        boxDriver(idDriver: ID): [Box!]  @auth(requires: [ANY])
        boxInvoice(codeInvoice: ID): [Box!]  @auth(requires: [ANY])
        boxInvoiceDriver(codeInvoice: ID): [Box!]  @auth(requires: [ANY])
        boxInvoiceDriverPickUp(codeInvoice: ID): [Box!]  @auth(requires: [ANY])
        boxEnvelope(codeEnvelope: ID): [Box!]  @auth(requires: [ANY])
        profileClient(idClient: ID): contentProfile  @auth(requires: [ANY])
        openEnvelopeCity(idStock: ID): [BoxCity!]  @auth(requires: [ANY])
        closeEnvelopeCity(idStock: ID): [BoxCity!]  @auth(requires: [ANY])
        readyEnvelopeCity(idStock: ID): [BoxCity!]  @auth(requires: [ANY])
        deliveryEnvelopeCity(idStock: ID): [BoxCity!]  @auth(requires: [ANY])
        listPickUpClient(idClient: ID): [PickUPGroup!]  @auth(requires: [ANY])
        deliveredDriverBox(idDriver: ID): [Box!]  @auth(requires: [ANY])
        pickedUpBox(idDriver: ID): [Box!]  @auth(requires: [ANY])
    }

    extend type Mutation {
        createBox (content: boxContent!): Box  @auth(requires: [ANY])

        trackBox(codeBox: ID): Box
        
        updateBox (id: ID!, content: boxContent!): statusUpdate  @auth(requires: [ANY])

        archiveBox (id: ID! ): statusUpdate  @auth(requires: [ANY])

        deleteBox ( id: ID! ): statusDelete  @auth(requires: [ANY])

        driverCommission(idBoxes: [ID!]!): statusUpdate @auth(requires: [ANY])
        
        driverCommissionPickUp(idBoxes: [ID!]!): statusUpdate @auth(requires: [ANY])

        addEnvelopeCode(idStock: ID!, city: String): contentCodeEnvelope  @auth(requires: [ANY])

        deleteEnvelopeCode(codeEnvelope: String): contentCodeEnvelope  @auth(requires: [ANY])
    }
    
    extend type Subscription {
        boxCreated(idStock: ID!): Box
        boxUpdated(idStock: ID!): BoxTrace
    }
    
    type contentCodeEnvelope {
        codeEnvelope: String
    }

    type BoxCity {
        city: String
        totalMouny: String
        numberBox: Int
        codeEnvelope: String
    }

    type PickUPGroup {
        code:       String
        status:     String
        createdAt:  Date @date(format: "dd/MM/yyyy HH:mm:ss")
        numberBox:  Int
    }
    
    type contentProfile { 
        boxs: [Box!]
        amountsUnderCollection: [Box!]
        amountsCollected: [Box!]
    }
    
    type Box {
        id:                                 ID!
        recipient_name:                     String
        recipient_phone1:                   String
        recipient_phone2:                   String
        recipient_city:                     String
        recipient_address:                  String
        recipient_loction:                  String
        code_box:                           String
        status_box:                         Int
        command_number:                     String
        payment_type:                       String
        fragile:                            Boolean
        delivery_type:                      String
        categorie:                          String
        height_box:                         String
        width_box:                          String
        length_box:                         String
        weight_box:                         String
        price_box:                          Float
        code_pick_up:                       String
        price_pick_up:                      Float
        price_return:                       Float
        price_delivery:                     Float
        paid_in_office:                     Boolean
        possibility_open:                   Boolean
        encapsulation:                      Boolean
        TVA:                                Int
        note:                               String
        archived:                           Boolean
        code_invoice:                       String
        code_envelope:                      String
        code_driver_commission:             String
        cd_commission_pickup:               String
        createdAt:                          Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:                          Date @date(format: "dd/MM/yyyy HH:mm:ss")
        stock:                              Stock
        client:                             Client
        lastTrace:                          [BoxTrace]!
        traceBox:                           [BoxTrace]!
    }

    input boxContent {
        recipient_name:                     String
        recipient_phone1:                   String
        recipient_phone2:                   String
        recipient_city:                     String
        recipient_address:                  String
        recipient_loction:                  String
        status_box:                         Int
        command_number:                     String
        payment_type:                       String
        fragile:                            Boolean
        delivery_type:                      String
        categorie:                          String
        height_box:                         String
        width_box:                          String
        length_box:                         String
        weight_box:                         String
        price_box:                          Float
        price_delivery:                     Float
        paid_in_office:                     Boolean
        possibility_open:                   Boolean
        encapsulation:                      Boolean
        TVA:                                Int
        note:                               String
        id_stock:                           ID
        id_client:                          ID
        id_person:                          ID
    }
`;