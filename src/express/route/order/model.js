const { fetch } = require("../../../lib/postgres");
const CREATE_NEW_ORDER = `
INSERT INTO inner_transactions(user_id, day, month, year, comment, exp_date, amount) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *
`;
const UPDATE_BALANCE = `
UPDATE balance SET bal = $1 WHERE user_id = $2
`;
const GET_BALANCE = `
SELECT * FROM balance WHERE user_id = $1
`;

const CreateNewOrder = (user_id, day, month, year, comment, exp_date, amount) =>
  fetch(CREATE_NEW_ORDER, user_id, day, month, year, comment, exp_date, amount);
const SetBalance = (balance, user_id) =>
  fetch(UPDATE_BALANCE, balance, user_id);
const GetBalance = (user_id) => fetch(GET_BALANCE, user_id);

module.exports = {
  CreateNewOrder,
  SetBalance,
  GetBalance,
};
