const { STARTING_BALANCE } = require("../config");
const { ec, keccakHash } = require("../util");

/**
 * Account class
 */
class Account {
    constructor() {
        // Public private key pair object
        this.keyPair = ec.genKeyPair();
        // Address of account which public key converted to hex string using encode.
        this.address = this.keyPair.getPublic().encode("hex");
        // Account starting balance
        this.balance = STARTING_BALANCE;
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
}

module.exports = Account;
