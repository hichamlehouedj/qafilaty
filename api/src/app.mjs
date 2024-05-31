// Import all dependencies
import express                  from 'express';
import cors                     from "cors";
import helmet                   from 'helmet';
import cookieParser             from 'cookie-parser';
import depthLimit               from 'graphql-depth-limit';
import path                     from 'path';
import {fileURLToPath}          from 'url';
import requestIp                from 'request-ip';

import { ApolloServer }         from 'apollo-server-express';
import {
    ApolloServerPluginLandingPageDisabled
}                               from 'apollo-server-core';

import { createServer }         from 'http';
import { express as expressUserAgent } from 'express-useragent';

import DB                       from './config/DBContact.mjs';
import {Auth as AuthMiddleware} from './middlewares/index.mjs';
import schema                   from './graphql/index.mjs';
import logger                   from './config/Logger.mjs';

import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs"

import socketServer from "./socket/initSocketServer.mjs";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

let socket = null;

(async function () {
    // Init an Express App.
    const app = express();

    // This `app` is the returned value from `express()`.
    const httpServer = createServer(app);

    let whitelist = [
        'https://api.qafilaty.com',
        'https://stock.qafilaty.com',
        'https://qafilaty.com',
        "https://client.qafilaty.com",
        "https://driver.qafilaty.com",
        "https://admin.qafilaty.com",
        "https://www.elamane-cc.com",
        "https://elamane-cc.com",
        "https://track.qafilaty.com"
    ]

    let corsOptionsDelegate = function (req, callback) {
        let corsOptions;
        let regex = /192\.168\.1\.\d?\d?\d?:3000/g; //192.168.1.*

        if ((whitelist.indexOf(req.header('Origin')) !== -1) || regex.test(req.header('Origin')) ) {

            //console.log("context ", req.header('Origin'))

            corsOptions = {origin: req.header('Origin'), credentials: true}
        } else {
            corsOptions = { origin: false, credentials: false }
        }

        callback(null, corsOptions)
    }

    // Middlewares 
    app.use( cors(corsOptionsDelegate) );
    
    app.use(requestIp.mw())

    app.use(cookieParser())
    app.use(expressUserAgent());
    // Use your dependencies here
    app.use('/images', express.static(path.join(__dirname, '../qafilaty')))
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(helmet({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false }));
    // limit each IP to 100 requests per 15 minutes
    //app.use(rateLimit({ windowMs: 5 * 60 * 1000, max: 150}));
    // Auth Middleware
    app.use(AuthMiddleware);

    app.use(graphqlUploadExpress({
        maxFileSize: 10000000, // 10 MB
        maxFiles: 1,
        maxFieldSize: 10000000 // 10 MB
    }));

    // const queryComplexityRule = queryComplexity({
    //     maximumComplexity: 1000, variables: {},
    //     // eslint-disable-next-line no-console
    //     createError: (max, actual) => new GraphQLError(`Query is too complex: ${actual}. Maximum allowed complexity: ${max}`),
    //     estimators: [ simpleEstimator({ defaultComplexity: 1 }) ],
    // });
    
    const apolloServer = new ApolloServer({ 
        schema,
        tracing: false,
        playground: false,
        introspection: false,
        debug: false,
        //uploads: false,
        allowBatchedHttpRequests: false,
        csrfPrevention: true,
        cache: 'bounded',
        validationRules: [ 
            depthLimit(5),
            //queryComplexityRule
        ],
        plugins: [ 
            ApolloServerPluginLandingPageDisabled()
            // ApolloServerPluginDrainHttpServer({ httpServer }),
            /*process.env.NODE_ENV === 'production'
                ? ApolloServerPluginLandingPageDisabled()
                : ApolloServerPluginLandingPageGraphQLPlayground({ settings: { 'request.credentials': 'include' } }),*/
        ],
        context: ({ req, res }) => {
            
            let {user, isAuth } = req;

            if (req.header('Origin')) {
                if (res.getHeader('access-control-allow-origin') === '*') {
                    res.setHeader('access-control-allow-origin', req.header('Origin'));
                }
            } else {
                res.setHeader('access-control-allow-origin', "https://graph-api.it-hash.com:4020")
            }
            let refreshToken = req.cookies["___refresh_token"];
            
            return { res, req, user, isAuth, refreshToken };
        }
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app, path: apolloServer.graphqlPath });

    try {
        await DB.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) { 
        logger.error(error)
        console.error('Unable to connect to the database:', error);
    }
    
    try {
        socket = new socketServer(httpServer)
        await socket.connection()
    }  catch (error) {
        console.error('socket server error:', error);
    }

    // set port, listen for requests
    const PORT = process.env.PORT;

    // Start Server here
    httpServer.listen(PORT,() => {
        logger.info(`Server is running is http://localhost:${PORT}${apolloServer.graphqlPath}`)
    });
})();
export {socket}