const _ = require('lodash');
const CONSTANTS = require('../common/constant');
const logger = require('../common/logger')();
const {Parameter, Util} = require('../common/utils');
const {TestJob} = require('../dao');
const redLock = require('../redlock');


class TestRedisLockJob {
    constructor() {
        this.job = this.constructor.name;
    }

    async execute() {
        this.__init__();
        this.__before_job_handler__();

        try {
            //lock with key CONSTANTS.RED_LOCK_JOB.LOCK_KEY
            let lock = await this.__lock();
            if (!lock) {
                return logger.info(`reqid=${this.parameter.reqid}||job=${this.job}||processNum=${this.processNum}||msg=job break(current task is in progress)`);
            }
            let taskList = await this.fetchTaskList(this.pageNum, this.pageSize);
            this.processNum = taskList.length;
            if (!_.isArray(taskList) || taskList.length === 0) {
                return logger.info(`reqid=${this.parameter.reqid}||job=${this.job}||processNum=${this.processNum}||msg=job break(taskList.length=0)`);
            }
            await this.processFlows(taskList);
            //unlock
            return lock.unlock();
        } catch (error) {
            error = _.isObject(error) ? error : {};
            error.reqid = `${this.parameter.reqid}||job=${this.job}.${this.execute.name}()`;
            logger.stack(error);
        }
        this.__after_job_handler__();
    }


    /**
     * fetchTaskList
     * @returns {Promise<void>}
     */
    async fetchTaskList(pageNum, pageSize) {
        return await TestJob.execute(TestJob.findAll.name, {status: 1}, pageNum, pageSize)
    }

    /**
     * processFlows
     * @param taskList
     * @returns {Promise<void>}
     */
    async processFlows(taskList) {
        let ids = _.map(taskList, ({id}) => id);
        await TestJob.execute(TestJob.update.name, {pid: process.pid, status: 2}, {id: {[TestJob.Op.in]: ids}});
        await Util.sleep(3000);
    }


    /**
     * 对象初始化
     * @param pageSize   每页大小
     * @param pageNum    请求页数
     * @param timeout    接口超时
     * @param processNum 已获取数量
     * @private
     */
    __init__(pageSize = CONSTANTS.PAGE_SIZE, pageNum = CONSTANTS.PAGE_NUM, timeout = CONSTANTS.TIMEOUT, processNum = 0) {
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.timeout = timeout;
        this.processNum = processNum;
        this.parameter = new Parameter();
        this.startTime = Date.now();
    }

    /**
     * 调度开始日志
     * @private
     */
    __before_job_handler__() {
        let request = {
            reqid: this.parameter.reqid,
            job: this.job,
            msg: "A job begin...",
        };
        logger.in(request);
    }

    /**
     * 对任务加锁
     * @private
     */
    async __lock() {
        try {
            const lock = await redLock.lock(CONSTANTS.RED_LOCK_JOB.LOCK_KEY, CONSTANTS.RED_LOCK_JOB.TTL);
            logger.info(`Current job lock value=${lock.value}`);
            return lock;
        } catch (error) {
            logger.stack(error);
            return false;
        }
    }

    /**
     * 调度结束日志
     * @private
     */
    __after_job_handler__() {
        let cost = Date.now() - this.startTime;
        let average = this.processNum > 0 ? (cost / this.processNum).toFixed(0) : cost;
        let response = {
            reqid: this.parameter.reqid,
            job: this.job,
            cost: `${cost}ms`,
            processNum: this.processNum,
            average: `${average}ms/job`,
            msg: "A job end.",
        };
        logger.out(response);
    }
}

module.exports = TestRedisLockJob;