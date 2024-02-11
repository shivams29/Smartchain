const request = require("request");
const { OPCODE_MAP } = require("./interpreter");

const APP = `${process.env.BASE_URL}:${process.env.ROOT_NODE_PORT}`;

/**
 * Helper function for blockchain URL
 * @returns {Promise}
 */
const getMine = () => {
    return new Promise((resolve, reject) => {
        // Adding a timeout here to let the transaction queue take already broadcasted messages of server account creation.
        setTimeout(() => {
            request.get(`${APP}/blockchain/mine`, (error, res, body) => resolve(JSON.parse(body)));
        }, 1000);
    });
};

/**
 * Helper function for retrieving balance of account
 * @param {string} address
 * @returns {object} JSON parsed body
 */
const getBalance = (address = "") => {
    return new Promise((resolve, reject) => {
        request(
            `${APP}/account/balance` + (address ? `/?address=${address}` : ""),
            (err, res, body) => resolve(JSON.parse(body))
        );
    });
};

/**
 * Helper function for creating transactions
 * @param {{to: string; value: number}} transactionDetails
 * @returns {Promise}
 */
const postTransact = ({ to, value, code, gasLimit }) => {
    return new Promise((resolve, reject) => {
        request.post(
            `${APP}/account/transact`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to,
                    value,
                    code,
                    gasLimit,
                }),
            },
            (error, res, body) => {
                return resolve(JSON.parse(body));
            }
        );
    });
};

let toAccountData;
let smartContractAccountData;

postTransact({})
    .then((data) => {
        console.log("postTransact1(Create new account)", data);
        toAccountData = data.transaction.data.accountData;
        return getMine();
    })
    .then((data) => {
        console.log("getMine1(Register application account and new account)", data);
        return postTransact({ to: toAccountData.address, value: 20 });
    })
    .then((data) => {
        console.log("postTransact2(Transfer 20 from application account to new account)", data);
        const { PUSH, STOP, ADD, STORE, LOAD } = OPCODE_MAP;
        return postTransact({
            code: [PUSH, 1, PUSH, 2, ADD, PUSH, "output", STORE, PUSH, "output", LOAD, STOP],
        });
    })
    .then((data) => {
        smartContractAccountData = data;
        console.log("postTransact3(Create smart contract account)", data);
        return getMine();
    })
    .then((data) => {
        console.log("getMine3(Register new smart contract account)", data);
        return postTransact({
            to: smartContractAccountData.transaction.data.accountData.codeHash,
            value: 0,
            gasLimit: 100,
        });
    })
    .then((data) => {
        console.log("postTransact4(Executing smart contract code)", data);
        return getMine();
    })
    .then((getMineResponse) => {
        console.log("getMine3(Register all new transactions)", getMineResponse);
        return getBalance();
    })
    .then((balance) => {
        console.log("getBalance1(Application account balance)", balance);
        return getBalance(toAccountData.address);
    })
    .then((balance) => {
        console.log("getBalance2(New Account Balance)", balance);
        return getBalance(smartContractAccountData.transaction.data.accountData.codeHash);
    })
    .then((balance) => {
        console.log("getBalance3(Smart Contract Account Balance)", balance);
    });
