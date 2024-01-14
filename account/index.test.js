const Account = require(".");

describe("Testing accounts", () => {
    let account, data, signature;

    beforeEach(() => {
        account = new Account();
        data = { blockDetails: "Random data" };
        signature = account.sign(data);
    });

    describe("validateSignature()", () => {
        it("Validates signature generate by account", () => {
            expect(
                Account.verifySignature({
                    publicKey: account.address,
                    data,
                    signature,
                })
            ).toBe(true);
        });

        it("invalidates signature generated by account", () => {
            const secondAccount = new Account();
            expect(
                Account.verifySignature({
                    publicKey: secondAccount.address,
                    data,
                    signature,
                })
            ).toBe(false);
        });
    });
});