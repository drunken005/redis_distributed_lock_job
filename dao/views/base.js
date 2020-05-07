const Sequelize = require("sequelize");
const _ = require('lodash');
const {MySQLException, MyException} = require("../../common/error");
const {MY_SQL} = require('../../common/constant');
const logger = require("../../common/logger")();

const sequelize = new Sequelize(MY_SQL.uri, MY_SQL.options);

class BaseView {
    /**
     * @param Model
     */
    constructor(Model) {
        this.model = Model(sequelize, Sequelize);
        this.Op = Sequelize.Op;
    }

    /**
     * MYSQL视图入口
     * @param method  执行方法
     * @param options 执行参数
     * @returns {Promise<void>}
     */
    async execute(method, ...options) {
        logger.transaction({
            method: `${this.model.name}.${method}()`,
            options: method === 'bulkCreate' ? `count(${options[0].length})` : JSON.stringify(options)
        });

        try {
            let results = await this[method].apply(this, options);
            if (_.includes(['bulkCreate', 'findAll'], method) && _.isArray(results) && results.length >= 40) {
                logger.transaction({
                    method: `${this.model.name}.${method}()`,
                    results: `count(${results.length})`,
                });
            } else {
                logger.transaction({
                    method: `${this.model.name}.${method}()`,
                    results: JSON.stringify(results),
                });
            }

            return results;
        } catch (error) {
            logger.stack(error);
            if (error instanceof MyException) {
                throw error;
            } else {
                throw new MySQLException(error && error.message);
            }
        }
    }

    /**
     * 查询指定条件的一条数据
     * @param where 查询条件
     * @returns {Promise<Model>}
     */
    async findOne(where) {
        return await this.model.findOne({
            where,
        });
    };

    /**
     * 查询指定条件的全部数据
     * @param where  查询条件
     * @param offset 请求页数
     * @param limit  每页大小
     * @param order  排序方式
     * @param attributes fields
     * @returns {Promise<*|Array<Model>>}
     */
    async findAll(where, offset, limit, order, attributes) {
        let result = await this.model.findAll({
            where,
            offset,
            limit,
            order,
            attributes,
            // logging: logger.info
        });
        return JSON.parse(JSON.stringify(result));
    }

    async aggregate(attribute, aggregateFunction, options) {
        let result = await this.model.aggregate(attribute, aggregateFunction, options);

        return JSON.parse(JSON.stringify(result));
    }

    /**
     * 查询指定条件的数据数量
     * @param where  查询条件
     * @returns {Promise<void>}
     */
    async count(where) {
        return await this.model.findAndCountAll({where});
    }

    /**
     * 查询指定条件的数据数量
     * @param values  values
     * @param options options
     * @returns {Promise<void>}
     */
    async create(values, options) {
        return await this.model.create(values, options);
    }


    /**
     * 查询指定条件的数据，需支持事务
     *    不存在则创建
     *    已存在则返回，处理唯一索引约束
     * @param where    查询条件
     * @param defaults 写入对象
     * @returns {Promise<*|Model>}
     */
    async findOrCreate(where, defaults) {
        return await this.model.findOrCreate({
            where,
            defaults,
        });

    }

    async bulkCreate(records, options) {
        return await this.model.bulkCreate(records, options);
    }

    /**
     * 查询指定条件的数据，不支持事务，执行一次查找
     *    不存在则创建一条数据
     *    创建数据时出现唯一索引约束，又执行一次查找
     * @param where    查询条件
     * @param defaults 写入对象
     * @returns {Promise<*|Model>}
     */
    async findCreateFind(where, defaults) {
        return await this.model.findCreateFind({
            where,
            defaults
        });
    }

    /**
     * 更新指定条件的数据
     * @param values
     * @param where
     * @returns {Promise<*>}
     */
    async update(values, where) {
        return await this.model.update(values, {
            where,
        });
    }

    /**
     * 查询指定条件的最大值
     * @param field
     * @param options
     * @returns {Promise<*>}
     */
    async max(field, options) {
        return await this.model.max(field, options);
    }

    /**
     * 执行原生的sql 查询语句
     * @param sql
     * @param options
     * @returns {Promise<[undefined, number]>}
     */
    async query(sql, options = {}) {

        if (!options.type) {
            options.type = sequelize.QueryTypes.SELECT
        }
        return await sequelize.query(sql, options);
    }

    async remove(where) {
        if (!where || _.isEmpty(where)) {
            return;
        }
        return await this.model.destroy({where});
    }
}


module.exports = {
    BaseView,
    sequelize,
};