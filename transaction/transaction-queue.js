class TransactionQueue {
    /**
     * Here we are using object instead of list because when adding
     * new transactions to list, this will help in preventing multiple additions
     * of same transaction. The same can be done with array however it increases complexity
     * a little bit as objects have this functionality by default.
     */
    constructor() {
        this.transactionMap = {};
    }

    /**
     * Adds transaction to queue
     * @param {object} transaction
     */
    add(transaction) {
        this.transactionMap[transaction.id] = transaction;
    }

    /**
     * Returns list of transactions
     * @returns {Array<object>} transactions
     */
    getTransactionSeries() {
        return Object.values(this.transactionMap);
    }
}

module.exports = TransactionQueue;
