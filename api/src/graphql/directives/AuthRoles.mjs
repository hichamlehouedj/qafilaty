import {defaultFieldResolver} from "graphql";
import { AuthenticationError } from "apollo-server-express";
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'

export default function authDirective(directiveName) {
    let typeDirectiveArgumentMaps = {}
    return {
        authDirectiveTypeDefs: `
            directive @${directiveName}( requires: [Role!] = [ANY], ) on OBJECT | FIELD_DEFINITION
            enum Role {
                ADMIN
                USER
                CLIENT
                ADMINCOMPANY
                ANY
            }
        `,

        authDirectiveTransformer: (schema) => mapSchema(schema, {
            [MapperKind.TYPE]: type => {
                let authDirective = getDirective(schema, type, directiveName)
                if(authDirective && authDirective.length > 0) authDirective = authDirective[0]
                if (authDirective) typeDirectiveArgumentMaps[type.name] = authDirective
                return undefined
            },

            [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
                let authDirective = getDirective(schema, fieldConfig, directiveName)
                if(authDirective && authDirective.length > 0) {authDirective = authDirective[0]}
                else authDirective = typeDirectiveArgumentMaps[typeName]

                if (authDirective) {
                    const { requires } = authDirective
                    if (requires) {
                        const { resolve = defaultFieldResolver } = fieldConfig

                        fieldConfig.resolve = function (source, args, context, info) {
                            const {user, isAuth} = context

                            if (!isAuth || !user) {
                                throw new AuthenticationError(`You must be the authenticated user to get this information`);
                            }

                            const roleUser = user.role.toUpperCase()

                            if (requires.includes("ANY")) {
                                return resolve(source, args, context, info)
                            }

                            if(!isAuth || !requires.includes(roleUser)) {
                                throw new AuthenticationError(`You need following role: ${requires}`);
                            }

                            return resolve(source, args, context, info)

                        }
                        return fieldConfig
                    }
                }
            }
        })
    }
}