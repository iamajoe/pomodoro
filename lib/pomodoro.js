// Export pomodoro
// Used this way to support different envs
return (function () {
    'use strict';

    var pomodoro = {
        config: {
            perDay: 8, // after 8 full pomodoros call a day
            whenToLongBreak: 4, // after 4 pomodoros

            pomodoroTime: 3120, // 52 minutes in seconds
            breakTime: 420, // 7 minute in seconds
            longBreakTime: 900, // 15 minutes in seconds

            // Functions to callback
            log: console.log.bind(console, '[Pomodoro]'),
            timerComplete: console.log.bind(console, '[Pomodoro]'),
            remainingChanged: function (remaining) {
                this.log(remaining + ' seconds left');
            }.bind(this)
        },

        /**
         * Initialize pomodoro
         *
         * @param  {Object} config
         * @return {pomodoro}
         */
        init: function (config) {
            // Set config variables
            this.setConfig(config);

            // Initialize vars
            this.counter = 0;

            return this;
        },

        /**
         * Start timer
         */
        start: function () {
            !this.totalTime && this.setTimer();

            // TODO: Implement long break
            // TODO: Implement per day

            // Set timer running
            this.startTimer(function () {
                this.config.timerComplete(this.state);

                // Start the next one
                this.skip();
            }.bind(this));
        },

        /**
         * Skip timer
         */
        skip: function () {
            this.unsetTimer();

            this.counter += 1;
            this.setTimer();
        },

        /*
         * Stop the timer
         */
        stop: function () {
            this.actualTotalTime = this.remaining;
            this.unsetTimer();

            this.config.log('Stopped');
        },

        // ----------------------------------------------------------

        /**
         * Gets config
         */
        getConfig: function () {
            return this.config;
        },

        /**
         * Gets pomodoro state
         */
        getState: function () {
            return this.state;
        },

        /**
         * Gets timer state
         */
        getTimerState: function () {
            return this.timerState;
        },

        /**
         * Gets total time
         */
        getTotalTime: function () {
            return this.totalTime;
        },

        /**
         * Gets remaining
         */
        getRemainingTime: function () {
            return this.remaining;
        },

        // -----------------------------------------------

        /**
         * Sets config
         *
         * @param  {Object} config
         */
        setConfig: function (config) {
            if (!config || typeof config !== 'object') {
                return;
            }

            var configKeys = !!config ? Object.keys(config) : [];
            configKeys.forEach(function (key) {
                this.config[key] = config[key];
            }.bind(this));
        },

        /**
         * Sets next type of timer
         */
        setTimer: function () {
            // It can only be break time or pomodoro time
            if (this.counter % 2 === 0) {
                this.totalTime = this.config.pomodoroTime;
                this.state = 'Pomodoro';
            } else {
                this.totalTime = this.config.breakTime;
                this.state = 'Break';
            }

            // Set the actual total time
            this.actualTotalTime = this.totalTime;

            this.config.log(this.state + ' to start');
        },

        // -----------------------------------------------

        /**
         * Starts timer
         *
         * @param  {Function} callback
         */
        startTimer: function (callback) {
            this.unsetTimer();

            // Reset minute timer
            this.remaining = this.actualTotalTime;

            // Follow the remaining time
            this.remainingTimer = setInterval(function () {
                this.remaining -= 1;
                this.config.remainingChanged(this.remaining);
            }.bind(this), 1000);

            // Start the new timer
            this.timer = setTimeout(function () {
                // Force 100% in the progress bar
                this.config.remainingChanged(0);

                this.timerState = 'stopped';
                this.config.log('Ended\n');

                callback();
            }.bind(this), this.actualTotalTime * 1000);

            // Cache timer state
            this.timerState = 'running';
        },

        /**
         * Unsets timer
         */
        unsetTimer: function () {
            this.timerState = 'stopped';

            this.timer && clearTimeout(this.timer);
            this.remainingTimer && clearInterval(this.remainingTimer);
        }
    };

    // Set the amd support
    if (typeof module === 'object') {
        module.exports = pomodoro;
    } else {
        return pomodoro;
    }
})();
