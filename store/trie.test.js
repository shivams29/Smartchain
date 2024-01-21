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
});
