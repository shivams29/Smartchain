const PubNub = require("pubnub");
const Transaction = require("../transaction");

const CHANNEL_MAP = {
    TEST: "TEST",
    BLOCK: "BLOCK",
    TRANSACTION: "TRANSACTION",
};

class PubSub {
    constructor({ blockchain, transactionQueue }) {
        this.pubNub = new PubNub({
            subscribeKey: process.env.PUB_NUB_SUBSCRIBE_KEY,
            publishKey: process.env.PUB_NUB_PUBLISH_KEY,
            userId: "myUniqueUserId",
        });
        this.blockchain = blockchain;
        this.transactionQueue = transactionQueue;
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
                            .addBlock({
                                block,
                                transactionQueue: this.transactionQueue,
                            })
                            .then(() => console.info("New block accepted!"))
                            .catch((error) =>
                                console.error(
                                    "New block rejected! ",
                                    error.message
                                )
                            );
                        break;

                    case CHANNEL_MAP.TRANSACTION:
                        const transaction = JSON.parse(message);
                        console.log(
                            `Received transaction ${transaction.id} of type ${transaction.data.transactionType}`
                        );
                        this.transactionQueue.add(new Transaction(transaction));
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

    broadcastTransaction({ transaction }) {
        this.publish({
            channel: CHANNEL_MAP.TRANSACTION,
            message: JSON.stringify(transaction),
        });
    }
}

module.exports = PubSub;
