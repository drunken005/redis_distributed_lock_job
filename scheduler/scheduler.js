const EventEmitter = require("events");
const _ = require('lodash');
const logger = require("../common/logger")();
const {Util} = require('../common/utils');
const {sequelize} = require("../dao");
const BaseMiddleware = require("./base");
const RedisLock = require('../redlock');

class SchedulerMiddleware extends EventEmitter {
    /**
     * 任务调度器
     * @param job      任务名称
     * @param jobList  任务实例
     * @param interval 任务间隔
     */
    constructor(job, jobList, interval) {
        super();

        this.__job_name__ = `${this.constructor.name}(${job})`;
        this.__job_list__ = jobList;
        this.__interval__ = interval * 1000;

        this.on("startup", this.onStartUp.bind(this));
        this.on("update", this.onUpdate.bind(this));
        this.on("error", this.onError.bind(this));

        this.emit("startup");
    }

    /**
     * 启动事件
     * @returns {Promise<void>}
     */
    async onStartUp() {
        this.emit("update");
    }

    /**
     * 更新事件
     * @returns {Promise<void>}
     */
    async onUpdate() {
        let startTime = Date.now();
        try {
            let jobList = [];
            for (let job of this.__job_list__) {
                let lock = await RedisLock.lock(job.job, this.__interval__ * 10);
                if (!lock) {
                    logger.info(`Execute job '${job.job}' break, current job is in progress and locked.`);
                    continue;
                }
                job.locker = lock;
                jobList.push(job.execute());
            }
            await Promise.all(jobList);
        } catch (error) {
            BaseMiddleware.onError(error, `${this.__job_name__}.${this.onUpdate.name}()`);
        }

        let cost = Date.now() - startTime;
        let delta = cost - this.__interval__ > 1 ? 1 : this.__interval__ - cost;

        logger.info(`${this.__job_name__}.${this.onUpdate.name}()||sleep=${delta}ms\n`);
        await Util.sleep(delta).catch(BaseMiddleware.onUncaughtException);

        this.emit("update");
    }

    /**
     * 错误事件
     * @param error
     */
    onError(error) {
        BaseMiddleware.onError(error, `${this.__job_name__}.${this.onError.name}()`);
    }

    /**
     * 退出事件
     * @returns {Promise<void>}
     */
    static async onCoreDown() {
        let flag = 1;
        try {
            await sequelize.close();
            flag = 0;
        } catch (error) {
            BaseMiddleware.onError(error, `SchedulerMiddleware.onCoreDown()`);
        } finally {
            process.exit(flag);
        }
    }
}


process.on("uncaughtException", BaseMiddleware.onUncaughtException);
process.on("unhandledRejection", BaseMiddleware.onUnhandledRejection);
process.on("SIGINT", SchedulerMiddleware.onCoreDown);


module.exports = SchedulerMiddleware;