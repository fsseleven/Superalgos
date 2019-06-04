﻿require('dotenv').config()

global.SHALL_BOT_STOP = false;
global.AT_BREAKPOINT = false; // This is used only when running at the browser.
global.RUN_AS_TEAM = false;
global.FULL_LOG = process.env.FULL_LOG;

/* Default parameters can be changed by the execution configuration */
global.EXCHANGE_NAME = process.env.EXCHANGE_NAME;
global.MARKET = {
    assetA: "USDT",
    assetB: "BTC"
};

process.on('uncaughtException', function (err) {
    console.log('[INFO] Run -> uncaughtException -> err.message = ' + err.message);
    console.log('[INFO] Run -> uncaughtException -> err.stack = ', err.stack);
    process.exit(1)
});

process.on('unhandledRejection', (reason, p) => {
    console.log('[INFO] Run -> unhandledRejection -> reason = ' + JSON.stringify(reason));
    console.log('[INFO] Run -> unhandledRejection -> p = ' + JSON.stringify(p));
    process.exit(1)
});

process.on('exit', function (code) {
    console.log('[INFO] Run -> process.on.exit -> About to exit -> code = ' + code);
});

readExecutionConfiguration();

function readExecutionConfiguration() {
    try {
        console.log("[INFO] Run -> readExecutionConfiguration -> Entering function. ");
        let startMode

        // Environment Configuration
        global.GATEWAY_ENDPOINT = process.env.GATEWAY_ENDPOINT

        // General Financial Being Configuration
        global.DEV_TEAM = process.env.DEV_TEAM
        global.CURRENT_BOT_REPO = process.env.BOT + "-" + process.env.TYPE + "-Bot"
        global.RUN_AS_TEAM = (process.env.RUN_AS_TEAM === "true")
        global.USER_LOGGED_IN = process.env.USER_LOGGED_IN

        if (process.env.TYPE === 'Trading') {
            let live = {
                run: "false",
                resumeExecution: process.env.RESUME_EXECUTION
            }

            let backtest = {
                run: "false",
                resumeExecution: process.env.RESUME_EXECUTION,
                beginDatetime: process.env.BEGIN_DATE_TIME,
                endDatetime: process.env.END_DATE_TIME
            }

            let competition = {
                run: "false",
                resumeExecution: process.env.RESUME_EXECUTION,
                beginDatetime: process.env.BEGIN_DATE_TIME,
                endDatetime: process.env.END_DATE_TIME
            }

            startMode = {
                live: live,
                backtest: backtest,
                competition: competition
            }
        } else if (process.env.TYPE === 'Indicator' || process.env.TYPE === 'Sensor') {
            let allMonths = {
                run: "false",
                minYear: process.env.MIN_YEAR,
                maxYear: process.env.MAX_YEAR
            }
            let oneMonth = {
                run: "false",
                year: process.env.MIN_YEAR,
                month: process.env.MONTH
            }
            let noTime = {
                run: "false",
                beginDatetime: process.env.BEGIN_DATE_TIME,
                resumeExecution: process.env.RESUME_EXECUTION
            }
            let fixedInterval = {
                run: "false",
                interval: process.env.INTERVAL
            }

            startMode = {
                allMonths: allMonths,
                oneMonth: oneMonth,
                noTime: noTime,
                fixedInterval: fixedInterval
            }
        } else {
            console.log("[ERROR] readExecutionConfiguration -> Bot Type is invalid.");
            throw new Error("readExecutionConfiguration -> Bot Type is invalid.")
        }

        startMode[process.env.START_MODE].run = "true"

        let cloneToExecute = {
            enabled: "true",
            devTeam: process.env.DEV_TEAM,
            bot: process.env.BOT,
            process: process.env.PROCESS,
            repo: global.CURRENT_BOT_REPO
        }

        global.EXECUTION_CONFIG = {
            cloneToExecute: cloneToExecute,
            startMode: startMode,
            timePeriod: getTimePeriod(process.env.TIME_PERIOD),
            timePeriodFileStorage: process.env.TIME_PERIOD,
            dataSet: process.env.DATA_SET
        };

        // var cloneExecutorConfig = require('./package.json');
        // global.CLONE_EXECUTOR = {
        //     codeName: 'clone-executor',
        //     codeName: 'clone-executor',
        //     version: cloneExecutorConfig.version
        // }

        global.CLONE_EXECUTOR = {
            codeName: 'AACloud',
            version: '1.1'
        }

        startRoot();
    }

    catch (err) {
        console.log("[ERROR] readExecutionConfiguration -> err = " + err.message);
        console.log("[ERROR] readExecutionConfiguration -> Please verify that the Start Mode for the type of Bot configured applies to that type.");
        console.log("[ERROR] readExecutionConfiguration -> err = " + err.stack);
    }
}

function getTimePeriod(timePeriod) {
    if (timePeriod !== undefined) {
        try {
            let timePeriodMap = new Map()
            timePeriodMap.set("24-hs", 86400000)
            timePeriodMap.set("12-hs", 43200000)
            timePeriodMap.set("08-hs", 28800000)
            timePeriodMap.set("06-hs", 21600000)
            timePeriodMap.set("04-hs", 14400000)
            timePeriodMap.set("03-hs", 10800000)
            timePeriodMap.set("02-hs", 7200000)
            timePeriodMap.set("01-hs", 3600000)
            timePeriodMap.set("45-min", 2700000)
            timePeriodMap.set("40-min", 2400000)
            timePeriodMap.set("30-min", 1800000)
            timePeriodMap.set("20-min", 1200000)
            timePeriodMap.set("15-min", 900000)
            timePeriodMap.set("10-min", 600000)
            timePeriodMap.set("05-min", 300000)
            timePeriodMap.set("04-min", 240000)
            timePeriodMap.set("03-min", 180000)
            timePeriodMap.set("02-min", 120000)
            timePeriodMap.set("01-min", 60000)
            return timePeriodMap.get(timePeriod)
        } catch (error) {
            console.log("[WARN] Run -> readExecutionConfiguration -> getTimePeriod -> Error: ", error);
        }
    } else {
        return undefined
    }
}

function startRoot() {

    console.log("[INFO] Run -> startRoot -> Entering function. ");

    const ROOT_DIR = './';
    const ROOT_MODULE = require(ROOT_DIR + 'Root');
    let root = ROOT_MODULE.newRoot();

    let UI_COMMANDS = {
        beginDatetime: undefined,
        endDatetime: undefined,
        timePeriod: undefined,
        startMode: undefined,
        eventHandler: undefined
    };

    root.initialize(UI_COMMANDS, onInitialized);

    function onInitialized() {

        console.log("[INFO] Run -> startRoot -> onInitialized -> Entering function. ");

        root.start();
    }
}

