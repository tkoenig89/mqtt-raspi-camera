var _module = {
    debug: _noop,
    log: _log,
    error: _error,
    
    setDebug: function setDebug(doEnable) {
        if (doEnable) {
            this.debug = _debug;
        } else {
            this.debug = _noop;
        }
        return _module;
    },
    setLog: function setLog(doEnable) {
        if (doEnable) {
            this.log = _log;
        } else {
            this.log = _noop;
        }
        return _module;
    },
    setError: function setErr(doEnable) {
        if (doEnable) {
            this.error = _error;
        } else {
            this.error = _noop;
        }
        return _module;
    }

};
function _debug(...args) {
    console.log("DEBUG " + new Date().toLocaleString(), ...args);
}

function _log(...args) {
    console.log("LOG " + new Date().toLocaleString(), ...args);
}

function _error(...args) {
    console.error("ERROR " + new Date().toLocaleString(), ...args);
}

function _noop() {

}
module.exports = _module;