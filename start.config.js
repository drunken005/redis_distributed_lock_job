const {RED_LOCK_JOB} = require('./common/constant');
module.exports = {
    apps: [
        {
            name:               RED_LOCK_JOB.NAME,
            script:             "./index.js",
            watch:              false,
            ignore_watch:       ["node_modules", "log", "report"],
            out_file:           `./log/${RED_LOCK_JOB.NAME}/default.log`,
            error_file:         `./log/${RED_LOCK_JOB.NAME}/pm2error.log`,
            merge_logs:         true,
            max_memory_restart: "2G",
            exec_mode:          "fork",
            instances:          2,
            autorestart:        true
        }
    ]
};
