const { keccakHash } = require("../util");
const Trie = require("./trie");

describe("testing tire data structure", () => {
    let trie;

    beforeEach(() => {
        trie = new Trie();
    });

    it("should have a root hash", () => {
        expect(trie.rootHash).not.toBe(undefined);
    });

    describe("put()", () => {
        it("should put value in trie", () => {
            trie.put("testVal", 1234);
            expect(trie.get("testVal")).toEqual(1234);
        });

        it("should always generate new root hash", () => {
            const oldRootHash = trie.rootHash;
            trie.put("testVal", 1234);
            expect(oldRootHash).not.toEqual(trie.rootHash);
        });
    });

    describe("get()", () => {
        it("should retrieve new copy of value", () => {
            const value = {
                testVal: 1,
            };
            trie.put("testVal", value);
            const retrievedValue = trie.get("testVal");
            value.testVal = 2;
            expect(retrievedValue).not.toEqual(value);
        });
    });

    describe("buildTrie()", () => {
        it("should build a trie for items", () => {
            let items = [
                {
                    testVal: 1,
                },
                {
                    testVal: 2,
                },
                {
                    testVal: 3,
                },
            ];
            let newTrie = Trie.buildTrie(items);
            expect(newTrie.get(keccakHash(items[0]))).toMatchObject(items[0]);
            expect(newTrie.get(keccakHash(items[1]))).toMatchObject(items[1]);
            expect(newTrie.get(keccakHash(items[2]))).toMatchObject(items[2]);
        });
    });
});
