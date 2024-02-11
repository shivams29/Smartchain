const { STARTING_BALANCE } = require("../config");
const { ec, keccakHash } = require("../util");

/**
 * Account class
 */
class Account {
    constructor(code = []) {
        // Public private key pair object
        this.keyPair = ec.genKeyPair();
        // Address of account which public key converted to hex string using encode.
        this.address = this.keyPair.getPublic().encode("hex");
        // Account starting balance
        this.balance = STARTING_BALANCE;
        // Code array for smart contracts
        this.code = code;
        // This code hash will be used to store account in state and
        // when same code is provided, then 2 different smart contract accounts will be stored in state.
        this.generateCodeHash();
    }

    generateCodeHash() {
        this.codeHash = this.code.length
            ? keccakHash(this.address + this.code)
            : null;
    }

    /**
     * Function that generates signature of data using this account's key pair
     * @param {object} data
     * @returns {string} Signature
     */
    sign(data) {
        return this.keyPair.sign(keccakHash(data));
    }

    /**
     * Static Function to verify signature generated using this account
     * @param {{publicKey: string; data: object; signature: string;}} Public key of account, data and signature
     * @returns {boolean} Signature valid or not
     */
    static verifySignature({ publicKey, data, signature }) {
        const keyFromPublic = ec.keyFromPublic(publicKey, "hex");
        return keyFromPublic.verify(keccakHash(data), signature);
    }

    /**
     * Function for returning the public details of account as json object
     * @returns {object} Public details of account
     */
    toJson() {
        return {
            address: this.address,
            balance: this.balance,
            code: this.code,
            codeHash: this.codeHash,
        };
    }
}

module.exports = Account;
