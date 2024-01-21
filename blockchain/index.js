const Block = require("./block");

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    /**
     * Function to add new block
     * @param {object} blockDetails
     * @returns {Promise} Promise which says block added or not
     */
    addBlock({ block, transactionQueue }) {
        return new Promise((resolve, reject) => {
            Block.validateBlock({
                lastBlock: this.chain[this.chain.length - 1],
                block,
            })
                .then(() => {
                    this.chain.push(block);
                    console.log(`New Bllock is this `, block);
                    transactionQueue.clearBlockTransactions(
                        block.transactionSeries
                    );
                    return resolve();
                })
                .catch((error) => reject(error));
        });
    }

    replaceChain({ chain }) {
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < chain.length; i++) {
                const block = chain[i];
                const lastBlockIndex = i - 1;
                const lastBlock =
                    lastBlockIndex > 0 ? chain[lastBlockIndex] : null;
                try {
                    await Block.validateBlock({ lastBlock, block });
                } catch {
                    return reject("Chain synchronization failed!");
                }
                console.info(
                    `-- Validated Block [${block.blockHeaders.number}]`
                );
            }
            this.chain = chain;
            return resolve("Chain synchronized with root node!");
        });
    }
}

module.exports = Blockchain;
