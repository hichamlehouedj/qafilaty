import {RateLimiterMySQL} from "rate-limiter-flexible"
import DB from '../config/DBContact.mjs';

// const redisClient = new Redis({ enableOfflineQueue: false });
// redisClient.connect();

const maxWrongAttemptsByIPperMinute = 15;
const maxWrongAttemptsByIPperDay = 50;

const ready = (err) => {
    if (err) {
        console.log("brute force err ", err);
    }
};

const limiterFastBruteByIP = new RateLimiterMySQL({
    storeClient: DB,
    dbName: "qafilaty",
    tableCreated: false,
    tableName: 'login_fail_ip_per_minute',
    keyPrefix: 'login_fail_ip_per_minute',
    points: maxWrongAttemptsByIPperMinute,
    duration: 60,
    blockDuration: 60 * 5, // Block for 10 minutes, if 5 wrong attempts per 30 seconds
}, ready);

const limiterSlowBruteByIP = new RateLimiterMySQL({
    storeClient: DB,
    dbName: "qafilaty",
    tableCreated: false,
    tableName: 'login_fail_ip_per_day',
    keyPrefix: 'login_fail_ip_per_day',
    points: maxWrongAttemptsByIPperDay,
    duration: 60 * 60,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
}, ready);

export const checkIPBlocked = async (req, res) => {
    const ipAddress = req.clientIp;

    const [resFastByIP, resSlowByIP] = await Promise.all([
        limiterFastBruteByIP.get(ipAddress),
        limiterSlowBruteByIP.get(ipAddress),
    ]);

    let retrySeconds = 0;

    // Check if IP is already blocked
    if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
        retrySeconds = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (resFastByIP !== null && resFastByIP.consumedPoints > maxWrongAttemptsByIPperMinute) {
        retrySeconds = Math.round(resFastByIP.msBeforeNext / 1000) || 1;
    }

    if (retrySeconds > 0) {
        res.setHeader('Retry-After', String(retrySeconds));
        return retrySeconds
    }
    return false;
}

export const consumePoint = async (req, res) => {
    const ipAddress = req.clientIp;

    // Consume 1 point from limiters on wrong attempt and block if limits reached
    try {
        await Promise.all([
            limiterFastBruteByIP.consume(ipAddress),
            limiterSlowBruteByIP.consume(ipAddress),
        ]);
    } catch (rlRejected) {
        if (rlRejected instanceof Error) {
            console.log("rlRejected ", rlRejected);
            //throw rlRejected;
        } else {
            res.setHeader('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
            return rlRejected.msBeforeNext;
        }
    }
    return true;
}