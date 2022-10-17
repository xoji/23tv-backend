const {fetch, fetchAll} = require('../../../../lib/postgres')

const CREATE_NEW_ORDER = `
    insert into user_pays(
        user_id,
        amount
    )
    values ($1, $2) RETURNING *
`
const DELETE_ORDER = `
    DELETE FROM user_pays WHERE user_id = $1 RETURNING *
`

const createNewOrder =({user_id, amount}) =>fetch(CREATE_NEW_ORDER, user_id, amount);
const deleteOrder = ({user_id}) => fetch(DELETE_ORDER, user_id)

module.exports ={
    createNewOrder,
    deleteOrder
}
