var mqtt = require("mqtt");
var logger = require("./common/logger");
var fs = require("fs");

let msAfterConnectionLostToRestart = 120 * 60 * 1000; // 120 min

module.exports = MqttPublishingClient;

function MqttPublishingClient(opts) {
    let isConnected = false;
    let client = null;

    init();
    return {
        publish: publish,
        close: close
    };

    function close() {
        client.end();
    }

    function init() {
        initClient();
        setupEventlisteners();
    }

    function publish(topic, message, options, callback) {
        if (isConnected) {
            client.publish(topic, message, options, callback);
        }
    }


    function initClient() {
        client = mqtt.connect(opts.address, {
            clientId: opts.identifier || "img_" + Math.floor(Math.random() * 1000),
            username: opts.username || null,
            password: opts.password || null,
            clean: true,
            keepalive: opts.keepalive || 60,
            ca: opts.ca ? [fs.readFileSync(opts.ca)] : null,
            checkServerIdentity: checkServerIdentityOverwrite,
            reconnectPeriod: opts.reconnectPeriod || 10000,
            will: !opts.will ? null : {
                topic: opts.will.topic,
                payload: opts.will.payload,
                qos: opts.will.qos || 0,
                retain: opts.will.retain || false
            }
        });
    }

    /**
     * This will check that the connection is opened to a valid host.
     * If passing returns undefined, in all other cases it should return an error.
     * See here for more info: https://github.com/nodejs/node-v0.x-archive/commit/bf5e2f246eff55dfc33318f0ffb4572a56f7645a
     * @param {string} host
     * @param {Object} cer
     * @returns {Error}
     */
    function checkServerIdentityOverwrite(host, cer) {
        if (host === opts.trustedHostname) {
            return undefined;
        } else {
            return Error("unknown host: " + host);
        };
    }

    function onConnect() {
        isConnected = true;
        logger.log("connected");
    }

    function onDisconnect() {
        isConnected = false;
        logger.log("connection lost");
    }

    function onError(err) {
        logger.error("MQTT ERROR", err);
    }

    function setupEventlisteners() {
        client.on("connect", onConnect);
        client.on("reconnect", onConnect);

        client.on("close", onDisconnect);
        client.on("offline", onDisconnect);

        client.on("error", onError);
    }
}