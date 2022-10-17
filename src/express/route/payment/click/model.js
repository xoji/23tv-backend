const { fetch, fetchAll } = require("../../../../lib/postgres");

const GET_BY_ID_ORDER = `
    SELECT * FROM user_pays
    WHERE order_id = $1
`;
const DELETE_BY_ORDER = `
    DELETE FROM user_pays WHERE order_id = $1
`;
const GET_BY_ID_TRANSACTION = `
    SELECT * FROM click_transactions
    WHERE click_transaction_id = $1
`;
const UPDATE_ONE = `
    UPDATE click_transactions
    SET state = $2,
        status = $3
    WHERE click_transaction_id = $1
    RETURNING *
`;
const CREATE_TRANSACTION = `insert into
click_transactions (
    order_id, 
    amount, 
    merchant_prepare_id, 
    click_transaction_id,
    user_id
    )
    values ($1, $2, $3, $4, $5) RETURNING *
`;

const CREATE_ORDER = `
INSERT INTO user_pays(amount, createdAt, user_id) VALUES ($1, $2, $3) RETURNING *
`;

const GET_BY_PAY_ID = `
SELECT * FROM user_payment_id WHERE payment_id = $1
`;

const UPDATE_ORDER = `
UPDATE user_pays SET status = 1, payed = 1 WHERE order_id = $1
`;

const GET_BALANCE = `
SELECT * FROM balance WHERE user_id = $1
`;

const UPDATE_BALANCE = `
UPDATE balance SET bal = $1 WHERE user_id = $2
`;

const getByIdOrder = (order_id) => fetch(GET_BY_ID_ORDER, order_id);
const getByIdTransaction = (click_transaction_id) =>
  fetch(GET_BY_ID_TRANSACTION, click_transaction_id);
const createTransaction = ({
  order_id,
  amount,
  merchant_prepare_id,
  click_transaction_id,
  user_id,
}) =>
  fetch(
    CREATE_TRANSACTION,
    order_id,
    amount,
    merchant_prepare_id,
    click_transaction_id,
    user_id
  );
const updateOne = ({ click_transaction_id, state, status }) =>
  fetch(UPDATE_ONE, click_transaction_id, state, status);
const deleteByOrder = (order_id) => fetch(DELETE_BY_ORDER, order_id);
const CreateOrder = (amount, createdAt, user_id) =>
  fetch(CREATE_ORDER, amount, createdAt, user_id);
const GetByPayId = (pay_id) => fetch(GET_BY_PAY_ID, pay_id);
const UpdateOrder = (order_id) => fetch(UPDATE_ORDER, order_id);
const GetBalance = (user_id) => fetch(GET_BALANCE, user_id);
const UpdateBalance = (bal, user_id) => fetch(UPDATE_BALANCE, bal, user_id);
module.exports = {
  getByIdTransaction,
  updateOne,
  getByIdOrder,
  createTransaction,
  deleteByOrder,
  CreateOrder,
  GetByPayId,
  UpdateOrder,
  GetBalance,
  UpdateBalance,
};
