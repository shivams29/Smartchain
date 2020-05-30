const keccak256 = require('js-sha3').keccak256;


//Stringifiy the data
//seperate ever character using split which makes an array of characters
// sort the characters 
// join again


const sortCharacters = data =>{

    return JSON.stringify(data).split('').sort().join('')
}

const keccakHash = data =>{
    const hash = keccak256.create();
    
    
    hash.update(sortCharacters(data));
    
    return hash.hex();
}

module.exports = {
    sortCharacters,
    keccakHash
};