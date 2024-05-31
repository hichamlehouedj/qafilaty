import { ApolloError } from 'apollo-server-express';
import { PickUp } from '../../models/index.mjs';
import logger from "../../config/Logger.mjs";

export const resolvers = {

  Query: {
    allPickUpPlans: async (obj, { idCompany }, context, info) => {
      try {
        return await PickUp.findAll({
          where: {
            id_company: idCompany,
            deleted: false
          },
          order: [['createdAt', 'ASC']]
        })
      } catch (error) {
        logger.error({ file: "PickUp", function: "Query type | allPickUpPlans", error, lines: "[ 9 - 21 ]", user: context.user.user_name })
        throw new ApolloError("error IT021101")
      }
    }
  },

  Mutation: {
    createPickUpPlan: async (obj, {content}, context, info) => {
      try {
        return await PickUp.create(content)

      } catch (error) {
        logger.error({ file: "PickUp", function: "Mutation type | createPickUpPlan", error, lines: "[ 25 - 33 ]", user: context.user.user_name })
        throw new ApolloError(error)
      }
    },

    updatePickUpPlan: async (obj, {id, content}, context, info) => {
      try {
        let pickUp = await PickUp.update(content, { where: { id } })
        return {
          status: pickUp[0] === 1
        }
      } catch (error) {
        logger.error({ file: "PickUp", function: "Mutation type | updatePickUpPlan", error, lines: "[ 35 - 45 ]", user: context.user.user_name })
        throw new ApolloError("error IT023302")
      }
    },

    deletePickUpPlan: async (obj, {id}, context, info) => {
      try {
        let pickUp = await PickUp.update({deleted: true},{ where: { id } })
        return {
          status: pickUp[0] === 1
        }
      } catch (error) {
        logger.error({ file: "PickUp", function: "Mutation type | deletePickUpPlan", error, lines: "[ 47 - 57 ]", user: context.user.user_name })
        throw new ApolloError("error IT023303")
      }
    },
  }

}
