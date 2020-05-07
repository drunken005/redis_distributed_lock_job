const _ = require('lodash');
const Redis = require('ioredis');
const RedLock = require('redlock');
const logger = require('../common/logger')();
const {REDIS} = require('../common/constant');

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
        retryCount: 2,
        retryDelay: 150, // time in ms
        retryJitter: 50 // time in ms
    }
);

redLock.on('clientError', function (err) {
    logger.error('A redis error has occurred:', err);
});

module.exports = redLock;