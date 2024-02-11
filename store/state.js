const Account = require("../account");
const Trie = require("./trie");

class State {
    constructor() {
        this.stateTrie = new Trie();
        this.storageTrieMap = {};
    }

    /**
     * Function to put account in state trie
     * @param {string} address New account address
     * @param {Account} accountData New account data
     */
    putAccount(address, accountData) {
        if (!this.storageTrieMap[address]) {
            this.storageTrieMap[address] = new Trie();
        }
        this.stateTrie.put(address, {
            ...accountData,
            storageRoot: this.storageTrieMap[address].rootHash,
        });
    }

    /**
     * Function to account data from state trie
     * @param {string} address Address of account
     * @returns {Account} Account data
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
