const express = require("express");
const Blockchain = require("../blockchain");
const Block = require("../blockchain/block");

const app = express();
const mainChain = new Blockchain();

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
            res.json(block);
        })
        .catch(next);
});

app.use((err, req, res, next) => {
    console.error("Internal Server Error", err);
    return res.status(500).json({ message: err.message });
});

const PORT = 3000;

app.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
