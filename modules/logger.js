var debug_enabled = false;
var log_enabled = true;
var err_enabled = true;

var _module = {
    debug: function debug(...args) {
        if (debug_enabled) console.log("DEBUG " + new Date().toLocaleString(), ...args);
    },
    log: function log(...args) {
        if (log_enabled) console.log("LOG " + new Date().toLocaleString(), ...args);
    },
    error: function error(...args) {
        if (err_enabled) console.error("ERROR " + new Date().toLocaleString(), ...args);
    },
    setDebug: function setDebug(doEnable) {
        debug_enabled = doEnable;
        return _module;
    },
    setLog: function setLog(doEnable) {
        log_enabled = doEnable;
        return _module;
    },
    setError: function setErr(doEnable) {
        err_enabled = doEnable;
        return _module;
    }
};

module.exports = _module;