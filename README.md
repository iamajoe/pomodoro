# Pomodoro
A simple pomodoro technique module with CLI.

### Installation
```bash
npm install --save git+ssh://git@github.com:Sendoushi/pomodoro.git # for node
npm install -g git+ssh://git@github.com:Sendoushi/pomodoro.git # for cli
```

### Usage
In node:
```js
var pomodoro = require('pomodoro');

// These are the default configs
pomodoro.init({
    perDay: 20, // after 20 full pomodoros call a day
    whenToLongBreak: 10, // after 10 pomodoros

    pomodoroTime: 1800, // 60 minutes in seconds
    breakTime: 60, // 1 minute in seconds
    longBreakTime: 900, // 15 minutes in seconds

    log: console.log.bind(console, '[Pomodoro]'),
    timerComplete: console.log.bind(console, '[Pomodoro]'),
    remainingChanged: function (remaining) {
        this.log(remaining + ' seconds left');
    }.bind(this)
}:Object);

// Start the pomodoro
pomodoro.start();

// Stop the actual timer
pomodoro.stop();

// Skip the actual timer
pomodoro.skip();

// Get pomodoro state
pomodoro.getState();

// Get timer state
pomodoro.getTimerState();

// Get config
pomodoro.getConfig();

// Get actual time
pomodoro.getActualTime();

// Get remaining time
pomodoro.getRemainingTime();
```

Or in the cli:
```bash
pomodoro # help will be provided
```
