const express = require("express");
const request = require("request");

const Account = require("../account");
const Block = require("../blockchain/block");
const Blockchain = require("../blockchain");
const PubSub = require("./pubsub");
const Transaction = require("../transaction");
const TransactionQueue = require("../transaction/transaction-queue");

const app = express();
const mainChain = new Blockchain();
const pubSub = new PubSub({ blockchain: mainChain });
const BASE_URL = process.env.BASE_URL;
const ROOT_PORT = process.env.ROOT_PORT;
const account = new Account();
const transactionQueue = new TransactionQueue();

transactionQueue.add(Transaction.createTransaction({ sender: account }));

app.get("/", (req, res, next) => {
    return res.json("Welcome to homepage");
});

app.get("/blockchain", (req, res, next) => {
    const { chain } = mainChain;
    return res.json(chain);
});

app.get("/blockchain/mine", (req, res, next) => {
    const lastBlock = mainChain.chain[mainChain.chain.length - 1];
    const block = Block.mineBlock({
        lastBlock: lastBlock,
    });
    mainChain
        .addBlock({ block })
        .then(() => {
            pubSub.broadcastBlock({ block });
            res.json(block);
        })
        .catch(next);
});

app.post("/account/transact", (req, res, next) => {
    const { to, value } = req.body;
    const transaction = Transaction.createTransaction({
        sender: !to ? new Account() : account,
        receiver: to,
        value,
    });
    transactionQueue.add(transaction);
    res.json({
        transaction,
    });
});

app.use((err, req, res, next) => {
    console.error("Internal Server Error", err);
    return res.status(500).json({ message: err.message });
});

const PEER_NODE = process.argv.includes("--peer");

const PORT = PEER_NODE ? Math.floor(2000 + Math.random() * 1000) : 3000;

if (PEER_NODE) {
    request(`${BASE_URL}:${ROOT_PORT}/blockchain`, (err, res, body) => {
        const chain = JSON.parse(body);
        mainChain
            .replaceChain({ chain })
            .then((message) => console.info(message))
            .catch((error) => console.error(error));
    });
}

app.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
