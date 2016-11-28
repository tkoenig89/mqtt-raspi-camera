var mqtt = require("mqtt");
var logger = require("./logger");
var fs = require("fs");

module.exports = MqttPublishingClient;

function MqttPublishingClient(opts) {
    client = null;

    init();
    return {
        publish: publish
    };

    function init() {
        initClient();
        setupEventlisteners();
    }

    function publish(topic, message, options, callback) {
        client.publish(topic, message, options, callback);
    }

    function onConnect(connack) {
        logger.debug("connected");
    }

    function onError(err) {
        logger.error("MQTT ERROR", err);
    }

    function initClient() {
        client = mqtt.connect(opts.address, {
            clientId: opts.identifier || "img_" + Math.floor(Math.random() * 1000),
            username: opts.username || null,
            password: opts.password || null,
            clean: true,
            ca: opts.ca ? [fs.readFileSync(opts.ca)] : null,
            checkServerIdentity: checkServerIdentityOverwrite,
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

    function setupEventlisteners() {
        client.on("connect", onConnect);
        client.on("error", onError);
    }
}