/**
 * PatternLayout
 * Format for specifiers is %[padding].[truncation][field]{[format]}
 * Fields can be any of:
 *  - %r time in toLocaleTimeString format
 *  - %p log level
 *  - %c log category
 *  - %h hostname
 *  - %m log data
 *  - %d date in constious formats
 *  - %% %
 *  - %n newline
 *  - %z pid
 *  - %f filename
 *  - %l line number
 *  - %o column postion
 *  - %s call stack
 *  - %x{<tokenname>} add dynamic tokens to your log. Tokens are specified in the tokens parameter
 *  - %X{<tokenname>} add dynamic tokens to your log. Tokens are specified in logger context
 *
 * You can use %[ and %] to define a colored block.
 *
 * Tokens are specified as simple key:value objects.
 * The key represents the token name whereas the value can be a string or function
 * which is called to extract the value to put in the log message. If token is not
 * found, it doesn't replace the field.
 *
 * A sample token would be: { 'pid' : function() { return process.pid; } }
 */

const path = require('path');

let createLogConfig = (logDir, serviceName, monitorLogDir, daysToKeep = 7) => {
    if (!logDir) {
        throw new Error('Init log config error, logDir is undefined.');
    }

    const consoleLayout = {
        type: "pattern",
        pattern: "%[%d||server=%h||pid=%z||level=%p%]||%m",
    };

    const fileLayout = {
        type: "pattern",
        pattern: "%d||server=%h||pid=%z||level=%p||%m",
    };


    let alarmLayout;
    if (serviceName && monitorLogDir) {
        alarmLayout = {
            type: "pattern",
            pattern: ['%d', '%h', '%x{service}', '%m'].join('||'),
            tokens: {
                service: () => {
                    return serviceName.toUpperCase()
                }
            }
        };
    }


    const appenders = {
        console: {
            type: "console",
            layout: consoleLayout,
        },
        access: {
            type: "dateFile",
            layout: fileLayout,
            filename: `${path.join(logDir, "access.log")}`,
            pattern: ".yyyy-MM-dd",
            encoding: "utf-8",
            keepFileExt: true,
            daysToKeep,
        },
        errors: {
            type: "dateFile",
            layout: fileLayout,
            filename: `${path.join(logDir, "errors.log")}`,
            pattern: ".yyyy-MM-dd",
            encoding: "utf-8",
            keepFileExt: true,
            daysToKeep,
        },
        transaction: {
            type: "dateFile",
            layout: fileLayout,
            filename: `${path.join(logDir, "transaction.log")}`,
            pattern: ".yyyy-MM-dd",
            encoding: "utf-8",
            keepFileExt: true,
            daysToKeep,
        }
    };

    const categories = {
        default: {
            appenders: ["console"],
            level: "debug",
        },
        access: {
            appenders: ["console", "access"],
            level: "info",
        },
        errors: {
            appenders: ["errors"],
            level: "info",
        },
        transaction: {
            appenders: ["console", "transaction"],
            level: "info",
        }
    };
    if (!!alarmLayout) {
        appenders.alarm = {
            type: "dateFile",
            layout: alarmLayout,
            filename: `${path.join(monitorLogDir, "app-monitor.log")}`,
            pattern: ".yyyy-MM-dd",
            encoding: "utf-8",
            keepFileExt: true,
            daysToKeep,
        };
        categories.alarm = {
            appenders: ["alarm"],
            level: "info"
        }
    }

    return {
        appenders,
        categories,
        pm2: true
    };
};

module.exports = createLogConfig;
