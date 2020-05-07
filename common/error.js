const CodeStateEnum = require("../enums/code_state");
const SubCodeStateEnum = require("../enums/sub_code_state");
const _ = require('lodash');


class MyException extends Error {
    constructor(respCode, subCode, msg, detail) {
        if (_.isError(detail)) {
            msg += detail.message;
        } else if (_.isString(detail)) {
            msg += detail;
        }
        super(msg);
        this.respCode = respCode;
        this.subCode = subCode;
        this.msg = msg;
    }

    static isSuccess(response) {
        let successFlag = false;
        if (response && response.respCode === CodeStateEnum.SUCCESS.value) {
            successFlag = true;
        }

        return successFlag;
    }

    toString() {
        return `respCode=${this.respCode}||sub_code=${this.subCode}||msg=${this.msg}`;
    }
}

class MySQLException extends MyException {
    constructor(detail) {
        super(CodeStateEnum.COMMON.value, SubCodeStateEnum.THREE.value, ``, detail);
    }
}

module.exports = {
    MyException,
    MySQLException
};