import { ApolloError } from 'apollo-server-express';
import { Messages } from '../../models/index.mjs';
import sequelize from "sequelize";
import logger from "../../config/Logger.mjs";
const {col} = sequelize;

export const resolvers = {

  Query: {
    allMessages: async (obj, { idCompany }, context, info) => {
      try {
        return await Messages.findAll({
          where: {
            id_company: idCompany,
            deleted: false
          }
        })
      } catch (error) {
        logger.error({ file: "Messages", function: "Query type | allMessages", error, lines: "[ 9 - 21 ]", user: context.user.user_name })
        throw new ApolloError("error IT021101")
      }
    }
  },

  Mutation: {
    createMessage: async (obj, {content}, context, info) => {
      try {
        return await Messages.create(content)

      } catch (error) {
        logger.error({ file: "Messages", function: "Mutation type | createMessage", error, lines: "[ 25 - 33 ]", user: context.user.user_name })
        throw new ApolloError(error)
      }
    },

    updateMessage: async (obj, {id, content}, context, info) => {
      try {
        let message = await Messages.update(content, { where: { id } })
        return {
          status: message[0] === 1
        }
      } catch (error) {
        logger.error({ file: "Messages", function: "Mutation type | updateMessage", error, lines: "[ 35 - 45 ]", user: context.user.user_name })
        throw new ApolloError("error IT023302")
      }
    },

    deleteMessage: async (obj, {id}, context, info) => {
      try {
        let message = await Messages.update({deleted: true},{ where: { id } })
        return {
          status: message[0] === 1
        }
      } catch (error) {
        logger.error({ file: "Messages", function: "Mutation type | deleteMessage", error, lines: "[ 47 - 57 ]", user: context.user.user_name })
        throw new ApolloError("error IT023303")
      }
    },
  }

}
