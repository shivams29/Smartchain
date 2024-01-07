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
    addBlock({ block }) {
        return new Promise((resolve, reject) => {
            Block.validateBlock({
                lastBlock: this.chain[this.chain.length - 1],
                block,
            })
                .then(() => {
                    this.chain.push(block);
                    return resolve();
                })
                .catch((error) => reject(error));
        });
    }
}

module.exports = Blockchain;
