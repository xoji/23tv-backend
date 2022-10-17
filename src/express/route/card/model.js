const { fetch, fetchAll } = require("../../../lib/postgres");

const CREATE_CARD = `
INSERT INTO cards(user_id, card_token, phone_number) VALUES ($1, $2, $3) RETURNING *
`;
const SUBMIT_CARD = `
UPDATE cards SET
card_number = $1,
verifyed = true
WHERE card_token = $2
`;
const BY_CARD = `
SELECT * FROM cards WHERE card_id = $1
`;
const BY_USER = `
SELECT * FROM cards WHERE user_id = $1
`;

const GET_BALANCE = `
SELECT * FROM balance WHERE user_id = $1
`;

const CREATE_ORDER = `
INSERT INTO user_pays(amount, status, payed, user_id, createdAt) VALUES ($1, 0, 0, $2, $3) RETURNING *
`;

const UPDATE_BALANCE = `
UPDATE balance SET bal = $1 WHERE user_id = $2
`;

const UPDATE_ORDER = `
UPDATE user_pays SET status = 1, payed = 1 WHERE order_id = $1
`;

const DELETE_CARD = `
DELETE FROM cards WHERE card_token = $1
`;

const CreateCard = (user_id, card_token, phone_number) =>
  fetch(CREATE_CARD, user_id, card_token, phone_number);
const SubmitCard = (card_number, card_token) =>
  fetch(SUBMIT_CARD, card_number, card_token);
const GetById = (card_id) => fetch(BY_CARD, card_id);
const GetByUser = (user_id) => fetchAll(BY_USER, user_id);
const GetBalance = (user_id) => fetch(GET_BALANCE, user_id);
const CreateOrder = (amount, user_id, createdAt) =>
  fetch(CREATE_ORDER, amount, user_id, createdAt);
const UpdateBalance = (bal, user_id) => fetch(UPDATE_BALANCE, bal, user_id);
const UpdateOrder = (order_id) => fetch(UPDATE_ORDER, order_id);
const DeleteCard = (card_token) => fetch(DELETE_CARD, card_token);

module.exports = {
  CreateCard,
  SubmitCard,
  GetById,
  GetByUser,
  GetBalance,
  CreateOrder,
  UpdateBalance,
  UpdateOrder,
  DeleteCard,
};
