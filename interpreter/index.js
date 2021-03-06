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
  constructor(){
    this.state = {
      programCounter: 0,
      stack: [],
      code: [],
      execution_count: 0
    };
  }


  jump() {
    const destination = this.state.stack.pop();

    if (
      destination < 0 || destination > this.state.code.length
    ){
      throw new Error(`Invalid destination: ${destination}`);
    }
    this.state.programCounter = destination;
    this.state.programCounter--; 
  }

  runCode(code){
    this.state.code = code;

    while(this.state.programCounter < this.state.code.length) {

      this.state.execution_count++;

      if (this.state.execution_count > EXECUTION_LIMIT){
        throw new Error(`
        Check for an infinite loop. Execution limit of ${EXECUTION_LIMIT} exceeded`);
      }

      const opCode = this.state.code[this.state.programCounter];

      try{
        switch (opCode){
          case STOP:
            throw new Error(EXECUTION_COMPLETE);
          case PUSH:
            this.state.programCounter++
          
            if (this.state.programCounter === this.state.code.length){
              throw new Error(`The 'PUSH' instruction cannot be last`);
            }

            const value = this.state.code[this.state.programCounter];
            this.state.stack.push(value);
            break;
          case ADD:
          case SUB:
          case MUL:
          case DIV:
          case LT:
          case GT:
          case EQ:
          case AND:
          case OR:    
            const a = this.state.stack.pop();
            const b = this.state.stack.pop();
            let result;
            if ( opCode==ADD ) result = b+a;
            if ( opCode==MUL ) result = b*a;
            if ( opCode==DIV ) result = b/a;
            if ( opCode==SUB ) result = b-a;
            if ( opCode==LT ) result = b < a ? 1:0;
            if ( opCode==GT ) result = b > b ? 1:0;
            if ( opCode==EQ ) result = a === b ? 1:0;
            if ( opCode==AND ) result = a && b;
            if ( opCode==OR ) result = a||b;

            this.state.stack.push(result);
            break;
          case JUMP:
            this.jump();
            break;
          
          case JUMPI:
            const condition = this.state.stack.pop(); 
            if (condition === 1){
              this.jump();
            }
     
          default:
            break;
          }
      }catch(error){
        if (error.message === EXECUTION_COMPLETE){
          return this.state.stack[this.state.stack.length-1];
        }
        throw error;
      } 


      this.state.programCounter++;
    }
  }
}

Interpreter.OPCODE_MAP = OPCODE_MAP;
module.exports = Interpreter;


// let code = [PUSH,2,PUSH,3,ADD,STOP];
// let result = new Interpreter().runCode(code);
// console.log('The result of 2 ADD 3 is: ', result);

// code = [PUSH,5,PUSH,6,MUL,STOP];
// result = new Interpreter().runCode(code);
// console.log('The result of 5 MUL 6 is: ', result);

// code = [PUSH,20,PUSH,5,DIV,STOP];
// result = new Interpreter().runCode(code);
// console.log('The result of 20 DIV 5 is: ', result);

// code = [PUSH,100,PUSH,80,SUB,STOP];
// result = new Interpreter().runCode(code);
// console.log('The result of 100 SUB 80 is: ', result);

// code = [PUSH,10,PUSH,20,LT,STOP];
// result = new Interpreter().runCode(code);
// console.log('The result of 10 LT 20 is: ', result);

// code = [PUSH,15,PUSH,55,GT,STOP];
// result = new Interpreter().runCode(code);
// console.log('The result of 15 GT 55 is: ', result);

// code = [PUSH,100,PUSH,100,EQ,STOP];
// result = new Interpreter().runCode(code);
// console.log('The result of 100 EQ 100 is: ', result);

// code = [PUSH,1,PUSH,0,AND,STOP];
// result = new Interpreter().runCode(code);
// console.log('The result of 1 AND 0 is: ', result);

// code = [PUSH,1,PUSH,1,OR,STOP];
// result = new Interpreter().runCode(code);
// console.log('The result of 1 OR 1 is: ', result);

// code = [PUSH, 6 ,JUMP, PUSH , 0 , JUMP, PUSH , 'jump successfull',STOP];
// result = new Interpreter().runCode(code)
// console.log('Result of JUMP: ',result) 

// code = [PUSH, 8 , PUSH , 1 , JUMPI , PUSH , 0 , JUMP, PUSH , 'jump successfull',STOP];
// result = new Interpreter().runCode(code)
// console.log('Result of JUMPI: ',result)

// code = [PUSH, 99 ,JUMP, PUSH , 0 , JUMP, PUSH , 'jump successfull',STOP];
// try{
//   new Interpreter().runCode(code);
// }catch(error){
// console.log('Invalid destination errror: ',error.message); 
// }

// code = [ PUSH , 0 , PUSH];
// try{
//   new Interpreter().runCode(code);
// }catch(error){
// console.log('Invalid PUSH errror: ',error.message); 
// }

// code = [ PUSH , 0 , JUMP , STOP];
// try{
//   new Interpreter().runCode(code);
// }catch(error){
// console.log('Invalid execution errror: ',error.message); 
// }