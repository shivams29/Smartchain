const Trie = require("./trie");

class State {
    constructor() {
        this.stateTrie = new Trie();
    }

    /**
     * Function to put account in state trie
     * @param {string} address New account address
     * @param {object} accountData New account data
     */
    putAccount(address, accountData) {
        this.stateTrie.put(address, accountData);
    }

    /**
     * Function to account data from state trie
     * @param {string} address Address of account
     * @returns {object} Account data
     */
    getAccount(address) {
        return this.stateTrie.get(address);
    }

    /**
     * Function to return root hash
     * @returns {string} Return root hash of state
     */
    getStateRoot() {
        return this.stateTrie.rootHash;
    }
}

module.exports = State;
