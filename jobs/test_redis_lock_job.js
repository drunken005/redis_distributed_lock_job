const _ = require('lodash');
const CONSTANTS = require('../common/constant');
const logger = require('../common/logger')();
const {Parameter, Util} = require('../common/utils');
const {TestJob} = require('../dao');


class TestRedisLockJob {
    constructor() {
        this.job = this.constructor.name;
    }

    async execute() {
        this.__init__();
        this.__before_job_handler__();
        try {
            let taskList = await this.fetchTaskList(this.pageNum, this.pageSize);
            this.processNum = taskList.length;
            await this.processFlows(taskList);
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
        for (let task of taskList){
            await TestJob.execute(TestJob.update.name, {pid: process.pid, status: 2, updateCount: task.updateCount+1}, {id: task.id});
        }
        //由于执行上面代码用时很少，所以加个等待3s
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
            redisLocker: this.locker ? this.locker.value: '',
            msg: "A job begin...",
        };
        logger.in(request);
    }

    /**
     * 调度结束日志
     * @private
     */
    __after_job_handler__() {
        //TODO 任务执行完后必须解锁
        this.locker && this.locker.unlock();
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