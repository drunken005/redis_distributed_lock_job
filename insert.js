const {RED_LOCK_JOB, LOG_DAYS_TO_KEEP} = require('./common/constant');
const {Util} = require('./common/utils');
const logPath = Util.getLoggerPath(RED_LOCK_JOB.NAME);
const monitorLogDir = Util.getMonitorLogPath;
const logger = require("./common/logger")(logPath, RED_LOCK_JOB.NAME, monitorLogDir, LOG_DAYS_TO_KEEP);
const {TestJob} = require('./dao');

(async ()=>{
    let arrays = new Array(10000);
    for (let i of arrays) {
        let data = {
            name: Util.uuid()
        };
        await TestJob.execute(TestJob.create.name, data);
    }
    logger.info(`...............insert done. insert count=${arrays.length}`)
})();