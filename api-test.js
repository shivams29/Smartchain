const request = require("request");

const APP = `${process.env.BASE_URL}:${process.env.ROOT_NODE}`;

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

postTransact({ to: "dummy", value: 20 }).then((data) => console.log(data));
