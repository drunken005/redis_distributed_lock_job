const _ = require('lodash');
const Redis = require('ioredis');
const RedLock = require('redlock');
const logger = require('../common/logger')();
const {REDIS, REDIS_NAMESPACE} = require('../common/constant');

const clients = () => {
    return _.map(REDIS, (_config) => {
        let client = new Redis(_.pick(_config, ['host', 'port', 'password']));
        client.on('ready', () => {
            logger.info(`Redis ${_config.host} is ready`);
        });
        return client;
    })
};
const redLock = new RedLock(
    // you should have one client for each independent redis node
    // or cluster
    clients(),
    {
        driftFactor: 0.01, // time in ms
        retryCount: 0,  //for many tasks it's sufficient to attempt a lock with retryCount=0, and treat a failure as the resource being "locked" or (more correctly) "unavailable",
        retryDelay: 150, // time in ms
        retryJitter: 50 // time in ms
    }
);

redLock.on('clientError', function (err) {
    logger.error('A redis error has occurred:', err);
});


class RedisLock {
    static async lock(key, ttl) {
        let resource = [REDIS_NAMESPACE, key].join('-');
        try {
            return await redLock.lock(resource, ttl);
        } catch (error) {
            return false;
        }
    }
}

module.exports = RedisLock;

