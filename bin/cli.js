#!/usr/bin/env node
var exec = require('child_process').exec;
var ProgressBar = require('progress');

'use strict';

// Create the cli
return {
    moduleLog: '\033[1;31m[Pomodoro]\033[0m',

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
        this.pomodoro = require('../pomodoro').init({
            remainingChanged: this.remainingChanged.bind(this),
            log: this.logMessage.bind(this),
            timerComplete: this.timerComplete.bind(this)
        });

        // Set the timer
        this.pomodoro.setTimer();

        // Listen keyboard
        this.listenKeyboard();

        return this;
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
        var percentStr = '\033[1m:percent\033[0m';
        var remainingStr = 'Remaining: \033[1m' + remaining + 's\033[0m';
        var progress = new ProgressBar(this.moduleLog + ' :bar ' + percentStr + ' \033[33m|\033[0m ' + remainingStr, {
            complete: '\033[42m \033[0m',
            incomplete: '\033[41m \033[0m',
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
        var header = '\n' + this.moduleLog + '\033[32m Help\033[0m\n';

        // TODO: Improve interface
        console.log(this.inMiddleProgress ? '\n' + header : header);
        console.log('       \033[1mH\033[0m       Show help');
        console.log('       \033[1mSpace\033[0m   Start/stop actual timer');
        console.log('       \033[1mS\033[0m       Skip the actual timer');
        console.log('       \033[1mQ\033[0m       Quit\n');
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
