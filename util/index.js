const keccak256 = require("js-sha3").keccak256;
const EC = require("elliptic").ec;
/**
 * Stringify data object, convert into array of characters, sort and join
 * @param {object} data Data object
 * @returns {string} Sorted string
 */
const sortCharacters = (data) => JSON.stringify(data).split("").sort().join("");

/**
 * Hashing function
 * Converts the object passed into a sorted string and then converts to hex string.
 * @param {object} data Data object to be hashed
 * @returns {string} Hex-encoded hash string of data
 */
const keccakHash = (data) => {
    const hash = keccak256.create();
    hash.update(sortCharacters(data));
    return hash.hex();
};

/**
 * Elliptic class object
 * secp256lk1 meaning - sec - secure elliptic cryptography, p256 - prime number 256, k1 - algorithm version
 */
const ec = new EC("secp256k1");

module.exports = {
    sortCharacters,
    keccakHash,
    ec,
};
