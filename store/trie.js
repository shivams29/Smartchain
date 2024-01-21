const _ = require("lodash");
const { keccakHash } = require("../util");
class Node {
    constructor() {
        this.value = null;
        this.childMap = {};
    }
}

class Trie {
    constructor() {
        this.head = new Node();
        this.generateRootHash();
    }

    generateRootHash() {
        this.rootHash = keccakHash(this.head);
    }

    /**
     * Function to get value stored in trie using key
     * @param {string} key
     * @returns {string} Value stored at key
     */
    get(key) {
        // Take current node
        let currNode = this.head;

        // Iterate over characters
        for (let character of key) {
            // If child map of current node have node linked to current character, then move to that node
            if (currNode.childMap[character]) {
                currNode = currNode.childMap[character];
            }
        }
        // Return copy of node value when all characters are iterated
        return _.cloneDeep(currNode.value);
    }

    /**
     * Function to add value in trie at provided key
     * @param {string} key
     * @param {string} value
     */
    put(key, value) {
        // Take current node
        let currNode = this.head;

        // Iterate over characters of key
        for (let character of key) {
            // If child map does not has character then create a new node for current character
            if (!currNode.childMap[character]) {
                currNode.childMap[character] = new Node();
            }
            // Move to the new node
            currNode = currNode.childMap[character];
        }
        // Add value to the current node
        currNode.value = value;
        this.generateRootHash();
    }
}
module.exports = Trie;
