const _ = require('lodash');
const logger = require('../common/logger')();

class BaseMiddleware {
    static onError(error, context) {
        error = _.isObject(error) ? error : {};
        context = !!context ? context : BaseMiddleware.onError.name;
        error.reqid = context;
        logger.stack(error);
    }

    static onUncaughtException(error) {
        BaseMiddleware.onError(error, BaseMiddleware.onUncaughtException.name);
    }

    static onUnhandledRejection(error) {
        BaseMiddleware.onError(error, BaseMiddleware.onUnhandledRejection.name);
    }
}

module.exports = BaseMiddleware;