const ADD = 'ADD';
const SUB = 'SUB';
const MUL = 'MUL';
const DIV = 'DIV';
const PUSH = 'PUSH';
const STOP = 'STOP'; 
const LT = 'LT';
const GT = 'GT';
const EQ = 'EQ';
const AND = 'AND';
const OR = 'OR';
const JUMP = 'JUMP';
const JUMPI =  'JUMPI';

const OPCODE_MAP = {
 ADD ,
 SUB,
 MUL,
 DIV,
 PUSH,
 STOP, 
 LT,
 GT,
 EQ,
 AND,
 OR,
 JUMP,
 JUMPI
};

const EXECUTION_COMPLETE = 'Execution complete';
const EXECUTION_LIMIT = 10000;

class Interpreter{
  constructor() {
    this.state = {
      programCounter: 0,
      stack: [],
      code: [],
      execution_count: 0
    };
  }


  /**
   * Jump the program counter to specified statement in stack
   */
  jump() {
    const destination = this.state.stack.pop();
    if (destination < 0 || destination > this.state.code.length) {
      throw new Error(`Invalid destination: ${destination}`);
    }
    this.state.programCounter = destination;
    this.state.programCounter--; 
  }

  /**
   * Execute code statement provided
   * @param {Array} code Code statement 
   * @returns {any} output of code statement
   */
  runCode(code) {
    this.state.code = code;

    // Run a loop till program counter is less than code length
    while(this.state.programCounter < this.state.code.length) {

      // Increment execution count for every code part to check for infinite loop
      this.state.execution_count++;

      // Check if there is infinite loop.
      if (this.state.execution_count > EXECUTION_LIMIT){
        throw new Error(`Check for an infinite loop. Execution limit of ${EXECUTION_LIMIT} exceeded`);
      }

      // Get operation to be performed as opCode from code statement
      const opCode = this.state.code[this.state.programCounter];

      try{
        switch (opCode) {

          // Stop execution
          case STOP:
            throw new Error(EXECUTION_COMPLETE);

          // Push in execution stack
          case PUSH:

            // Increment current pointer to get the next value which is pushed
            this.state.programCounter++

            // Check if pointer points to last code statement and raise error if last code statement is PUSH.
            if (this.state.programCounter === this.state.code.length){
              throw new Error(`The 'PUSH' instruction cannot be last`);
            }

            // Get value that is pushed
            const value = this.state.code[this.state.programCounter];

            // Push the value in stack
            this.state.stack.push(value);
            break;

          // Mathematical operations
          case ADD:
          case SUB:
          case MUL:
          case DIV:
          case LT:
          case GT:
          case EQ:
          case AND:
          case OR:
            // Pop and get values from stack
            const a = this.state.stack.pop();
            const b = this.state.stack.pop();
            let result;

            if ( opCode==ADD ) result = b + a;
            if ( opCode==MUL ) result = b * a;
            if ( opCode==DIV ) result = b / a;
            if ( opCode==SUB ) result = b - a;
            if ( opCode==LT ) result = b < a ? 1 : 0;
            if ( opCode==GT ) result = b > b ? 1 : 0;
            if ( opCode==EQ ) result = a === b ? 1 : 0;
            if ( opCode==AND ) result = a && b;
            if ( opCode==OR ) result = a || b;

            // Push result in stack
            this.state.stack.push(result);
            break;

          // Jump to specified statement in order 
          case JUMP:
            this.jump();
            break;

          // Jump to immediate statement
          case JUMPI:
            const condition = this.state.stack.pop(); 
            if (condition === 1) {
              this.jump();
            }
     
          default:
            break;
          }
      } catch(error) {
        // If execution is completed, get the last value from stack 
        // and that should be the answer and return the same. 
        if (error.message === EXECUTION_COMPLETE) {
          return this.state.stack[this.state.stack.length - 1];
        }
        throw error;
      }
      this.state.programCounter++;
    }
  }
}

Interpreter.OPCODE_MAP = OPCODE_MAP;
module.exports = Interpreter;
