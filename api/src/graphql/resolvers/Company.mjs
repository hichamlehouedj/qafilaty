import {ApolloError, UserInputError} from 'apollo-server-express';
import Joi from 'joi';
import {Box, Company, Person, Stock, StockAccess, User, BoxTrace, Messages, PickUp} from '../../models/index.mjs';
import logger from "../../config/Logger.mjs";
import DB from '../../config/DBContact.mjs';
import {Op, QueryTypes} from "sequelize";
import bcrypt from 'bcryptjs';
import { issueAuthToken, createMail, createMailNewUser } from '../../helpers/index.mjs';
import path from "path";
import {createWriteStream} from "fs";
import {__dirname} from "../../app.mjs";
import {v4 as UUIDV4} from "uuid";

const { hash, compare } = bcrypt;

const schema = Joi.object({
    name:           Joi.string().min(3).max(50).required(),
    phone01:        Joi.string().min(10).max(15).required(),
    phone02:        Joi.string().empty('').min(0).max(15),
    email:          Joi.string().email().max(50).required(),
    url_site:       Joi.string().empty('').max(50),
    address:        Joi.string().min(4).max(50).required(),
    logo:           Joi.string().empty('').min(0).max(255),
})

export const resolvers = {
    Query: {
        company: async (obj, args, context, info) => {
            try {
                return await Company.findByPk(args.id)
            } catch (error) {
                logger.error({ file: "company", function: "Query type | company", error, lines: "[ 23 - 30 ]", user: context.user.user_name })
                throw new ApolloError("error IT041101")
            }
        },

        allCompany: async (obj, args, context, info) => {
            try {
                return await Company.findAll()
            } catch (error) {
                logger.error({ file: "company", function: "Query type | allCompany", error, lines: "[ 32 - 39 ]", user: context.user.user_name })
                throw new ApolloError("error IT041102")
            }
        },

        getAllStatisticsCompany: async (obj, {idCompany}, context, info) => {
            try {
                let [numberClients] = await DB.query(`
                    SELECT s.id_company, COUNT(DISTINCT c.id_person) AS COUNT FROM clients c
                    JOIN stock_accesses sa ON sa.id_person = c.id_person
                    JOIN stocks s ON s.id = sa.id_stock
                    WHERE s.id_company = "${idCompany}" AND c.deleted = false`, {
                    type: QueryTypes.SELECT
                });


                let [numberFactors] = await DB.query(`
                    SELECT s.id_company, COUNT(DISTINCT f.id_person) AS COUNT FROM factors f
                    JOIN stock_accesses sa ON sa.id_person = f.id_person 
                    JOIN stocks s ON s.id = sa.id_stock
                    WHERE s.id_company = '${idCompany}' AND f.deleted = false`, {
                    type: QueryTypes.SELECT
                });

                let [numberUsers] = await DB.query(`
                    SELECT s.id_company, COUNT(DISTINCT u.id_person) AS COUNT FROM users u
                    JOIN stock_accesses sa ON sa.id_person = u.id_person 
                    JOIN stocks s ON s.id = sa.id_stock
                    WHERE s.id_company = '${idCompany}'`, {
                    type: QueryTypes.SELECT
                });

                let numberAllStock = await Stock.count({
                    where: { id_company: idCompany, deleted: false }
                })

                    let [numberAllBox] = await DB.query(`
                    SELECT s.id_company, COUNT(DISTINCT bt.id_box) AS COUNT FROM box_traces bt
                    JOIN stocks s ON s.id = bt.id_stock
                    WHERE s.id_company = '${idCompany}' AND bt.deleted = false AND s.deleted = false`, {
                        type: QueryTypes.SELECT
                    });

                

                let numberArchivedBoxes = await Stock.count({
                    where: { id_company: idCompany, deleted: false, "$box_traces->box.archived$": true },
                    include: {
                        model: BoxTrace, as: "box_traces", required: true, right: true,
                        include: { model: Box, as: "box", required: true, right: true }
                    }
                })

                let numberNotArchivedBoxes = await Stock.count({
                    where: { id_company: idCompany, deleted: false, "$box_traces->box.archived$": false },
                    include: {
                        model: BoxTrace, as: "box_traces", required: true, right: true,
                        include: { model: Box, as: "box", required: true, right: true }
                    }
                })

                let numberClassicBoxes = await Stock.count({
                    where: { id_company: idCompany, deleted: false, "$box_traces->box.price_box$": 0  },
                    include: {
                        model: BoxTrace, as: "box_traces", required: true, right: true,
                        include: { model: Box, as: "box", required: true, right: true }
                    }
                })

                let numberCommercialBoxes = await Stock.count({
                    where: { id_company: idCompany, deleted: false, "$box_traces->box.price_box$": { [Op.gt]: 0 }  },
                    include: {
                        model: BoxTrace, as: "box_traces", required: true, right: true,
                        include: { model: Box, as: "box", required: true, right: true }
                    }
                })

                let company = await Company.findOne({where: {id: idCompany}})


                return {
                    numberClients:           numberClients.COUNT,
                    numberFactors:           numberFactors.COUNT,
                    numberUsers:             numberUsers.COUNT,
                    numberAllStock:          numberAllStock,
                    numberArchivedBoxes:     numberArchivedBoxes,
                    numberNotArchivedBoxes:  numberNotArchivedBoxes,
                    numberClassicBoxes:      numberClassicBoxes,
                    numberCommercialBoxes:   numberCommercialBoxes,
                    deliveryProfit:          0.5,
                    readyProfit:             0.50,
                    exportProfit:            0.50,
                    points:                  company.points
                }
            } catch (error) {
                logger.error({ file: "company", function: "Query type | getAllStatisticsCompany", error, lines: "[ 42 - 135 ]", user: context.user.user_name })
                throw new ApolloError("error IT081103")
            }
        },
    },

    Company: {
        numberArchivedBoxes: async (obj, args, context, info) => {
            try {
                const number = 50
                return number
            } catch (error) {
                logger.error({ file: "company", function: "Company type | numberArchivedBoxes", error, lines: "[ 141 - 150 ]", user: context.user.user_name })
                throw new ApolloError("error IT041101")
            }
        },

        numberNotArchivedBoxes: async (obj, args, context, info) => {
            try {
                const number = 150
                return number
            } catch (error) {
                logger.error({ file: "company", function: "Company type | numberNotArchivedBoxes", error, lines: "[ 152 - 161 ]", user: context.user.user_name })
                throw new ApolloError("error IT041101")
            }
        },

        listMessages: async ({id}, args, context, info) => {
            try {
                return await Messages.findAll({
                    where: {
                        id_company: id,
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "company", function: "Query type | listMessages", error, lines: "[ 157 - 169 ]", user: context.user.user_name })
                throw new ApolloError("error IT021102")
            }
        },

        listPickUpPlan: async (obj, args, context, info) => {
            try {
                return await PickUp.findAll({
                    where: {
                        id_company: obj.id,
                        deleted: false
                    }
                })
            } catch (error) {
                logger.error({ file: "company", function: "Query type | listPickUpPlan", error, lines: "[ 157 - 169 ]", user: context.user.user_name })
                throw new ApolloError("error IT021102")
            }
        }
    },
    
    Mutation: {
        createCompany: async (obj, {content}, context, info) =>   {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }
            try {
                return await Company.create(content)
            } catch (error) {
                logger.error({ file: "company", function: "Mutation type | createCompany", error, lines: "[ 164 - 176 ]", user: context.user.user_name })
                throw new ApolloError("error IT042201")
            }
        },

        updateCompany: async (obj, {id, content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }

            try {
                if(content.pickUpPlanContent) {
                    await PickUp.destroy({
                        where: {
                            id_company: id
                        }
                    })

                    for (let i = 0; i < content.pickUpPlanContent.length; i++) {
                        let date = new Date().getTime() + (1000*i)
                        await PickUp.create(
                            {...content.pickUpPlanContent[i], id_company: id, createdAt: new Date(date)}
                        )
                    }
                }

                let company = await Company.update(content, { where: { id } })
                return {
                    status: company[0] === 1
                }

            } catch (error) {
                console.log(error)
                logger.error({ file: "company", function: "Mutation type | updateCompany", error, lines: "[ 179 - 196 ]", user: context.user.user_name })
                throw new ApolloError("error IT042202")
            }
        },

        deleteCompany: async (obj, {id}, context, info) => {
            try {
                let result = await Company.update({deleted: true}, { where: { id } })

                return {
                    status: result === 1
                }

            } catch (error) {
                logger.error({ file: "company", function: "Mutation type | deleteCompany", error, lines: "[ 199 - 211 ]", user: context.user.user_name })
                throw new ApolloError("error IT042203")
            }
        },

        createAdminCompany: async (obj, {content}, context, info) => {
            try {
                let person =        null,
                    user =          null,
                    company =       null,
                    stock =         null,
                    stockAccess =   null,
                    hashPassword =  null;

                // Person.create() => IT220340
                // User.create() => IT220341
                // Company.create() => IT220342
                // Stock.create() => IT220343
                // StockAccess.create() => IT220344

                if (!content.person.email || !content.person.phone01 || !content.company.nameCompany || !content.company.phoneCompany || !content.person.email) {
                    return new ApolloError("Some fields are empty", "FIELDS_EMPTY")
                }

                person = await Person.findOne({
                    where: {
                        [Op.or]: [ {email: content.person.email}, {phone01: content.person.phone01} ]
                    }
                });

                if (person !== null) {
                    if (person.email === content.person.email && person.phone01 === content.person.phone01) {
                        return new ApolloError("The email and phone01 admin is exist", "ALREADY_HAS_ACCOUNT")
                    } else if (person.email === content.person.email) {
                        return new ApolloError("The email admin is exist", "EMAIL_ALREADY_EXISTS")
                    } else if (person.phone01 === content.person.phone01) {
                        return new ApolloError("The phone01 admin is exist", "PHONE_ALREADY_EXISTS")
                    }
                }

                company = await Company.findOne({
                    where: {
                        [Op.or]: [
                            {name: content.company.nameCompany},
                            {phone01: content.company.phoneCompany},
                            {email: content.person.email}
                        ]
                    }
                });

                if (company !== null) {
                    if (company.email === content.person.email && company.phone01 === content.company.phoneCompany && company.name === content.company.nameCompany) {
                        return new ApolloError("The company info is exist", "COMPANY_ALREADY_EXISTS")
                    } else if (company.email === content.person.email) {
                        return new ApolloError("The email company is exist", "EMAIL_COMPANY_ALREADY_EXISTS")
                    } else if (company.phone01 === content.company.phoneCompany) {
                        return new ApolloError("The phone01 company is exist", "PHONE_COMPANY_ALREADY_EXISTS")
                    } else if (company.name === content.company.nameCompany) {
                        return new ApolloError("The name company is exist", "NAME_COMPANY_ALREADY_EXISTS")
                    }
                }

                try {
                    person = await Person.create(content.person)
                } catch (error) {
                    await Person.destroy({ where: {id: person.id} })
                    logger.error(`Company file | Mutation type | createAdminCompany function Person.create() : \n ${error}`)
                    return new ApolloError("IT220340", "ADMIN_NOT_CREATED")
                }


                hashPassword = await hash(content.password, 10);

                if (person !== null && hashPassword !== null) {
                    try {
                        user = await User.create({
                            user_name: content.person.email.split("@")[0],
                            password:  hashPassword,
                            role:      "AdminCompany",
                            id_person: person.id,
                            lastConnection: new Date(),
                            lastDisconnection:  new Date()
                        })
                    } catch (error) {
                        await Person.destroy({ where: {id: person.id} })
                        logger.error(`Company file | Mutation type | createAdminCompany function User.create() : \n ${error}`)
                        return new ApolloError("IT220341", "ADMIN_NOT_CREATED")
                    }
                }

                try {
                    company = await Company.create({
                        name:       content.company.nameCompany,
                        logo:       "Default",
                        phone01:    content.company.phoneCompany,
                        phone02:    "",
                        email:      content.person.email,
                        url_site:   "Default",
                        city:       content.company.cityCompany,
                        address:    content.company.addressCompany,

                        TVA:        0,
                        plus_size:  0,
                        plus_tail:  0,
                        value_plus_size: 0,
                        value_plus_tail: 0,
                        return_price: 0,
                        change_price: 0,
                        price_in_state: 0
                    })
                } catch (error) {
                    await Person.destroy({ where: {id: person.id} })
                    logger.error(`Company file | Mutation type | createAdminCompany function Company.create() : \n ${error}`)
                    return new ApolloError("IT220342", "ADMIN_NOT_CREATED")
                }

                if (company.id !== null) {
                    try {
                        stock = await Stock.create({
                            name:        "الفرع الرئيسي",
                            city:        content.company.cityCompany,
                            address:     content.company.addressCompany,
                            phone01:     content.company.phoneCompany,
                            phone02:     "",
                            id_company:  company.id
                        })
                    } catch (error) {
                        await Person.destroy({ where: {id: person.id} })
                        await Company.destroy({ where: {id: company.id} })
                        logger.error(`Company file | Mutation type | createAdminCompany function Stock.create() : \n ${error}`)
                        return new ApolloError("IT220343", "ADMIN_NOT_CREATED")
                    }
                }

                if (stock.id !== null && person.id !== null) {
                    try {
                        stockAccess = await StockAccess.create({
                            id_stock: stock.id,
                            id_person: person.id
                        })
                    } catch (error) {
                        await Person.destroy({ where: {id: person.id} })
                        await Company.destroy({ where: {id: company.id} })
                        await Stock.destroy({ where: {id: stock.id} })
                        logger.error(`Company file | Mutation type | createAdminCompany function StockAccess.create() : \n ${error}`)
                        return new ApolloError("IT220344", "ADMIN_NOT_CREATED")
                    }
                }

                if (person !== null && user !== null && company !== null && stock !== null && stockAccess !== null) {
                    // Issue Token
                    let token = await issueAuthToken({id: user.id, email: person.email});

                    await createMail ({
                        type: "Verification",
                        to: person.email,
                        subject: "Email Verification",
                        token: token.split(" ")[1]
                    });

                    await createMailNewUser ({
                        companyName: company.name,
                        admin: `${person.first_name} ${person.last_name}`,
                        phone: person.phone01,
                        address: `${person.city} ${person.address}`
                    });


                    return company
                }
            } catch (error) {
                logger.error({ file: "company", function: "Mutation type | createAdminCompany", error, lines: "[ 214 - 378 ]", user: context.user.user_name })
                throw new ApolloError("IT-0000123")
            }
        },

        activeCompany: async (obj, {id, activation}, context, info) => {
            try {
                let result = await Company.update({activation}, { where: { id } })
                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "company", function: "Mutation type | activeCompany", error, lines: "[ 381 - 391 ]", user: context.user.user_name })
                throw new ApolloError("error IT083303")
            }
        },

        activeAdminCompany: async (obj, {idCompany}, context, info) => {
            try {
                const [user] = await DB.query(`
                    SELECT users.id AS "id", users.role AS "role",  users.email_verify AS "email_verify"
                    FROM users
                    INNER JOIN person AS person ON person.id = users.id_person
                    INNER JOIN stock_accesses AS stock_accesses ON person.id = stock_accesses.id_person
                    INNER JOIN stocks AS stock ON stock_accesses.id_stock = stock.id
                    
                    WHERE stock.id_company = "${idCompany}" AND users.role = "AdminCompany" `, {
                    type: QueryTypes.SELECT
                })

                if (!user) {
                    return {
                        status: false
                    }
                }

                let result = await User.update({email_verify: true}, { where: { id: user.id } })

                return {
                    status: result[0] === 1
                }
            } catch (error) {
                logger.error({ file: "company", function: "Mutation type | activeAdminCompany", error, lines: "[ 394 - 423 ]", user: context.user.user_name })
                throw new ApolloError("error IT083304")
            }
        },

        uploadLogo: async (obj, {idCompany, logo}, context, info) => {
            try {
                const listType = ["JPEG", "JPG", "PNG"]

                let file = await logo

                const { createReadStream, filename, mimetype, encoding } = file;

                const imgType = filename.split(".")[filename.split(".").length-1].toUpperCase()

                const isImage = listType.indexOf(imgType) !== -1

                if(!isImage) { return new ApolloError("this file is not image") }

                const logoUniqName = `${UUIDV4()}.${imgType}`;
                const pathName = path.join(__dirname,   `./../qafilaty/${logoUniqName}`);

                const stream = createReadStream();
                await stream.pipe( createWriteStream(pathName) );

                await Company.update({logo: logoUniqName}, { where: { id: idCompany } })

                if (logoUniqName && logoUniqName !== "") {
                    return {status: true}
                }
                return {status: false}
            } catch (error) {
                throw new ApolloError(error)
            }
        },
    }
}
