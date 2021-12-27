const MAXIMUM_DELAY = 2147483647; // maximum that is used for browsers
const DEFAULT_DELAY = 86400000; // one day

// To schedule a task, call the schedule method, pass there 1: Date, 2: callback function. Returns uniq Id for remove if task was scheduled.
// To set maximum allowable delay: 1. Pass value when creating new instance. 2. Call setMaxDelay method with value for Scheduler. This value is in ms.
class Scheduler {
    // maxDelay = Number
    constructor(maxDelay) {
        this._maxDelay = maxDelay != undefined
            ? (maxDelay <= MAXIMUM_DELAY ? maxDelay : MAXIMUM_DELAY)
            : DEFAULT_DELAY
        ;
        this._queue = []; // { at: Date, callback: function, id: string } always sorted by time
        this._timeoutId = null;
        this._wakeUpTime = null;
        this._idMap = {};
    }

    _evaluateCompliance(position, date) {
        return this._queue[position].at.getTime() - date.getTime();
    }

    _generateRandomId() {
        let id;
        do id = ([1e5]+1e4).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
        while (this._idMap.hasOwnProperty(id));
        return this._idMap[id] = id;
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
                const task = this._queue.shift();
                task.callback();
                delete this._idMap[task.id];
            } else finish = true;
        } while (!finish);
        this._start();
    }

    _resetTimer() {
        clearTimeout(this._timeoutId);
        this._timeoutId = null;
        this._wakeUpTime = null;
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
        } else this._resetTimer();
    }

    _isEarlier(date) {
        return !this._wakeUpTime || date.getTime() < this._wakeUpTime.getTime();
    }

    _updateTimer(date) {
        if (this._isEarlier(date)) this._restart();
    }

    _placeSchedulingTask(date, callback, id) {
        this._queue.splice(this._findRelevantPlace(date), 0, { at: date, callback, id });
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
            const id = this._generateRandomId();
            this._placeSchedulingTask(skdDate, callback, id);
            this._updateTimer(skdDate);
            return id;
        }
    }

    cancelSchedule(id) {
        if (!id) throw new Error('Id is missing');
        this._queue = this._queue.filter(task => task.id != id);
        delete this._idMap[id];
        this._restart();
    }

    setMaxDelay(delay) {
        this._maxDelay = delay;
        this._restart();
    }
}
