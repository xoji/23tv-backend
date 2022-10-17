const { fetch } = require('../../../../lib/postgres')

const CREATE_TRANSACTION = `
    INSERT INTO payme_transactions(amount, trans_id, time, create_time, order_id) VALUES($1, $2, $3, $4, $5) RETURNING *
`

const CREATE_PAYMENT = `
    INSERT INTO user_pays(amount, user_id) VALUES($1, $2) RETURNING *
`

const GET_TRANSACTION = `
    SELECT * FROM payme_transactions WHERE trans_id=$1 limit 1
`

const GET_ORDER = `
    SELECT * FROM user_pays WHERE order_id=$1 limit 1
`

const SET_TRANSACTION = `
    UPDATE payme_transactions SET payed=$1, canceled=$2, perform_time=$3, cancel_time=$4, reason=$5, updatedat=$6 RETURNING *
`

const SET_ORDER = `
    UPDATE user_pays WHERE status=$1, payed=$2 RETURNING *
`

const GET_BALANCE_ID = `
    SELECT * FROM user_payment_id WHERE payment_id=$1 limit 1
`

const GET_USER = `
    SELECT * FROM user_id=$1 limit 1
`

const GET_BALANCE = `
    SELECT * FROM balance WHERE user_id=$1 limit 1
`

const createTrans = async (amount, trans_id, time, create_time, order_id) => await fetch(CREATE_TRANSACTION, amount, trans_id, time, create_time, order_id);
const createPay = async (amount, user_id) => await fetch(CREATE_PAYMENT, amount, user_id);
const getTrans = async (trans_id) => await fetch(GET_TRANSACTION, trans_id);
const getOrder = async (order_id) => await fetch(GET_ORDER, order_id);
const setTrans = async (payed, canceled, perform_time, cancel_time, reason, updatedat) => await fetch(SET_TRANSACTION, payed, canceled, perform_time, cancel_time, reason, updatedat);
const setOrder = async (status, payed) => await fetch(SET_ORDER, status, payed);
const getUser = async (id) => {
    const pay = await fetch(GET_BALANCE_ID, id);
    if (pay) {
        const norm = "0000";
        const pay_id = pay.payment_id.toString();

        let result;

        if (pay_id.length < norm.length) {
            result = `23TV${norm.slice(0, norm.length - pay_id.length)}${pay_id}`;
        } else {
            result = `23TV${pay_id}`;
        }
        pay.user = await fetch(GET_USER, pay.user_id);
        pay.balance = await fetch(GET_BALANCE, pay.user.user_id);
        pay.balance_id = result
        return pay;
    } else {
        return null;
    }
}


module.exports = {
    createTrans,
    createPay,
    getTrans,
    getOrder,
    setTrans,
    setOrder,
    getUser
}