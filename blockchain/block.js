const { GENESIS_DATA } = require('../config');
//.. used to point one directory back


class Block {
    constructor({blockHeaders}) {
        this.blockHeaders = blockHeaders;
    }

    static mineBlock({ lastBlock }) {

    }

    static genesis(){
        return new this(GENESIS_DATA);
    }
}

module.exports = Block;