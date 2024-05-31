import jsonwebtoken from 'jsonwebtoken';
import lodash from 'lodash';
import dotenv from 'dotenv'

dotenv.config();

const SECRET = process.env.SECRET
const { pick } = lodash;
const { sign } = jsonwebtoken;

// const issueAuthToken = async (jwtPayload) => {
//     let token = await sign(jwtPayload, SECRET, {
//         expiresIn: 60*5
//     });
//     return `Bearer ${token}`;
// };

export const issueAuthToken = async (payload, expir) => {
    const expiresIn = 60 * 60 * (expir || 5)

    let token = await sign(payload, SECRET, {
        expiresIn
    });
    return `Bearer ${token}`;
};

export const serializeUser = (user) => pick(user, [
    'id',
    'user_name',
    'role',
    'activation',
    'id_person'
]);

export const getRefreshToken = async (payload) => {
    return await sign(payload, SECRET, {
        expiresIn: 3600*24*7
    });
}