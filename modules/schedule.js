var schedule = Schedule();
module.exports = schedule;

function Schedule() {
    var tasks = [];

    function createTask(taskFn, schedule) {
        var task = new InternalTask(tasks.length, taskFn, schedule);
        tasks.push(task);
        return task.getExternalTask();
    }

    function InternalTask(idx, fn, schedule) {
        this.id = idx;
        this.fn = fn;
        this.schedule = schedule;
        this.isrunning = false;
    }

    function Task(id) {
        this.id = id;
    }

    function executeTask(idx) {
        var task = tasks[idx];

        if (task && task.isrunning) {
            setTimeout(() => {
                task.fn();
                executeTask(idx);
            }, task.schedule);
        }
    }

    InternalTask.prototype.getExternalTask = function getExternalTask() {
        return new Task(this.id)
    };

    Task.prototype.updateSchedule = function updateSchedule(newSchedule) {
        var task = tasks[this.id];
        if (task) {
            task.schedule = newSchedule;
        }
    };

    Task.prototype.start = function start() {
        var task = tasks[this.id];
        if (task) {
            if (!task.isrunning) {
                task.isrunning = true;
                executeTask(this.id);
            }
        }
    };

    Task.prototype.stop = function stop() {
        var task = tasks[this.id];
        if (task) {
            task.isrunning = false;
        }
    };

    return {
        createTask: createTask
    };
}