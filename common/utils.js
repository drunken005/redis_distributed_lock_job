const uuidV4 = require("uuid/v4");
const FlakeId = require("flake-idgen");
const NumberFormat = require("biguint-format");
const path = require('path');
const sequenceProduce = new FlakeId();
const _ = require('lodash');
const Crypto = require("crypto");
const CONSTANTS = require('../common/constant');

/**
 * 请求参数类
 */
class Parameter {
    constructor(reqid) {
        this.reqid = !!reqid ? reqid : Util.uuid();
    }

    export() {
        return {
            reqid: this.reqid,
        };
    }

    static fromTraceId(traceId) {
        let parameter = new Parameter(traceId);

        return parameter.export();
    }

    static fromParameter(parameter) {
        let __parameter__ = new Parameter();
        let traceId = `${parameter && parameter.reqid}_${__parameter__.reqid}`;

        return Parameter.fromTraceId(traceId);
    }
}

class Util {

    static createEurekaInstanceId(gateway) {
        return [Util.getIpv4().replace(/\./, '-'), gateway.name, gateway.port].join(':')
    }

    static getLoggerPath(serverName) {
        return path.join(__dirname, `../${CONSTANTS.LOGGER_BASE_DIR}/${serverName}`);
    }

    static get getMonitorLogPath() {
        return path.join(__dirname, `../${CONSTANTS.LOGGER_BASE_DIR}`);
    }

    static uuid() {
        return uuidV4().replace(/-/g, "");
    }

    static getBizId() {

        return NumberFormat(sequenceProduce.next(), "dec");
    }

    static async sleep(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    };


    static endCode(data) {
        if (!data) {
            return data;
        }
        if (_.isString(data)) {
            return Buffer.from(data).toString('hex');
        }
        return Buffer.from(JSON.stringify(data)).toString('hex');
    }


    static deCode(str) {
        return Buffer.from(str, 'hex').toString();
    }

    static getIpv4() {
        const os = require('os');
        let networkInterfaces = os.networkInterfaces();
        let nets = networkInterfaces.en0 ? networkInterfaces.en0 : networkInterfaces.eth0;
        let {address} = _.find(nets, {family: 'IPv4'});
        return address;
    };



    /**
     * 接口请求参数签名
     * @param params
     * @returns {string}
     */
    static requestParamsSign(params) {
        let signStr = Util.sortParams(params);
        const secretKey = Apollo.getApolloConfig([CONSTANTS.PROFIT_PAY, 'secretKey'].join('.'));
        return Crypto.createHash("md5").update(signStr + secretKey).digest('hex');
    }

    /**
     * 对json对象key首字母排序，返回拼接字符串
     * @param params
     * @returns {string}
     */
    static sortParams(params) {
        _.each(params, (value, key) => {
            (value === '' || value === undefined || value === null) && delete data[key];
        });
        let keys = _.sortBy(_.keys(params));
        let _docs = _.map(keys, (key) => {
            return [key, params[key]].join('=')
        });
        return _docs.join('&');
    }

    /**
     * 对json对象key首字母进行排序返回新的对象
     * @param params
     * @returns {*}
     */
    static sortParamsToObj(params) {
        let keys = _.sortBy(_.keys(params));
        let obj = {};
        _.each(keys, (key) => {
            if (params[key] != null) {
                obj[key] = params[key]
            }
        });
        return obj;
    }
}

module.exports = {
    Parameter,
    Util
};
