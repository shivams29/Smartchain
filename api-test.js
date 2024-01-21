const request = require("request");

const APP = `${process.env.BASE_URL}:${process.env.ROOT_NODE_PORT}`;

/**
 * Helper function for blockchain URL
 * @returns {Promise}
 */
const getMine = () => {
    return new Promise((resolve, reject) => {
        // Adding a timeout here to let the transaction queue take already broadcasted messages of server account creation.
        setTimeout(() => {
            request.get(`${APP}/blockchain/mine`, (error, res, body) =>
                resolve(JSON.parse(body))
            );
        }, 1000);
    });
};

/**
 * Helper function for creating transactions
 * @param {{to: string; value: number}} transactionDetails
 * @returns {Promise}
 */
const postTransact = ({ to, value }) => {
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
                }),
            },
            (error, res, body) => {
                return resolve(JSON.parse(body));
            }
        );
    });
};

postTransact({})
    .then((data) => {
        console.log("Create Account Transaction", data);
        const toAccountData = data.transaction.data.accountData;
        return postTransact({ to: toAccountData.address, value: 20 });
    })
    .then((data) => {
        console.log("Standard Transaction", data);
        return getMine();
    })
    .then((getMineResponse) =>
        console.log(`Current blockchain `, getMineResponse)
    );
