const MAXIMUM_DELAY = 2147483647; // maximum that is used for browsers
const DEFAULT_DELAY = 86400000; // one day

// To schedule a task, call the schedule method, pass there 1. Date, 2. callback function.
// To set maximum delay: 1. Pass value when creating new instance. 2. Pass value to setMaxDelay of Scheduler
class Scheduler {
    // maxDelay = Number
    constructor(maxDelay) {
        this._maxDelay = maxDelay != undefined
            ? (maxDelay <= MAXIMUM_DELAY ? maxDelay : MAXIMUM_DELAY)
            : DEFAULT_DELAY
        ;
        this._queue = []; // { at: Date, callback: function } always sorted by time
        this._timeoutId = null;
        this._wakeUpTime = null;
    }

    _evaluateCompliance(position, date) {
        return this._queue[position].at.getTime() - date.getTime();
    }

    _findRelevantPlace(schedulingTime) {
        let start = 0,
        middle = 0,
        end = this._queue.length - 1;

        while (start <= end) {
            middle = Math.floor((end + start) / 2);
            const compliance = this._evaluateCompliance(middle, schedulingTime);
            if (compliance < 0) start = middle + 1;
            else if (0 < compliance) end = middle - 1;
            else return middle;
        }
        return start;
    }

    _callbackProcess() {
        let finish = false;
        do {
            if (this._queue[0] && this._queue[0].at.getTime() <= new Date().getTime()) {
                this._queue.shift().callback();
            } else finish = true;
        } while (!finish);
        this._start();
    }

    _resetTimer() {
        clearTimeout(this._timeoutId);
    }

    _restart() {
        this._resetTimer();
        this._start();
    }

    _start() {
        if (this._queue[0]) {
            let delay = this._queue[0].at.getTime() - new Date().getTime();
            if (this._maxDelay < delay) delay = this._maxDelay;
            this._wakeUpTime = new Date(new Date().getTime() + delay);
            this._timeoutId = setTimeout(this._callbackProcess.bind(this), delay);
        }
    }

    _isEarlier(date) {
        return !this._wakeUpTime || date.getTime() < this._wakeUpTime.getTime();
    }

    _updateTimer(date) {
        if (this._isEarlier(date)) this._restart();
    }

    _placeSchedulingTask(date, callback) {
        this._queue.splice(this._findRelevantPlace(date), 0, { at: date, callback });
    }

    _getValidateTime(date) {
        let correctDate;
        if (date instanceof Date) correctDate = date;
        else correctDate = new Date(date);
        if (correctDate.toString() === 'Invalid Date') throw new Error(correctDate.toString());
        return correctDate;
    }

    schedule(date, callback) {
        const skdDate = this._getValidateTime(date);
        if (!callback) throw new Error('Callback is missing');
        if (skdDate.getTime() <= new Date().getTime()) callback();
        else {
            this._placeSchedulingTask(skdDate, callback);
            this._updateTimer(skdDate);
        }
    }

    setMaxDelay(delay) {
        this._maxDelay = delay;
        this._restart();
    }
}
