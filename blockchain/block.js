const { GENESIS_DATA, MINE_RATE } = require('../config');
//.. used to point one directory back

const { keccakHash } = require('../util');

const HASH_LENGTH = 64; //maximum length of hash 
const MAX_HASH_VALUE = parseInt('f'.repeat(HASH_LENGTH),16); // maximum hash can be 16 times f which is converted in to a numerical value using parse Int and for hexadciam 16 is used
const MAX_NONCE_VALUE = 2 ** 64;

class Block {
    constructor({blockHeaders}) {
        this.blockHeaders = blockHeaders;
    }

    static calculateBlockTargetHash({ lastBlock }){
        // here we are returning a target hash string
        // the target hash string is generated by dividing max hash value with difficulty of last block
        // the more the diff the less the target hash and vice versa
        // ().to string(16) converts value into a hexadecimal string
        const value = (MAX_HASH_VALUE/lastBlock.blockHeaders.difficulty).toString(16);
        
        if(value.length > HASH_LENGTH){
            return 'f'.repeat(HASH_LENGTH);
        }

        return '0'.repeat(HASH_LENGTH - value.length) + value;
    }

    
    static adjustDifficulty({lastBlock, timestamp}){
        const {difficulty} = lastBlock.blockHeaders;
        
        if ((timestamp - lastBlock.blockHeaders.timestamp)>MINE_RATE){
            return difficulty-1;
        }

        if(difficulty<1){
            return 1;
        }
        return difficulty+1;
        
    }
    
    
    static mineBlock({ lastBlock,beneficiary }) {
        const target = Block.calculateBlockTargetHash({ lastBlock })
        let timestamp, truncatedBlockHeaders, header , nonce,underTargetHash;

        do {
            timestamp = Date.now();
            truncatedBlockHeaders = {
            parentHash: keccakHash(lastBlock.blockHeaders),
            beneficiary,
            difficulty: Block.adjustDifficulty({lastBlock, timestamp}),
            number: lastBlock.blockHeaders.number + 1,
            timestamp
            };
            //temporary header is generated 
            header = keccakHash(truncatedBlockHeaders);
            //generating random nonce
            nonce = Math.floor(Math.random() * MAX_NONCE_VALUE);
        
            //header and nonce are combined and hashed until target hash is reached
            underTargetHash = keccakHash(header + nonce);
        } while(underTargetHash > target);


        
        //console.log('underTargetHash',underTargetHash);
        //console.log('target', target);

        return new this({
            blockHeaders: {...truncatedBlockHeaders ,nonce }
        })

        //...truncatedBlockcheaders is equal to 
        //parentHash = truncatedBlockHeaders.parentHash etc.. 
    }
    static genesis(){
        return new this(GENESIS_DATA);
    }

    static validateBlock({ lastBlock,block }){
        return new Promise((resolve,reject)=>{

            if(keccakHash(block) === keccakHash(Block.genesis())){
                return resolve();
            }

            if(keccakHash(lastBlock.blockHeaders)!== block.blockHeaders.parentHash){
                return reject(new Error("The parent hash must be a hash of the last block's header")); 
            }

            if(block.blockHeaders.number!== lastBlock.blockHeaders.number+1){
                return reject(new Error('The block must increment the number by 1'));
            }

            if(Math.abs(lastBlock.blockHeaders.difficulty - block.blockHeaders.difficulty) >1){
                return reject(new Error('The difficulty must only adjust by 1'));
            }
            const target = Block.calculateBlockTargetHash({lastBlock});
            const { blockHeaders } = block;
            const { nonce } = blockHeaders;
            const truncatedBlockHeaders = { ...blockHeaders };
            delete truncatedBlockHeaders.nonce;
            const header = keccakHash(truncatedBlockHeaders);
            const underTargetHash = keccakHash(header+nonce);
            
            if(underTargetHash > target){
                return reject(
                    new Error('The block does not meet the proof of work requirement')
                )
            }
            return resolve();
        });
    }
}

module.exports = Block;

const block = Block.mineBlock({
    lastBlock: Block.genesis(),
    beneficiary: 'shivam'
});

//console.log('block',block);