const GENESIS_DATA = {
    blockHeaders: {
        parentHash: '--genesis-parent-hash--',
        beneficiary: '--genesis-beneficiary--',
        difficulty: 1,
        number: 0,
        timestamp: '--genesis-timestamp--',
        nonce: 0
    }
};

//exporting object including genesis data

module.exports = {
    GENESIS_DATA
};