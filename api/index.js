const express = require("express");
const Blockchain = require("../blockchain");
const Block = require("../blockchain/block");
const PubSub = require("./pubsub");
const request = require("request");

const app = express();
const mainChain = new Blockchain();
const pubSub = new PubSub({ blockchain: mainChain });

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

app.use((err, req, res, next) => {
    console.error("Internal Server Error", err);
    return res.status(500).json({ message: err.message });
});

const PEER_NODE = process.argv.includes("--peer");

const PORT = PEER_NODE ? Math.floor(2000 + Math.random() * 1000) : 3000;

if (PEER_NODE) {
    request("http://localhost:3000/blockchain", (err, res, body) => {
        const chain = JSON.parse(body);
        mainChain
            .replaceChain({ chain })
            .then((message) => console.info(message))
            .catch((error) => console.error(error));
    });
}

app.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
