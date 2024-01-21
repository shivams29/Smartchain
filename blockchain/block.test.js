const Block = require("./block");
const { keccakHash } = require("../util");
const State = require("../store/state");

describe("Block", () => {
    describe("calculateBlockTargetHash()", () => {
        it("calculates the max hash when the last block difficulty is 1", () => {
            expect(
                Block.calculateBlockTargetHash({
                    lastBlock: { blockHeaders: { difficulty: 1 } },
                })
            ).toEqual("f".repeat(64));
        });

        it("calculates a low hash value when the last block difficulty is high", () => {
            expect(
                Block.calculateBlockTargetHash({
                    lastBlock: { blockHeaders: { difficulty: 500 } },
                }) < "1"
            ).toBe(true);
        });
    });

    describe("mineBlock()", () => {
        let lastBlock, minedBlock;

        //before each will run the entered code before ever it()
        beforeEach(() => {
            lastBlock = Block.genesis();
            minedBlock = Block.mineBlock({
                lastBlock,
                beneficiary: "beneficiary",
                transactionSeries: [],
                stateRoot: "",
            });
        });

        it("mines a block", () => {
            expect(minedBlock).toBeInstanceOf(Block);
        });

        it("mines a block that meets the proof of work requirement", () => {
            const target = Block.calculateBlockTargetHash({ lastBlock });
            const { blockHeaders } = minedBlock;
            const { nonce } = blockHeaders;
            const truncatedBlockHeaders = { ...blockHeaders };
            delete truncatedBlockHeaders.nonce;
            const header = keccakHash(truncatedBlockHeaders);
            const underTargetHash = keccakHash(header + nonce);

            expect(underTargetHash < target).toBe(true);
        });
    });

    describe("adustDifficulty()", () => {
        it("keeps the difficulty above 0", () => {
            expect(
                Block.adjustDifficulty({
                    lastBlock: { blockHeaders: { difficulty: 0 } },
                    timestamp: Date.now(),
                })
            ).toEqual(1);
        });

        it("increases the difficulty for a quickly mined block", () => {
            expect(
                Block.adjustDifficulty({
                    lastBlock: {
                        blockHeaders: { difficulty: 5, timestamp: 1000 },
                    },
                    timestamp: 3000,
                })
            ).toEqual(6);
        });

        it("decreases the difficulty for a slowly mined block", () => {
            expect(
                Block.adjustDifficulty({
                    lastBlock: {
                        blockHeaders: { difficulty: 6, timestamp: 1000 },
                    },
                    timestamp: 20000,
                })
            ).toEqual(5);
        });
    });

    describe("validateBlock()", () => {
        let block, lastBlock, state;

        beforeEach(() => {
            lastBlock = Block.genesis();
            state = new State();
            block = Block.mineBlock({
                lastBlock,
                beneficiary: "beneficiary",
                transactionSeries: [],
            });
        });

        it("resolves when the block is genesis block", () => {
            expect(Block.validateBlock({ block: Block.genesis(), state }))
                .resolves;
        });

        it("resolves if block is valid()", () => {
            expect(Block.validateBlock({ lastBlock, block, state })).resolves;
        });

        it("rejects when the parent hash is inavlid", () => {
            block.blockHeaders.parentHash = "foo";
            expect(
                Block.validateBlock({ lastBlock, block, state })
            ).rejects.toMatchObject({
                message:
                    "The parent hash must be a hash of the last block's header",
            });
        });

        it("rejects when the number is inavlid", () => {
            block.blockHeaders.number = 250;
            expect(
                Block.validateBlock({ lastBlock, block, state })
            ).rejects.toMatchObject({
                message: "The block must increment the number by 1",
            });
        });

        it("rejects when the difficulty is inavlid", () => {
            block.blockHeaders.difficulty = 250;
            expect(
                Block.validateBlock({ lastBlock, block, state })
            ).rejects.toMatchObject({
                message: "The difficulty must only adjust by 1",
            });
        });

        it("rejects when the proof of work requirement is not met", () => {
            const originalCalculateBlockTargetHash =
                Block.calculateBlockTargetHash;

            Block.calculateBlockTargetHash = () => {
                return "0".repeat(64);
            };

            expect(
                Block.validateBlock({ lastBlock, block, state })
            ).rejects.toMatchObject({
                message:
                    "The block does not meet the proof of work requirement",
            });

            Block.calculateBlockTargetHash = originalCalculateBlockTargetHash;
        });
    });
});
