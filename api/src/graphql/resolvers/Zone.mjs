import { ApolloError } from 'apollo-server-express';
import {Zone, Pricing} from '../../models/index.mjs';
import logger from "../../config/Logger.mjs";
import { Op, literal, col, QueryTypes } from 'sequelize';
import DB from '../../config/DBContact.mjs'

export const resolvers = {

    Query: {
        allZone: async (obj, {idCompany}, context, info) => {
            try {
                const zone = await Zone.findAll({
                    where: {
                        id_company: idCompany,
                        deleted: false
                    }
                })
                let listZone  = []

                if (!zone) {
                    return []
                }

                for (let i = 0; i < zone.length; i++) {
                    listZone.push({
                        ...zone[i]["dataValues"],
                        cities: zone[i]["dataValues"].cities == "" ? [] : zone[i]["dataValues"].cities.split("-")
                    })
                }

                return listZone
            } catch (error) {
                logger.error({ file: "Zone", function: "Query type | allZone", error, lines: "[ 8 - 34 ]", user: context.user.user_name })
                throw new ApolloError("error IT031101")
            }
        },

        cityZone: async (obj, {idCompany, city}, context, info) => {
            try {
                const zone = await DB.query(`
                    SELECT id, name, cities, deleted, createdAt, updatedAt, id_company
                    FROM zones AS zone
                    WHERE zone.id_company = '${idCompany}' 
                    AND (
                        ( CHAR_LENGTH(zone.cities) > 2 AND  (zone.cities LIKE '%${city}-%' OR zone.cities LIKE '%-${city}%') )
                        OR ( CHAR_LENGTH(zone.cities) <= 2 AND  zone.cities LIKE '${city}' )
                    )
                    LIMIT 1;
                `, {type: QueryTypes.SELECT})
                
                /*const zone = await Zone.findOne({
                    attributes: ["id", "name", "cities", [literal("CHAR_LENGTH(zone.cities)"), "LENGTH"], "deleted", "createdAt", "updatedAt"],
                    where: {
                        id_company: idCompany,
                        [Op.or]: [
                            {[Op.and]: [
                                {
                                    '$LENGTH$': { [Op.gt]: 2 }
                                    
                                },
                                {cities: { 
                                    [Op.or]: [ 
                                        {[Op.substring]: `${city}-`}, 
                                        {[Op.substring]: `-${city}`} 
                                    ]
                                    
                                }}
                            ]},
                            
                            {[Op.and]: [
                                {'$LENGTH$': { [Op.lte]: 2 }},
                                {cities: city}
                            ]},
                        ],
                        deleted: false
                    }
                })*/
                
                if (!zone) {
                    return null
                }

                return {
                    ...zone[0],
                    cities: zone[0].cities == "" ? [] : zone[0].cities.split("-")
                }
            } catch (error) {
                
                    console.log(error)
                logger.error({ file: "Zone", function: "Query type | cityZone", error, lines: "[ 36 - 61 ]", user: context.user.user_name })
                throw new ApolloError("error IT031102")
            }
        }
    },

    Zone: {
        listPrice: async (obj, args, context, info) => {
            try {
                return await Pricing.findAll({
                    where: {
                        [Op.or]: [
                            {id_zone_begin: obj.id || ""},
                            {id_zone_end: obj.id || ""}
                        ],
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "Zone", function: "Zone type | listPrice", error, lines: "[ 65 - 80 ]", user: context.user.user_name })
                throw new ApolloError("error IT032201")
            }
        }
    },

    Mutation: {
        createZone: async (obj, {content}, context, info) => {
            try {
                const zone = await Zone.create({...content, cities: content.cities.join("-") || ""})
                const allZone = await Zone.findAll({ where: {id_company: content.id_company, deleted: false} })

                for (let i = 0; i < allZone.length; i++) {
                    await Pricing.create({
                        default_price_office:   0,
                        default_price_house:    0,
                        id_zone_begin:          zone.id,
                        id_zone_end:            allZone[i].id
                    })
                }

                return {
                    ...zone["dataValues"],
                    cities: zone["dataValues"].cities == "" ? [] : zone["dataValues"].cities.split("-")
                }
            } catch (error) {
                logger.error({ file: "Zone", function: "Mutation type | createZone", error, lines: "[ 84 - 106 ]", user: context.user.user_name })
                throw new ApolloError("error IT033301")
            }
        },

        updateZone: async (obj, {id, content}, context, info) => {
            try {
                const zone = await Zone.update({...content, cities: content.cities.join("-") || ""}, { where: { id } })

                return {
                    status: zone[0] === 1
                }
            } catch (error) {
                logger.error({ file: "Zone", function: "Mutation type | updateZone", error, lines: "[ 108 - 119 ]", user: context.user.user_name })
                throw new ApolloError("error IT033302")
            }
        },

        deleteZone: async (obj, {id}, context, info) => {
            try {
                const zone = await Zone.update({deleted: true}, { where: { id } })
                const pricing = await Pricing.update({deleted: true}, {
                    where: {
                        [Op.or]: [
                            {id_zone_begin: id},
                            {id_zone_end: id}
                        ]
                    }
                })

                console.log("pricing ", pricing)

                return {
                    status: zone[0] === 1 && pricing[0] > 0
                }
            } catch (error) {
                logger.error({ file: "Zone", function: "Mutation type | deleteZone", error, lines: "[ 121 - 142 ]", user: context.user.user_name })
                throw new ApolloError("error IT033303")
            }
        }
    }
}
