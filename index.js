const {RED_LOCK_JOB, LOG_DAYS_TO_KEEP} = require('./common/constant');
const {Util} = require('./common/utils');
const logPath = Util.getLoggerPath(RED_LOCK_JOB.NAME);
const monitorLogDir = Util.getMonitorLogPath;
const logger = require("./common/logger")(logPath, RED_LOCK_JOB.NAME, monitorLogDir, LOG_DAYS_TO_KEEP);
const SchedulerMiddleware = require("./scheduler/scheduler");
const ProfitCollectionJob = require("./jobs/test_redis_lock_job");
module.exports = (() => {
    const profitCollectionJob = new ProfitCollectionJob();
    return new SchedulerMiddleware(
        RED_LOCK_JOB.NAME,
        [profitCollectionJob],
        RED_LOCK_JOB.INTERVAL,
    );
})();