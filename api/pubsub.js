const CHANNEL_MAP = {
    TEST: "TEST",
    BLOCK: "BLOCK",
};

const PubNub = require("pubnub");

class PubSub {
    constructor({ blockchain }) {
        this.pubNub = new PubNub({
            subscribeKey: process.env.PUB_NUB_SUBSCRIBE_KEY,
            publishKey: process.env.PUB_NUB_PUBLISH_KEY,
            userId: "myUniqueUserId",
        });
        this.blockchain = blockchain;
        this.subscribeToChannels();
        this.listen();
    }

    subscribeToChannels() {
        this.pubNub.subscribe({
            channels: Object.values(CHANNEL_MAP),
        });
    }

    publish({ channel, message }) {
        this.pubNub.publish({
            channel,
            message,
        });
    }

    listen() {
        this.pubNub.addListener({
            message: (messageObject) => {
                const { channel, message } = messageObject;

                console.info("Message received. Channel: ", channel);

                switch (channel) {
                    case CHANNEL_MAP.BLOCK:
                        const block = JSON.parse(message);
                        this.blockchain
                            .addBlock({ block })
                            .then(() => console.info("New block accepted!"))
                            .catch((error) =>
                                console.error(
                                    "New block rejected! ",
                                    error.message
                                )
                            );
                        break;
                    default:
                        return;
                }
            },
        });
    }

    broadcastBlock({ block }) {
        this.publish({
            channel: CHANNEL_MAP.BLOCK,
            message: JSON.stringify(block),
        });
    }
}

module.exports = PubSub;
