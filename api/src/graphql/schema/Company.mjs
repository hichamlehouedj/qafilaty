import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        company(id: ID!): Company! @auth(requires: [ANY])
        allCompany: [Company!]! @auth(requires: [ANY])
        getAllStatisticsCompany(idCompany: ID): allStatisticsCompany! @auth(requires: [ANY])
    }

    extend type Mutation {
        createCompany(content: contentCompany): Company! @auth(requires: [ANY])

        updateCompany(id: ID!, content: contentUpdateCompany): statusDelete @auth(requires: [ANY])

        deleteCompany(id: ID!): statusDelete @auth(requires: [ANY])
        
        createAdminCompany(content: contentAdmin): Company
        
        activeCompany ( id: ID!, activation: String ): statusUpdate @auth(requires: [ANY])

        activeAdminCompany ( idCompany: ID! ): statusUpdate @auth(requires: [ANY])
        uploadLogo (idCompany: ID!, logo: Upload!): statusUpdate @auth(requires: [ADMINCOMPANY])
        
    }

    type Company {
        id:             ID!
        name:           String
        logo:           String
        phone01:        String
        phone02:        String
        email:          String
        url_site:       String
        city:           String
        address:        String
        points:         Int
        TVA:            Float
        plus_size:      Float
        plus_tail:      Float
        value_plus_size:Float
        value_plus_tail:Float
        return_price:   Float
        change_price:   Float
        price_in_state: Float
        pickup:         Boolean
        pickup_price:   Float

        encapsulation:         Boolean
        encapsulation_price:   Float
        defult_weight:  Float
        defult_length:  Float
        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        lastDateEmptyPoints: Date @date(format: "dd/MM/yyyy HH:mm:ss")
        activation:     String

        listMessages: [Messages!]
        listPickUpPlan: [PickUpPlan]
        numberArchivedBoxes:     Int @auth(requires: [ANY])
        numberNotArchivedBoxes:  Int @auth(requires: [ANY])
    }

    type CompanyInfo {
        company:        Company!
        admin:          User!
    }

    input contentUpdateCompany {
        name:           String
        logo:           String
        phone01:        String
        phone02:        String
        email:          String
        url_site:       String
        city:           String
        address:        String
        TVA:            Float
        plus_size:      Float
        plus_tail:      Float
        value_plus_size:Float
        value_plus_tail:Float
        return_price:   Float
        change_price:   Float
        defult_weight:  Float
        defult_length:  Float
        price_in_state: Float
        pickup:         Boolean
        pickup_price:   Float

        encapsulation:         Boolean
        encapsulation_price:   Float
        activation:     String

        pickUpPlanContent: [pickUpPlanContent!]
    }

    input contentCompany {
        nameCompany:    String
        phoneCompany:   String
        cityCompany:    String
        addressCompany: String
    }
    
    input contentPersonAdmin {
        first_name:     String
        last_name:      String
        email:          String
        phone01:        String
        phone02:        String
        city:           String
        address:        String
    }

    input contentAdmin {
        password:       String!
        person:         contentPersonAdmin!
        company:        contentCompany!
    }

    type allStatisticsCompany {
        numberClients:           Int
        numberFactors:           Int
        numberUsers:             Int
        numberAllStock:          Int

        numberArchivedBoxes:     Int
        numberNotArchivedBoxes:  Int
        numberClassicBoxes:      Int
        numberCommercialBoxes:   Int

        deliveryProfit:          Float
        readyProfit:             Float
        exportProfit:            Float

        points:                  Int
    }
`;