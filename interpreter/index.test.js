const Interpreter = require("./index");
const { ADD, SUB, MUL, DIV, PUSH, STOP, LT, GT, EQ, AND, OR, JUMP, JUMPI } =
    Interpreter.OPCODE_MAP;

//describe takes two arguments
// one is decription that is a string
// second is a callback function
// it() method has two function expect() and toEqual()
// expect() takes logic as argument toEqual() takes expected result as arg

describe("Interpreter", () => {
    describe("runCode()", () => {
        describe("and the code includes ADD", () => {
            it("adds two values", () => {
                expect(
                    new Interpreter().runCode([PUSH, 2, PUSH, 3, ADD, STOP])
                        .result
                ).toEqual(5);
            });
        });
    });

    describe("and the code includes SUB", () => {
        it("subtracts two values", () => {
            expect(
                new Interpreter().runCode([PUSH, 3, PUSH, 2, SUB, STOP]).result
            ).toEqual(1);
        });
    });

    describe("and the code includes MUL", () => {
        it("multiplies two values", () => {
            expect(
                new Interpreter().runCode([PUSH, 2, PUSH, 3, MUL, STOP]).result
            ).toEqual(6);
        });
    });

    describe("and the code includes DIV", () => {
        it("divides two values", () => {
            expect(
                new Interpreter().runCode([PUSH, 3, PUSH, 2, DIV, STOP]).result
            ).toEqual(1.5);
        });
    });

    describe("and the code includes LT", () => {
        it("checks if one value is less than another", () => {
            expect(
                new Interpreter().runCode([PUSH, 2, PUSH, 3, LT, STOP]).result
            ).toEqual(1);
        });
    });

    describe("and the code includes GT", () => {
        it("checks if one value is greater than another", () => {
            expect(
                new Interpreter().runCode([PUSH, 2, PUSH, 3, GT, STOP]).result
            ).toEqual(0);
        });
    });

    describe("and the code includes EQ", () => {
        it("checks if one value is equal to another", () => {
            expect(
                new Interpreter().runCode([PUSH, 2, PUSH, 3, EQ, STOP]).result
            ).toEqual(0);
        });
    });

    describe("and the code includes AND", () => {
        it("and of two values", () => {
            expect(
                new Interpreter().runCode([PUSH, 1, PUSH, 1, AND, STOP]).result
            ).toEqual(1);
        });
    });

    describe("and the code includes OR", () => {
        it("or of two values", () => {
            expect(
                new Interpreter().runCode([PUSH, 0, PUSH, 1, OR, STOP]).result
            ).toEqual(1);
        });
    });

    describe("and the code includes JUMP", () => {
        it("jumps to a destination", () => {
            expect(
                new Interpreter().runCode([
                    PUSH,
                    6,
                    JUMP,
                    PUSH,
                    0,
                    JUMP,
                    PUSH,
                    "jump successfull",
                    STOP,
                ]).result
            ).toEqual("jump successfull");
        });
    });

    describe("and the code includes JUMPI", () => {
        it("adds two values", () => {
            expect(
                new Interpreter().runCode([
                    PUSH,
                    8,
                    PUSH,
                    1,
                    JUMPI,
                    PUSH,
                    0,
                    JUMP,
                    PUSH,
                    "jump successfull",
                    STOP,
                ]).result
            ).toEqual("jump successfull");
        });
    });

    describe("and the code includes invalid destination error", () => {
        it("throws an error", () => {
            expect(() =>
                new Interpreter().runCode([
                    PUSH,
                    99,
                    JUMP,
                    PUSH,
                    0,
                    JUMP,
                    PUSH,
                    "jump successfull",
                    STOP,
                ])
            ).toThrow("Invalid destination: 99");
        });
    });

    describe("and the code includes invalid PUSH error", () => {
        it("throws an error", () => {
            expect(() => new Interpreter().runCode([PUSH, 0, PUSH])).toThrow(
                "The 'PUSH' instruction cannot be last"
            );
        });
    });

    describe("and the code includes infinte LOOP error", () => {
        it("throws an error", () => {
            expect(() =>
                new Interpreter().runCode([PUSH, 0, JUMP, STOP])
            ).toThrow(
                "Check for an infinite loop. Execution limit of 10000 exceeded"
            );
        });
    });
});
