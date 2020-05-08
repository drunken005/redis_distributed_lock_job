const CONSTANTS = {

    MY_SQL: {
        uri: 'mysql://root:p@ssw0rd@127.0.0.1:3306/test',
        options:
            {
                pool: {max: 10, min: 5},
                define: {timestamps: false, freezeTableName: true},
                timezone: '+08:00',
                benchmark: true,
                logging: false
            }
    },
    REDIS_NAMESPACE: 'TEST',
    REDIS: [  //支持多个redis实例
        {
            host: '127.0.0.1', port: '6379'
        }
    ],
    LOGGER_BASE_DIR: 'log',

    LOG_DAYS_TO_KEEP: 7,

    TIMEOUT: 10 * 1000,

    PAGE_NUM: 0,

    PAGE_SIZE: 5,

    RED_LOCK_JOB: {
        NAME: 'red_lock_job',
        INTERVAL: 10,
        LOCK_KEY: 'red_lock_job',
        TTL: 100000
    }
};


module.exports = CONSTANTS;