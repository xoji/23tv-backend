const { fetch, fetchAll } = require("../../../lib/postgres");

const READ_USER = `
SELECT *
FROM users u
WHERE u.user_tel = $1 AND u.user_password = $2
`;

const CHECK_PHONE = `
SELECT *
FROM users u
WHERE u.user_tel LIKE $1
`;

const CREATE_USER = `
insert into users (user_username, user_password, user_tel, user_age)
values ($1, $2, $3, $4) returning *
`;

const UPDATE_USER_DATA = `
UPDATE users
	SET user_username = $2,
		user_age = $3
	WHERE user_id = $1
RETURNING *
`;

const UPDATE_USER_AVA = `
UPDATE users
	SET user_path = $2
	WHERE user_id = $1
RETURNING *
`;

const UPDATE_USER_PASSWORD = `
UPDATE users
	SET user_password = $2
	WHERE user_password = $1
RETURNING *
`;

const UPDATE_USER_PHONE = `
UPDATE users
	SET user_tel = $2
	WHERE user_tel = $1
RETURNING *
`;

const RESET_PASSWORD = `
UPDATE users
	SET user_password = $2
	WHERE user_tel = $1
RETURNING *
`;
const USER_FIND_ONE = `
SELECT * 
	FROM users
	WHERE user_id = $1
RETURNING *
`;
const Code = `
insert into verify_code_check (code, phone_number)
values ($1, $2) returning *
`;
const Clear = `
DELETE FROM verify_code_check WHERE phone_number = $1 returning *
`;
const Find = `
SELECT * FROM verify_code_check WHERE phone_number = $1 LIMIT 1
`;
const INSERT_BALANCE = `
INSERT INTO balance(user_id) VALUES($1) RETURNING *
`;
const GET_BALANCE = `
SELECT * FROM balance WHERE user_id = $1
`;

const GET_ALL = `
SELECT user_id FROM users
`;

const PAYMENT_ID = `
INSERT INTO user_payment_id(user_id) VALUES($1) RETURNING *
`;

const GET_BALANCE_ID = `
SELECT * FROM user_payment_id WHERE user_id = $1
`;
const GET_TRANS = `
SELECT * FROM inner_transactions WHERE user_id = $1 AND year = $2 ORDER BY timestamp DESC LIMIT 1
`;

const ReadUser = ({ phoneNumber, password }) =>
  fetch(READ_USER, phoneNumber, password);

const CheckPhone = (phoneNumber) => fetch(CHECK_PHONE, `${phoneNumber}%`);

const CreateUser = (username, password, phoneNumber, age) =>
  fetch(CREATE_USER, username, password, phoneNumber, age);

const UpdateUserAva = ({ userId, userImg }) =>
  fetch(UPDATE_USER_AVA, userId, userImg);

const UpdateUserPassword = ({ newPassword, oldPassword }) =>
  fetch(UPDATE_USER_PASSWORD, oldPassword, newPassword);

const UpdateUserPhone = ({ newPhone, oldPhone }) =>
  fetch(UPDATE_USER_PHONE, oldPhone, newPhone);

const UpdateUserData = ({ userId, username, userAge }) =>
  fetch(UPDATE_USER_DATA, userId, username, userAge);

const ResetPassword = (password, phoneNumber) =>
  fetch(RESET_PASSWORD, password, phoneNumber);

const UserFindOne = ({ userId }) => fetch(USER_FIND_ONE, userId);

const Verify = (code, phone_number) => fetch(Code, code, phone_number);

const ClearTable = (phone_number) => fetch(Clear, phone_number);

const FindByPhone = (phone_number) => fetch(Find, phone_number);

const CreateBalance = (user_id) => fetch(INSERT_BALANCE, user_id);

const GetBalance = (user_id) => fetch(GET_BALANCE, user_id);

const GetAll = () => fetchAll(GET_ALL);

const CreateId = (user_id) => fetch(PAYMENT_ID, user_id);

const GetPayment = (user_id) => fetch(GET_BALANCE_ID, user_id);

const GetTrans = (user_id, year) => fetch(GET_TRANS, user_id, year);

module.exports = {
  ReadUser,
  CreateUser,
  UpdateUserAva,
  UpdateUserPassword,
  UpdateUserData,
  UpdateUserPhone,
  CheckPhone,
  ResetPassword,
  UserFindOne,
  Verify,
  ClearTable,
  FindByPhone,
  CreateBalance,
  GetBalance,
  GetAll,
  CreateId,
  GetPayment,
  GetTrans,
};
