const { GENESIS_DATA, MINE_RATE } = require("../config");

const { keccakHash } = require("../util");

// Length of each hash string
const HASH_LENGTH = 64;

/**
 * Hash string is in hexadecimal format and biggest hexadecimal number is f
 * Therefore, maximum hash value can be f times hash length required.
 */

const MAX_HASH_STRING = "f".repeat(HASH_LENGTH);
const MAX_HASH_VALUE = parseInt(MAX_HASH_STRING, 16);
const MAX_NONCE_VALUE = 2 ** 64;

class Block {
    constructor({ blockHeaders, transactionSeries }) {
        // Meta data about block
        this.blockHeaders = blockHeaders;
        this.transactionSeries = transactionSeries;
    }

    /**
     * Calculate block target hash
     * @param {object} { lastBlock } Last block of chain
     * @returns {string} Block target hash
     */
    static calculateBlockTargetHash({ lastBlock }) {
        /**
         * Target hash is calculated by dividing max hash value with last blocks difficulty
         * and then converting it to hexadecimal string.
         * This means that, the more difficult the last block was, the more easier will be to mine the next block.
         */
        const value = (
            MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty
        ).toString(16);

        // If hash string length is greater than allowed hash length, return MAX_HASH_STRING
        if (value.length > HASH_LENGTH) {
            return "f".repeat(HASH_LENGTH);
        }

        // Otherwise, create hash string by prepending 0s for remaining digits in allowed HASH_LENGTH
        // For e.g value = 1234, then return 000....(till HASH_LENGTH - 4)1234
        return "0".repeat(HASH_LENGTH - value.length) + value;
    }

    /**
     * Static method to adjust mining difficulty
     * @param {object} blockDetails
     * @returns {number} Difficulty value
     */
    static adjustDifficulty({ lastBlock, timestamp }) {
        const { difficulty } = lastBlock.blockHeaders;

        // If the time different between mining of last block and mining of this block is greater than mine rate,
        // then decrease difficulty.
        if (timestamp - lastBlock.blockHeaders.timestamp > MINE_RATE)
            return difficulty - 1;

        // Difficulty cannot be negative or 0 as there should be some difficulty in mining blocks
        if (difficulty < 1) return 1;

        // Increase difficulty by 1 for every block mined.
        return difficulty + 1;
    }

    /**
     * Static method for mining block
     * @returns {object} New mined block
     */
    static mineBlock({ lastBlock, beneficiary, transactionSeries, stateRoot }) {
        const target = Block.calculateBlockTargetHash({ lastBlock });
        let timestamp, truncatedBlockHeaders, header, nonce, underTargetHash;
        do {
            timestamp = Date.now();
            truncatedBlockHeaders = {
                parentHash: keccakHash(lastBlock.blockHeaders),
                beneficiary,
                difficulty: Block.adjustDifficulty({ lastBlock, timestamp }),
                number: lastBlock.blockHeaders.number + 1,
                timestamp,
                /**
                 * Note:
                 * This will be refactored when tries are implemented.
                 */
                transactionsRoot: keccakHash(transactionSeries),
                stateRoot,
            };

            //temporary header is generated
            header = keccakHash(truncatedBlockHeaders);

            //generating random nonce
            nonce = Math.floor(Math.random() * MAX_NONCE_VALUE);

            //header and nonce are combined and hashed until target hash is reached
            underTargetHash = keccakHash(header + nonce);
        } while (underTargetHash > target);

        return new this({
            blockHeaders: { ...truncatedBlockHeaders, nonce },
            transactionSeries: transactionSeries,
        });
    }

    /**
     * Static method to return genesis block.
     * Genesis is the first block of object where there is no parent or beneficiary data in block headers.
     * @returns {object} Block object
     */
    static genesis() {
        return new this(GENESIS_DATA);
    }

    /**
     * Validate mined block by comparing it with last block
     * @returns {Promise} Resolve or Reject telling if block is valid or not
     */
    static validateBlock({ lastBlock, block }) {
        return new Promise((resolve, reject) => {
            // Resolve if genesis block.
            if (keccakHash(block) === keccakHash(Block.genesis())) {
                return resolve();
            }

            // When hash of last block does not matches parent hash of this block
            if (
                keccakHash(lastBlock.blockHeaders) !==
                block.blockHeaders.parentHash
            ) {
                return reject(
                    new Error(
                        "The parent hash must be a hash of the last block's header"
                    )
                );
            }

            // When block number is incorrect
            if (
                block.blockHeaders.number !==
                lastBlock.blockHeaders.number + 1
            ) {
                return reject(
                    new Error("The block must increment the number by 1")
                );
            }

            // The difference in difficulty will always be of 1
            if (
                Math.abs(
                    lastBlock.blockHeaders.difficulty -
                        block.blockHeaders.difficulty
                ) > 1
            ) {
                return reject(
                    new Error("The difficulty must only adjust by 1")
                );
            }
            const target = Block.calculateBlockTargetHash({ lastBlock });
            const { blockHeaders } = block;
            const { nonce } = blockHeaders;
            const truncatedBlockHeaders = { ...blockHeaders };
            delete truncatedBlockHeaders.nonce;
            const header = keccakHash(truncatedBlockHeaders);
            const underTargetHash = keccakHash(header + nonce);

            if (underTargetHash > target) {
                return reject(
                    new Error(
                        "The block does not meet the proof of work requirement"
                    )
                );
            }
            return resolve();
        });
    }
}

module.exports = Block;
