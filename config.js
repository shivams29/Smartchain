const GENESIS_DATA = {
    blockHeaders: {
        // Hash of complete previous block object
        parentHash: "--genesis-parent-hash--",
        // Name of user that mined block
        beneficiary: "--genesis-beneficiary--",
        // Difficulty when block was mined
        difficulty: 1,
        // Block number in chain, 0 for first block
        number: 0,
        // Timestamp on which block was mined
        timestamp: "--genesis-timestamp--",
        // Random multiplier used to achieve target hash
        nonce: 0,
        // Hash of all transactions stored in block
        transactionsRoot: "--genesis-transactions-root--",
        stateRoot: "--genesis-root-hash--",
    },
    transactionSeries: [],
};

const MILLISECONDS = 1;
const SECONDS = 1000 * MILLISECONDS;

// Decides the time in which a new block will be mined
const MINE_RATE = 13 * SECONDS;

// Default account starting balance
const STARTING_BALANCE = 1000;

// Default mining reward
const MINING_REWARD = 50;

module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    STARTING_BALANCE,
    MINING_REWARD,
};
