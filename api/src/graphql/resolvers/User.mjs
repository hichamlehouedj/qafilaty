import { ApolloError, AuthenticationError } from 'apollo-server-express';
import bcrypt from 'bcryptjs';
import { issueAuthToken, serializeUser, createMail, getRefreshToken, checkIPBlocked, consumePoint } from '../../helpers/index.mjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import Joi from "joi"
import sequelize from 'sequelize';

import { User, Person, StockAccess, Company, Stock  } from '../../models/index.mjs';
import logger from "../../config/Logger.mjs";

const {Op, col} = sequelize;
dotenv.config();

const { hash, compare } = bcrypt;
const SECRET = process.env.SECRET

const schema = Joi.object({
    user_name:      Joi.string().min(3).max(50).required(),
    password:       Joi.string().min(8).max(50).pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])")).required(),
    role:           Joi.string().min(3).max(50).required(),
    id_person:      Joi.string().min(0).max(50).required()
})

export const resolvers = {

    Query: {
        user: async (obj, {id}, context, info) =>  {
            try {
                return await User.findByPk(id)
            } catch (error) {
                logger.error({ file: "User", function: "Query type | user", error, lines: "[ 34 - 41 ]", user: context.user.user_name  })
                throw new ApolloError("error IT091101")
            }
        },

        currentUser: async (obj, args, {isAuth, user}, info) => {
            try {
                if (isAuth) {
                    return user
                }
                return "You must be the authenticated user to get this information";
            } catch (error) {
                logger.error({ file: "User", function: "Query type | currentUser", error, lines: "[ 43 - 53 ]", user: user.user_name })
                throw new ApolloError("error IT091102")
            }
        },

        currentAdmin: async (obj, args, {isAuth, user}, info) => {
            try {
                if (isAuth && user.role === "AdminCompany") {
                    return user
                }
                return "You must be the authenticated user to get this information";
            } catch (error) {
                logger.error({ file: "User", function: "Query type | currentAdmin", error, lines: "[ 55 - 65 ]", user: user.user_name  })
                throw new ApolloError("error IT091102")
            }
        },

        allUsers: async (obj, {deleted, idStock}, context, info) => {
            try {
                return await User.findAll({
                    where: {
                        '$person->stock_accesses.id_stock$': idStock,
                        '$person.deleted$':  deleted
                    },
                    include: {
                        model: Person,
                        as: 'person',
                        required: true,
                        right: true,
                        include: {
                            model: StockAccess,
                            as: 'stock_accesses',
                            required: true,
                            right: true
                        }
                    }
                })
            } catch (error) {
                logger.error({ file: "User", function: "Query type | allUsers", error, lines: "[ 67 - 91 ]", user: context.user.user_name  })
                throw new ApolloError("error IT091103")
            }
        },

        refreshToken: async (obj, args, {refreshToken, req, isAuth, user}, info) => {
            try {
                //console.log(refreshToken)
                if (!refreshToken || refreshToken === "") {
                    return new AuthenticationError( "Refresh token does not exist" );
                }

                let decodedToken;
                try {
                    decodedToken = jwt.verify(refreshToken, SECRET);
                } catch (err) {
                    return new AuthenticationError("Refresh token invalid or expired")
                }

                // If decoded token is null then set authentication of the request false
                if (!decodedToken) {
                    return new AuthenticationError("Refresh token invalid or expired")
                }

                let useragent = `${req.useragent.browser}: ${req.useragent.version}, ${req.useragent.platform}: ${req.useragent.os}, ${req.useragent.source}`

                if (useragent !== decodedToken.useragent) {
                    return new AuthenticationError("The user is not properly logged in")
                }

                // If the user has valid token then Find the user by decoded token's id
                let authUser = await User.findByPk(decodedToken.id);
                if (!authUser) {
                    return "User Does not exist";
                }

                let info = await StockAccess.findOne({
                    attributes: ["id", "id_person", "id_stock"],
                    where: { id_person: authUser.id_person },
                    include: {
                        model: Stock,
                        as: 'stock',
                        required: true,
                        right: true,
                        attributes: ["id", "activation"],
                        include: {
                            model: Company,
                            as: 'company',
                            required: true,
                            right: true,
                            attributes: ["id", "activation"]
                        }
                    }
                });

                if (!info) {
                    return new ApolloError("Account is not connect in any stock", "NOT_ACCESS_STOCK");
                } else {
                    if (info.dataValues.stock.dataValues.company.activation === 'desactive') {
                        return new ApolloError("Your Company is not active", "COMPANY_NOT_ACTIVE");
                    } else if (info.dataValues.stock.dataValues.company.activation === 'debt' && authUser.role !== "AdminCompany") {
                        return new ApolloError("Your Company is not active", "COMPANY_NOT_ACTIVE");
                    } else if (info.dataValues.stock.dataValues.company.activation === 'active' && info.dataValues.stock.activation !== 'active' && authUser.role !== "AdminCompany") {
                        return new ApolloError("Your Stock is not active", "STOCK_NOT_ACTIVE");
                    }
                }

                let token = await issueAuthToken({id: authUser.id});

                return {
                    token
                }
            } catch (error) {
                logger.error({ file: "User", function: "Query type | refreshToken", error, lines: "[ 93 - 163 ]", user: user.user_name  })
                return new ApolloError("error IT091104")
            }
        },
    },

    User: {
        person: async (obj, args, context, info) => {
            try {
                return await Person.findByPk(obj.id_person)
            } catch (error) {
                logger.error({ file: "User", function: "User type | person", error, lines: "[ 171 - 178 ]", user: context.user.user_name  })
                throw new ApolloError("error IT092201")
            }
        }
    },

    // Upload: GraphQLUpload,

    Mutation: {
        authenticateUser: async (obj, {content}, context, info) => {
            try {
                const checkIP = await checkIPBlocked(context.req, context.res)

                if(checkIP) {
                    return new ApolloError(`Too Many Requests you can try after ${checkIP} seconds`, "TOO_MANY_REQUESTS")
                }

                let person = await Person.findOne({
                    attributes: ["id", "email"],
                    where: { email: content.email }
                });

                // Person is exist
                if (!person) {
                    const checkIP = await consumePoint(context.req, context.res)
                    if (checkIP !== true && typeof checkIP == "number") {
                        return new ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                    }
                    return new ApolloError('User not found', 'USER_NOT_EXIST');
                }

                let role = context.req.header('Origin') === "https://stock.qafilaty.com" ? "Factor" :
                    context.req.header('Origin') === "https://client.qafilaty.com" ? "Client" :
                        context.req.header('Origin') === "https://driver.qafilaty.com" ? "Driver" :
                            context.req.header('Origin') === "https://admin.qafilaty.com" ? "AdminCompany" :
                                context.req.header('Origin') === "http://localhost:3000" ? "Dev" : ""


                let user = null;
                if (role === "Dev") {
                    user = await User.findOne({
                        where: {
                            [Op.and]: [
                                {id_person: person.id}
                            ]
                        }
                    });
                } else {
                    user = await User.findOne({
                        where: {
                            [Op.and]: [
                                {id_person: person.id},
                                {role: role}
                            ]
                        }
                    });
                }

                // User is exist
                if (!user) {
                    const checkIP = await consumePoint(context.req, context.res)
                    if (checkIP !== true && typeof checkIP == "number") {
                        return new ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                    }
                    return new ApolloError('User not found', 'USER_NOT_EXIST');
                }

                let isMatch = await compare(content.password, user.password);

                // If Password don't match
                if (!isMatch) {
                    const checkIP = await consumePoint(context.req, context.res)
                    if (checkIP !== true && typeof checkIP == "number") {
                        return new ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                    }

                    return new ApolloError("Password not incorrect", "PASSWORD_INCORRECT");
                }


                // If Password don't match
                if (!user.email_verify) {
                    const checkIP = await consumePoint(context.req, context.res)
                    if (checkIP !== true && typeof checkIP == "number") {
                        return new ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                    }

                    return new ApolloError("Email not verify", "EMAIL_NOT_VERIFY");
                }

                // If Password don't match
                if (user.activation !== "active") {
                    const checkIP = await consumePoint(context.req, context.res)
                    if (checkIP !== true && typeof checkIP == "number") {
                        return new ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                    }
                    return new ApolloError("Account is not active", "ACCOUNT_NOT_ACTIVE");
                }

                let info = await StockAccess.findOne({
                    attributes: ["id", "id_person", "id_stock"],
                    where: { id_person: person.id },
                    include: {
                        model: Stock,
                        as: 'stock',
                        required: true,
                        right: true,
                        attributes: ["id", "activation"],
                        include: {
                            model: Company,
                            as: 'company',
                            required: true,
                            right: true,
                            attributes: ["id", "activation"]
                        }
                    }
                });

                if (!info) {
                    const checkIP = await consumePoint(context.req, context.res)
                    if (checkIP !== true && typeof checkIP == "number") {
                        return new ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                    }
                    return new ApolloError("Account is not connect in any stock", "NOT_ACCESS_STOCK");
                } else {
                    if (info.dataValues.stock.dataValues.company.activation === 'desactive') {
                        const checkIP = await consumePoint(context.req, context.res)
                        if (checkIP !== true && typeof checkIP == "number") {
                            return new ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                        }
                        return new ApolloError("Your Company is not active", "COMPANY_NOT_ACTIVE");

                    } else if (info.dataValues.stock.dataValues.company.activation === 'debt' && user.role !== "AdminCompany") {
                        const checkIP = await consumePoint(context.req, context.res)
                        if (checkIP !== true && typeof checkIP == "number") {
                            return new ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                        }
                        return new ApolloError("Your Company is not active", "COMPANY_NOT_ACTIVE");

                    } else if (info.dataValues.stock.dataValues.company.activation === 'active' && info.dataValues.stock.activation !== 'active' && user.role !== "AdminCompany") {
                        const checkIP = await consumePoint(context.req, context.res)
                        if (checkIP !== true && typeof checkIP == "number") {
                            return new ApolloError(`Too Many Requests you can try after ${Math.round(checkIP / 1000)} seconds`, "TOO_MANY_REQUESTS")
                        }
                        return new ApolloError("Your Stock is not active", "STOCK_NOT_ACTIVE");
                    }
                }

                // Issue Token
                let token = await issueAuthToken({id: user.id, role: user.role});

                let useragent = `${context.req.useragent.browser}: ${context.req.useragent.version}, ${context.req.useragent.platform}: ${context.req.useragent.os}, ${context.req.useragent.source}`

                let refreshToken = await getRefreshToken({id: user.id, role: user.role, useragent: useragent});

                if (refreshToken !== null && refreshToken !== "") {
                    // context.res.cookie('___refresh_token', refreshToken, {
                    //     //domain: "qafilaty.com",
                    //     maxAge: 3600000*24*1, // Hours * 24 * 7
                    //     httpOnly: true,
                    //     secure: true,
                    //     sameSite: "none"
                    // })

                    context.res.cookie('___refresh_token', refreshToken, {
                        domain: "qafilaty.com",
                        maxAge: 3600000*24*7, // Hours * 24 * 7
                        httpOnly: true,
                        secure: true,
                        sameSite: 'lax',
                    })
                }

                if (token !== null && token !== "") {
                    return {
                        token,
                        user
                    }
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | authenticateUser", error, lines: "[ 186 - 360 ]", user: context.user.user_name  })
                throw new ApolloError(error)
            }
        },

        createUser: async (obj, {content}, context, info) => {
            // try {
            //     await schema.validateAsync(content);
            // } catch (errors) {
            //     throw new UserInputError(errors.message)
            // }

            //Person is already Exist.                  => IT000001
            //Person is not Exist.                      => IT000002
            //Username is already Exist.                => IT000003
            //This person already has an account        => IT000004
            //User not found                            => IT000005
            //token is not exist                        => IT000006
            //authorization expired or unauthorized     => IT000007
            //Passwords do not match                    => IT000008

            try {
                let user = await User.findOne({ where: { user_name: content.user_name } });
                if (user) { return new ApolloError('IT000003', "USERNAME_ALREADY_EXIST") }

                user = await User.findOne({ where: { id_person: content.id_person } });
                if (user) { return new ApolloError('IT000004', "ALREADY_HAS_ACCOUNT") }

                let person = await Person.findOne({ where: { id: content.id_person } });
                if (!person) { return new ApolloError('IT000002', "PERSON_NOT_EXIST") }

                // Hash the user password
                let hashPassword = await hash(content.password, 10);

                let result = await User.create({
                    user_name: content.user_name,
                    password: hashPassword,
                    role: content.role,
                    id_person: content.id_person,
                    lastConnection: new Date(),
                    lastDisconnection:  new Date(),
                    email_verify: true
                })

                result = await serializeUser(result);

                let token = await issueAuthToken({id: result.id, role: result.role});

                // await createMail ({
                //     type: "Verification",
                //     to: person.email,
                //     subject: "Email Verification",
                //     token: token.split(" ")[1]
                // });

                return {
                    user: result,
                    token: token
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | createUser", error, lines: "[ 362 - 419 ]", user: context.user.user_name  })
                throw new ApolloError("error IT093302")
            }
        },

        emailVerification: async (obj, {token}, context, info) => {
            try {
                if (!token || token === "") {
                    return  new ApolloError("IT000006");
                }

                // Verify the extracted token
                let decodedToken;
                try {
                    decodedToken = jwt.verify(token, SECRET);
                } catch (err) {
                    return  new ApolloError(err.message)
                }

                // If decoded token is null then set authentication of the request false
                if (!decodedToken) {
                    return  new ApolloError("IT000007");
                }

                // If the user has valid token then Find the user by decoded token's id
                let authUser = await User.findOne({
                    where: {
                        id: decodedToken.id
                    }
                });

                if (!authUser) {
                    return  new ApolloError("IT000005")
                }

                let user = await User.update({'activation': 'active', 'email_verify': true }, { where: { id: decodedToken.id } })

                console.log(user)
                return {
                    status: user[0] === 1
                }

            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | emailVerification", error, lines: "[ 421 - 462 ]", user: context.user.user_name  })
                throw new ApolloError(error)
            }
        },

        resendVerificationEmail: async (obj, {email}, context, info) => {
            try {
                let person = await Person.findOne({ where: { email } });

                // Person is exist
                if (!person) { return new ApolloError('User not found', 'USER_NOT_EXIST');}

                let user = await User.findOne({ where: { id_person: person.id } });

                // User is exist
                if (!user) { return new ApolloError('User not found', 'USER_NOT_EXIST'); }

                let token = await issueAuthToken({
                    id: user.id,
                    id_person: user.id_person,
                    email: person.email
                }, 15);

                const createdMail = await createMail ({
                    type: "Verification",
                    to: email,
                    subject: "Email Verification",
                    token: token.split(" ")[1]
                });

                console.log("createdMail ", createdMail)

                return {
                    status: true
                }

            }  catch (error) {
                logger.error({ file: "User", function: "Mutation type | resendVerificationEmail", error, lines: "[ 464 - 499 ]", user: context.user.user_name  })
                throw new ApolloError("error IT093304")
            }
        },

        forgetPassword: async (obj, {email}, context, info) => {
            try {
                let person = await Person.findOne({ where: { email } });

                // Person is exist
                if (!person) { return new ApolloError('User not found', 'USER_NOT_EXIST');}

                let user = await User.findOne({ where: { id_person: person.id } });

                // User is exist
                if (!user) { return new ApolloError('User not found', 'USER_NOT_EXIST'); }

                let token = await issueAuthToken({
                    id: user.id,
                    id_person: user.id_person,
                    email: person.email
                }, 15);

                const createdMail = await createMail ({
                    type: "Forget",
                    to: email,
                    subject: "Forget your password",
                    token: token.split(" ")[1]
                });

                return {
                    status: true
                }

            }  catch (error) {
                logger.error({ file: "User", function: "Mutation type | forgetPassword", error, lines: "[ 501 - 534 ]", user: context.user.user_name  })
                throw new ApolloError("error IT093304")
            }
        },

        changePassword: async (obj, {content}, context, info) => {
            try {
                const {token, password, confirmPassword} = content;

                if (!token || token === "" || password !== confirmPassword) {
                    return  new ApolloError("IT000008");
                }

                // Verify the extracted token
                let decodedToken;
                try {
                    decodedToken = jwt.verify(token, SECRET);
                } catch (err) {
                    return  new ApolloError(err.message)
                }

                // If decoded token is null then set authentication of the request false
                if (!decodedToken) {
                    return  new ApolloError("IT000007");
                }

                let person = await Person.findOne({ where: { email: decodedToken.email } });

                if (!person) {
                    return  new ApolloError('IT000005');
                }

                // Hash the user password
                let hashPassword = await hash(password, 10);

                let user = await User.update({'password': hashPassword}, { where: { id: decodedToken.id } })

                return {
                    status: user[0] === 1
                }

            }  catch (error) {
                logger.error({ file: "User", function: "Mutation type | changePassword", error, lines: "[ 536 - 576 ]", user: context.user.user_name  })
                throw new ApolloError("error IT093305")
            }
        },

        updateUsers: async (obj, {id_person, content}, context, info) => {
            try {
                let person = [];
                let hashNewPassword = null;
                let result = null;

                if (content.person) {
                    person = await Person.update(content.person, { where: { id: id_person } });
                }

                if (content.newPassword) {
                    hashNewPassword = await hash(content.newPassword, 10);
                }

                if (hashNewPassword !== null) {
                    result = await User.update({
                        user_name: content.user_name,
                        password: hashNewPassword,
                        role: content.role
                    }, { where: { id_person } })
                } else {
                    result = await User.update({
                        user_name: content.user_name,
                        role: content.role
                    }, { where: { id_person } })
                }

                return {
                    status: result[0] === 1 || person[0] === 1
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | updateUsers", error, lines: "[ 578 - 612 ]", user: context.user.user_name  })
                throw new ApolloError("error IT093306")
            }
        },

        updateMyUser: async (obj, {id_person, content}, context, info) => {
            try {
                let token = "";

                let user = await User.findOne({where: {id_person}});

                let isMatch = await compare(content.oldPassword, user.password);

                if (user && isMatch) {

                    let person = null;
                    let hashNewPassword = null;
                    let result = null;

                    if (content.person) {
                        person = await Person.update(content.person, { where: { id: id_person } });
                    }

                    if (content.newPassword) {
                        hashNewPassword = await hash(content.newPassword, 10);
                    }

                    if (hashNewPassword !== null) {
                        result = await User.update({
                            user_name: content.user_name,
                            password: hashNewPassword,
                            role: content.role
                        }, { where: { id_person } })
                    } else {
                        result = await User.update({
                            user_name: content.user_name,
                            role: content.role
                        }, { where: { id_person } })
                    }

                    result = await serializeUser(result);

                    token = await issueAuthToken(result);

                } else {
                    throw new ApolloError("Old password is incorrect")
                }

                return {
                    token: token
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | updateMyUser", error, lines: "[ 614 - 664 ]", user: context.user.user_name  })
                throw new ApolloError("error IT093307")
            }
        },

        activeUser: async (obj, {id_person, activation}, context, info) => {
            try {
                let user = await User.update({activation}, { where: { id_person } })

                return {
                    status: user[0] === 1
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | activeUser", error, lines: "[ 666 - 677 ]", user: context.user.user_name  })
                throw new ApolloError("error IT093308")
            }
        },

        deleteUser: async (obj, {id_person}, context, info) => {
            try {
                let result = await User.destroy({ where: { id_person } })
                return {
                    status: result === 1
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | deleteUser", error, lines: "[ 679 - 689 ]", user: context.user.user_name  })
                throw new ApolloError("error IT093309")
            }
        },

        updateAccessesStock: async (obj, {idPerson, idStock}, context, info) => {
            try {
                const status = await StockAccess.update({
                    id_stock: idStock
                }, {
                    where: {
                        id_person: idPerson
                    }
                })

                console.log(status)
                return {
                    status: status[0] == 1 || status[0] == 2
                }
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | updateAccessesStock", error, lines: "[ 691 - 709 ]", user: context.user.user_name  })
                throw new ApolloError("error IT092201")
            }
        },

        logOut: async (obj, {}, context, info) => {
            try {
                let cookie = context.res.cookie('___refresh_token', '', {
                    domain: "qafilaty.com",
                    maxAge: 0, // Hours * 24 * 7
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                });

                
                return {
                    status: true,
                };
            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | logOut", error, lines: "[ 711 - 729 ]", user: context.user.user_name  })
                throw new ApolloError('error IT093309');
            }
        },

        /*singleUpload: async (obj, { file }, context, info) => {
            console.log({ file })
            try {
                const listType = ["JPEG", "JPG", "PNG", "ICO"]
                const { createReadStream, filename, mimetype, encoding } = await file;
                const imgType = filename.split(".")[filename.split(".").length-1].toUpperCase()
                const isImage = listType.find(item => item === imgType)

                if(!isImage) { return new ApolloError("this file is not image") }

                const assetUniqName = UUIDV4() + filename;
                const pathName = path.join(__dirname,   `./../../../uploaded/${assetUniqName}`);
                const stream = createReadStream();
                let up = await stream.pipe( createWriteStream(pathName) );

                //console.log(stream);
                return {
                    url: `http://localhost:4000/${assetUniqName}`
                };

            } catch (error) {
                logger.error({ file: "User", function: "Mutation type | singleUpload", error, lines: "[ 731 - 755 ]", user: context.user.user_name  })
                throw new ApolloError("error IT093310")
            }
        },*/
    }
}
