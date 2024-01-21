const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");

const Account = require("../account");
const Block = require("../blockchain/block");
const Blockchain = require("../blockchain");
const PubSub = require("./pubsub");
const Transaction = require("../transaction");
const TransactionQueue = require("../transaction/transaction-queue");
const State = require("../store/state");

const app = express();
const state = new State();
const mainChain = new Blockchain(state);
const BASE_URL = process.env.BASE_URL;
const ROOT_NODE_PORT = process.env.ROOT_NODE_PORT;
const account = new Account();
const transactionQueue = new TransactionQueue();
const pubSub = new PubSub({ blockchain: mainChain, transactionQueue });
const newTransaction = Transaction.createTransaction({ sender: account });

transactionQueue.add(newTransaction);

setTimeout(() => {
    pubSub.broadcastTransaction({ transaction: newTransaction });
}, 500);

app.use(bodyParser.json());

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
        transactionSeries: transactionQueue.getTransactionSeries(),
        stateRoot: state.getStateRoot(),
    });
    mainChain
        .addBlock({ block, transactionQueue })
        .then(() => {
            pubSub.broadcastBlock({ block });
            res.json(block);
        })
        .catch(next);
});

app.get("/account/balance", (req, res, next) => {
    const { address } = req.query;
    const balance = state.getAccount(address || account.address).balance;
    res.json({ balance });
});

app.post("/account/transact", (req, res, next) => {
    const { to, value } = req.body;
    const transaction = Transaction.createTransaction({
        sender: !to ? new Account() : account,
        receiver: to,
        value,
    });
    transactionQueue.add(transaction);
    pubSub.broadcastTransaction({ transaction });
    res.json({
        transaction,
    });
});

app.use((err, req, res, next) => {
    console.error("Internal Server Error", err);
    return res.status(500).json({ message: err.message });
});

const PEER_NODE = process.argv.includes("--peer");

const PORT = PEER_NODE
    ? Math.floor(2000 + Math.random() * 1000)
    : ROOT_NODE_PORT;

if (PEER_NODE) {
    request(`${BASE_URL}:${ROOT_NODE_PORT}/blockchain`, (err, res, body) => {
        const chain = JSON.parse(body);
        mainChain
            .replaceChain({ chain })
            .then((message) => console.info(message))
            .catch((error) => console.error(error));
    });
}

app.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
