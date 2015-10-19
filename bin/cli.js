#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var ProgressBar = require('progress');

// Create the cli
// Function used to get the strict for all
(function () {
    'use strict';

    return {
        moduleLog: '\u001b[1;31m[Pomodoro]\u001b[0m',

        /**
         * Initializes the cli
         *
         * @return {cli}
         */
        init: function () {
            this.clearTerminal();

            // Announce the shortcuts first
            this.help();

            // Initialize pomodoro
            this.pomodoro = require('../lib/pomodoro').init(this.getConfig());

            // Set the timer
            this.pomodoro.setTimer();

            // Listen keyboard
            this.listenKeyboard();

            return this;
        },

        /**
         * Get config from file or create one
         *
         * @return {Object}
         */
        getConfig: function () {
}           var homeFolder = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
            var configPath = path.resolve(homeFolder, '.pomodoro-config');
            var configRead = fs.existsSync(configPath) && fs.readFileSync(configPath, 'utf8');
            var configKeys;
            var config = {
                perDay: 20, // after 20 full pomodoros call a day
                whenToLongBreak: 10, // after 10 pomodoros

                pomodoroTime: 1800, // 60 minutes in seconds
                breakTime: 60, // 1 minute in seconds
                longBreakTime: 900 // 15 minutes in seconds
            };

            // TODO: Interface should help to change this data

            // Create config if it doesn't exist
            if (!configRead) {
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4), {
                    encoding: 'utf8'
                });
            } else {
                configRead = JSON.parse(configRead);

                // Mix the read file with the actual config
                configKeys = Object.keys(configRead);
                configKeys.forEach(function (key) {
                    config[key] = configRead[key];
                }.bind(this));

            }

            // Set the functions
            config.remainingChanged = this.remainingChanged.bind(this);
            config.log = this.logMessage.bind(this);
            config.timerComplete = this.timerComplete.bind(this);

            return config;
        },

        /**
         * Remaining changed
         *
         * @param  {String} msg
         */
        remainingChanged: function (remaining) {
            var total = this.pomodoro.getTotalTime();

            this.inMiddleProgress = true;

            // Set the progress bar
            // Done here because progress doesn't have an update method for total
            // TODO: Update method for total
            var loadingBarStr = this.moduleLog + ' :bar ';
            loadingBarStr += '\u001b[1m:percent\u001b[0m';
            loadingBarStr += ' \u001b[33m|\u001b[0m ';
            loadingBarStr += 'Remaining: \u001b[1m';

            if (remaining < 60) {
                loadingBarStr += remaining + 's\u001b[0m';
            } else {
                loadingBarStr += Math.ceil(remaining / 60) + 'm\u001b[0m';
            }

            var progress = new ProgressBar(loadingBarStr, {
                complete: '\u001b[42m \u001b[0m',
                incomplete: '\u001b[41m \u001b[0m',
                total: total,
                renderThrottle: 500,
                width: 30,
                callback: function () {
                    this.inMiddleProgress = false;
                }.bind(this)
            });

            // Set the tick
            progress.tick(total - remaining);
        },

        /**
         * Log message
         *
         * @param  {String} msg
         */
        logMessage: function (msg) {
            if (msg !== 'Stopped') {
                msg = this.moduleLog + ' ' + msg;
                msg = this.inMiddleProgress ? '\n' + msg : msg;
                console.log(msg);
            }
        },


        /**
         * Timer complete
         *
         * @param  {String} msg
         */
        timerComplete: function (state) {
            var isWin = /^win/.test(process.platform);
            var isMac = /^darwin/.test(process.platform);
            var isLinux = !isWin && !isMac;
            var msg = state === 'Pomodoro' ? 'Have a break!' : 'Get back to work!';

            // TODO: Windows
            // TODO: Linux ubuntu: notify-send break
            isLinux && exec('xmessage -center "' + msg + '"');
            isMac && exec('osascript -e \'tell app "System Events" to display alert "' + msg + '"\'');
        },

        /**
         * Listen for keyboard events
         */
        listenKeyboard: function () {
            // Listen for keyboard events
            // Without this, we would only get streams once enter is pressed
            process.stdin.setRawMode(true);
            process.stdin.setEncoding('utf8');

            // On any data into stdin
            process.stdin.on('data', function (key) {
                switch (key) {
                    case '\u0003':
                    case 'c':
                    case 'q':
                        this.exit();
                        break;
                    case ' ':
                        this.startStop();
                        break;
                    case 's':
                        this.skip();
                        break;
                    default:
                        this.help();
                }
            }.bind(this));

            // Prevent from closing
            process.stdin.resume();
        },

        /**
         * Decides if timer should continue
         */
        startStop: function () {
            if (this.pomodoro.getTimerState() === 'running') {
                this.pomodoro.stop();
            } else {
                this.pomodoro.start();
            }
        },

        /**
         * Skip actual timer
         */
        skip: function () {
            this.inMiddleProgress && console.log('');
            this.pomodoro.skip();

            this.inMiddleProgress = false;
        },

        /**
         * Shows help
         */
        help: function () {
            var header = '\n' + this.moduleLog + '\u001b[32m Help\u001b[0m\n';

            // TODO: Improve interface
            console.log(this.inMiddleProgress ? '\n' + header : header);
            console.log('       \u001b[1mH\u001b[0m       Show help');
            console.log('       \u001b[1mSpace\u001b[0m   Start/stop actual timer');
            console.log('       \u001b[1mS\u001b[0m       Skip the actual timer');
            console.log('       \u001b[1mQ\u001b[0m       Quit\n');
        },

        /**
         * Clears terminal
         */
        clearTerminal: function () {
            var lines = process.stdout.getWindowSize()[1];
            for (var i = 0; i < lines; i++) {
                console.log('\r\n');
            }
        },

        /**
         * Exit cli
         */
        exit: function () {
            process.exit();
        }
    }.init();
})();
