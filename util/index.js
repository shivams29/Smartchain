const keccak256 = require("js-sha3").keccak256;
/**
 * Stringify data object, convert into array of characters, sort and join
 * @param {object} data Data object
 * @returns {string} Sorted string
 */
const sortCharacters = (data) => JSON.stringify(data).split("").sort().join("");

/**
 * Hashing function
 * @param {object} data Data object to be hashed
 * @returns {string} Hex-encoded hash string of data
 */
const keccakHash = (data) => {
    const hash = keccak256.create();
    hash.update(sortCharacters(data));
    return hash.hex();
};

module.exports = {
    sortCharacters,
    keccakHash,
};
