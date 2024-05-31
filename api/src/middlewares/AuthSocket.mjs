import jwt from 'jsonwebtoken';
import { User, AuthTrace } from '../models/index.mjs';
import dotenv from 'dotenv'
dotenv.config();

const SECRET = process.env.SECRET

export const AuthMiddleware = async (auth) => {

    // Extract Authorization Header
    const authSocket = auth;

    // console.log("Authorization Socket", auth);

    if (!authSocket) {
        return {isAuth: false};
    }

    
    // Extract the token and check for token
    const token = authSocket.split(" ")[1];

    if (!token || token === "") {
        return {isAuth: false};
    }

    // Verify the extracted token
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, SECRET);
    } catch (err) {
        return {isAuth: false};
    }

    // If decoded token is null then set authentication of the request false
    if (!decodedToken) {
        return {isAuth: false};
    }

    // If the user has valid token then Find the user by decoded token's id
    let authUser = await User.findByPk(decodedToken.id);
    if (!authUser) {
        return {isAuth: false};
    }

    //await AuthTrace.create({token : token, user_name: decodedToken.user_name, action: "Token Checked" })

    return {
        isAuth: true,
        user: authUser
    };
}