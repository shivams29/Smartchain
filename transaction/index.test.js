const Transaction = require(".");
const Account = require("../account");

describe("Testing transactions", () => {
    let from, to, transaction, createAccountTransaction;
    beforeEach(() => {
        from = new Account();
        to = new Account();
        transaction = Transaction.createTransaction({
            sender: from,
            receiver: "foo",
            value: 20,
        });
        createAccountTransaction = Transaction.createTransaction({
            sender: from,
        });
    });

    describe("validateStandardTransaction()", () => {
        it("validates a standard transaction", () => {
            expect(Transaction.validateStandardTransaction(transaction))
                .resolves;
        });

        it("validates only standard transaction should be sent to this method", () => {
            expect(
                Transaction.validateStandardTransaction(
                    createAccountTransaction
                )
            ).rejects.toMatchObject({
                message: `Incorrect transaction type for transaction id ${createAccountTransaction.id}`,
            });
        });

        it("validates signature does not match for transaction", () => {
            transaction.to = "different-receiver";
            expect(
                Transaction.validateStandardTransaction(transaction)
            ).rejects.toMatchObject({
                message: `Signature does not match with sender address for Transaction id ${transaction.id}`,
            });
        });
    });

    describe("validateCreateAccountTransaction()", () => {
        it("validates a create account transaction", () => {
            expect(
                Transaction.validateCreateAccountTransaction(
                    createAccountTransaction
                )
            ).resolves;
        });

        it("validates only create account transaction should be sent to this function", () => {
            expect(
                Transaction.validateCreateAccountTransaction(transaction)
            ).rejects.toMatchObject({
                message: `Incorrect transaction type for transaction id ${transaction.id}`,
            });
        });

        it("validates account data fields for create account transaction", () => {
            delete createAccountTransaction.data.accountData.balance;

            expect(
                Transaction.validateCreateAccountTransaction(
                    createAccountTransaction
                )
            ).rejects.toMatchObject({
                message: `Required account data fields length does not match with received data in transaction id ${createAccountTransaction.id}`,
            });
        });
    });
});
