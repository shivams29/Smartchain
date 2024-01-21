const uuid = require("uuid").v4;
const Account = require("../account");

const TRANSACTION_MAP = {
    TRANSACT: "TRANSACT",
    CREATE_ACCOUNT: "CREATE_ACCOUNT",
};

class Transaction {
    constructor({ id, from, to, value, data, signature }) {
        this.id = id || uuid();
        this.from = from || "-";
        this.to = to || "-";
        this.value = value || 0;
        this.data = data || "-";
        this.signature = signature || "-";
    }

    /**
     * Static method for creating different types of transactions based on params sent
     * @param {
     *  {
     *      sender: Account Object;
     *      receiver: string;
     *      value: number
     *  }
     * } transactionDetails Transaction details
     * @returns {object} Transaction class object
     */
    static createTransaction({ sender, receiver, value }) {
        if (receiver) {
            // Value exchange transaction
            const transactionData = {
                // Generating uuid explicitly as it will be stored in signature
                id: uuid(),
                from: sender.address,
                to: receiver,
                value: value,
                data: {
                    transactionType: TRANSACTION_MAP.TRANSACT,
                },
            };
            return new Transaction({
                ...transactionData,
                signature: sender.sign(transactionData),
            });
        } else {
            const transactionData = {
                from: sender.address,
                data: {
                    accountData: sender.toJson(),
                    transactionType: TRANSACTION_MAP.CREATE_ACCOUNT,
                },
            };
            return new Transaction(transactionData);
        }
    }

    /**
     * Static method for validating standard transactions
     * @param {object} transaction Transaction object to be validated
     * @returns {Promise} Resolve/Reject for transaction validation
     */
    static validateStandardTransaction(transaction) {
        return new Promise((resolve, reject) => {
            const { id, from, signature } = transaction;
            const transactionData = { ...transaction };

            // Deleting signature here because signature is created using transaction data
            delete transactionData.signature;

            if (transaction.data.transactionType !== TRANSACTION_MAP.TRANSACT) {
                return reject(
                    new Error(
                        `Incorrect transaction type for transaction id ${id}`
                    )
                );
            }

            if (
                Account.verifySignature({
                    publicKey: from,
                    data: transactionData,
                    signature,
                })
            ) {
                return resolve();
            } else {
                return reject(
                    new Error(
                        `Signature does not match with sender address for Transaction id ${id}`
                    )
                );
            }
        });
    }

    /**
     * Static function for validating create account transactions
     * @param {object} transaction Transaction class object
     * @returns {Promise} Resolve/Reject for transaction validation
     */
    static validateCreateAccountTransaction(transaction) {
        return new Promise((resolve, reject) => {
            const { id } = transaction;
            if (
                transaction.data.transactionType !==
                TRANSACTION_MAP.CREATE_ACCOUNT
            ) {
                return reject(
                    new Error(
                        `Incorrect transaction type for transaction id ${id}`
                    )
                );
            }
            const requiredCreateAccountTransactionDataFields = Object.keys(
                new Account().toJson()
            );
            const receivedCreateAccountTransactionDataFields = Object.keys(
                transaction.data.accountData
            );
            if (
                requiredCreateAccountTransactionDataFields.length !==
                receivedCreateAccountTransactionDataFields.length
            ) {
                return reject(
                    new Error(
                        `Required account data fields length does not match with received data in transaction id ${id}`
                    )
                );
            }
            requiredCreateAccountTransactionDataFields.forEach((field) => {
                if (
                    !receivedCreateAccountTransactionDataFields.includes(field)
                ) {
                    return reject(
                        `Required account data field ${field} missing in received data for transaction id ${id}`
                    );
                }
            });
            return resolve();
        });
    }

    /**
     * Function to execute transaction
     * @param {object} transaction Transaction object
     * @param {object} state World state
     */
    static runTransaction(transaction, state) {
        switch (transaction.data.transactionType) {
            case TRANSACTION_MAP.CREATE_ACCOUNT:
                this.runCreateAccountTransaction(transaction, state);
                break;
            case TRANSACTION_MAP.TRANSACT:
                this.runStandardTransaction(transaction, state);
                break;
            default:
                break;
        }
    }

    /**
     * Function to execute create account transaction
     * @param {object} transaction Transaction object
     * @param {object} state World State
     */
    static runCreateAccountTransaction(transaction, state) {
        const { accountData } = transaction.data;
        const { address } = accountData;
        state.putAccount(address, accountData);
    }

    /**
     * Function to execute standard transaction
     * @param {object} transaction Transaction object
     * @param {object} state World State
     */
    static runStandardTransaction(transaction, state) {
        // Get from account address, to account address and value to be transferred
        const { from, to, value } = transaction;

        // Get from and to accounts using address
        const fromAccount = state.getAccount(from);
        const toAccount = state.getAccount(to);

        // Update balance of accounts
        fromAccount.balance -= value;
        toAccount.balance += value;

        // Update state
        state.putAccount(from, fromAccount);
        state.putAccount(to, toAccount);
    }
}
module.exports = Transaction;
