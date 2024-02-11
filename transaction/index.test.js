const Transaction = require(".");
const Account = require("../account");
const { MINING_REWARD } = require("../config");
const State = require("../store/state");

describe("Testing transactions", () => {
    let from, to, transaction, createAccountTransaction, state, miningRewardTransaction;
    beforeEach(() => {
        state = new State();
        from = new Account();
        to = new Account();
        transaction = Transaction.createTransaction({
            sender: from,
            receiver: to.address,
            value: 20,
        });
        createAccountTransaction = Transaction.createTransaction({
            sender: from,
        });
        miningRewardTransaction = Transaction.createTransaction({
            beneficiary: to.address,
            value: MINING_REWARD,
        });
    });

    describe("validateStandardTransaction()", () => {
        it("invalidates transaction where type is not transact", () => {
            expect(
                Transaction.validateStandardTransaction(createAccountTransaction, state)
            ).rejects.toMatchObject({
                message: `Incorrect transaction type for transaction id ${createAccountTransaction.id}`,
            });
        });

        it("invalidates transactions where signature does not match", () => {
            const extraAccount = new Account();
            state.putAccount(extraAccount.address, extraAccount);
            transaction.to = extraAccount.address;
            expect(Transaction.validateStandardTransaction(transaction)).rejects.toMatchObject({
                message: `Signature does not match with sender address for Transaction id ${transaction.id}`,
            });
        });

        it("invalidates transactions where from account does not exist in state", () => {
            expect(
                Transaction.validateStandardTransaction(transaction, state)
            ).rejects.toMatchObject({
                message: `The specified from account - ${from.address} does not exist.`,
            });
        });

        it("invalidates transactions where to account does not exist in state", () => {
            state.putAccount(from.address, from);
            expect(
                Transaction.validateStandardTransaction(transaction, state)
            ).rejects.toMatchObject({
                message: `The specified to account - ${to.address} does not exist.`,
            });
        });

        it("invalidates transactions where amount is greater than balance", () => {
            state.putAccount(from.address, from);
            state.putAccount(to.address, to);
            transaction = Transaction.createTransaction({
                sender: from,
                receiver: to.address,
                value: 10000,
            });
            expect(
                Transaction.validateStandardTransaction(transaction, state)
            ).rejects.toMatchObject({
                message: `The from account - ${from.address} does not have the required balance of 10000 to perform this transaction.`,
            });
        });

        it("invalidates transactions when gasLimit exceeds the balance", () => {
            state.putAccount(from.address, from);
            state.putAccount(to.address, to);
            transaction = Transaction.createTransaction({
                sender: from,
                receiver: to.address,
                value: 100,
                gasLimit: 9000,
            });
            expect(
                Transaction.validateStandardTransaction(transaction, state)
            ).rejects.toMatchObject({
                message: `The from account - ${
                    from.address
                } does not have the required balance of ${
                    transaction.value + transaction.gasLimit
                } to perform this transaction.`,
            });
        });

        it("invalidates transactions when gasUsed exceeds gasLimit", () => {
            // Required gas limit for this code is 2 because of 2 ADD statements.
            const code = ["PUSH", 1, "PUSH", 2, "ADD", "PUSH", 3, "ADD", "STOP"];
            const codeHash = "test-account-address";
            state.putAccount(from.address, from);
            state.putAccount(codeHash, {
                code,
                codeHash,
            });
            transaction = Transaction.createTransaction({
                sender: from,
                receiver: codeHash,
                value: 0,
                gasLimit: 0,
            });
            expect(
                Transaction.validateStandardTransaction(transaction, state)
            ).rejects.toMatchObject({
                message: `Transaction needs more gas. Provided: ${transaction.gasLimit}. Needs: 2.`,
            });
        });

        it("validates a standard transaction", () => {
            state.putAccount(from.address, from);
            state.putAccount(to.address, to);
            expect(Transaction.validateStandardTransaction(transaction, state)).resolves;
        });
    });

    describe("validateCreateAccountTransaction()", () => {
        it("validates a create account transaction", () => {
            expect(Transaction.validateCreateAccountTransaction(createAccountTransaction)).resolves;
        });

        it("validates only create account transaction should be sent to this function", () => {
            expect(Transaction.validateCreateAccountTransaction(transaction)).rejects.toMatchObject(
                {
                    message: `Incorrect transaction type for transaction id ${transaction.id}`,
                }
            );
        });

        it("validates account data fields for create account transaction", () => {
            delete createAccountTransaction.data.accountData.balance;

            expect(
                Transaction.validateCreateAccountTransaction(createAccountTransaction)
            ).rejects.toMatchObject({
                message: `Required account data fields length does not match with received data in transaction id ${createAccountTransaction.id}`,
            });
        });
    });

    describe("validateMiningRewardTransaction()", () => {
        it("invalidates transaction where type is not mining reward", () => {
            expect(Transaction.validateMiningRewardTransaction(transaction)).rejects.toMatchObject({
                message: `Incorrect transaction type for transaction id ${transaction.id}`,
            });
        });

        it("invalidates transaction where reward is not standard mining reward", () => {
            miningRewardTransaction.value = 100;
            expect(
                Transaction.validateMiningRewardTransaction(miningRewardTransaction)
            ).rejects.toMatchObject({
                message: `The mining reward in transaction id ${miningRewardTransaction.id} is not the standard system mining reward.`,
            });
        });

        it("validates mining reward transaction", () => {
            expect(Transaction.validateMiningRewardTransaction(miningRewardTransaction)).resolves;
        });
    });
});
