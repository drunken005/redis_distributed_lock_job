const Enum = require("enum");

const CodeStateEnum = new Enum({
    "SUCCESS": "000000",
    "DATA_EXISTS": "100000",
    "COMMON":  "200000",
    "HTTP":    "200000",
    "SDK":     "300000",
    "PARAMS":  "400000",
    "NONCE_UNAVAILABLE": "500000",
    "insufficient_balance": "500001"
});


module.exports = CodeStateEnum;