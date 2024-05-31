import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        allPickUpPlans(idCompany: ID!): [PickUpPlan!] @auth(requires: [ANY])
    }

    extend type Mutation {
        createPickUpPlan (content: pickUpPlanContent!): PickUpPlan  @auth(requires: [ANY])

        updatePickUpPlan (id: ID!, content: pickUpPlanContent!): statusUpdate @auth(requires: [ANY])

        deletePickUpPlan ( id: ID!): statusDelete @auth(requires: [ANY])
    }

    type PickUpPlan {
        id:        ID
        price:     Float
        number_box:   Int

        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        updatedAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
    }

    input pickUpPlanContent {
        price:     Float
        number_box:   Int
#        id_company:     ID
    }
`;