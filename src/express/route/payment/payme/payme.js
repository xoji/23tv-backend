import { getUser } from "./model";

const paymeError = require("./payme.error");

class PaymeController {
    /**
     * Метод CheckPerformTransaction для обработки запроса от Payme.
     * @param body PaymeReq
     * @private Этот метод не может быть использовано из вне класса PaymeController
     */
    async CheckPerformTransaction(body) {
        try {
            const {params} = body
            const user_id = params.account ? params.account.user_id : null
            if (!user_id) {
                return paymeError(body.id, -31050);
            }
            let id
            if (user_id.toLowerCase().includes("23tv")) {
                id = parseInt(user_id.slice(4, user_id.length));
            } else {
                id = parseInt(user_id);
            }
            const user = await getUser(id);
            if (!user) {
                return {
                    result: {
                        allow: false
                    },
                    ...paymeError(body.id, -31099)
                }
            }
            return {
                jsonrpc: "2.0",
                result: {
                    allow: true,
                    additional: {
                        user_id: user.balance_id,
                        current_balance: parseInt(user.balance.bal) * 100
                    }
                }
            }
        } catch (e) {
            console.error(JSON.stringify(e));
            return {
                result: {
                    allow: false
                },
                ...paymeError(body.id)
            }
        }
    }

    /**
     * Метод CreateTransaction для обработки запросов Payme.
     * Метод проверяет сумму транзакции, заказа в базе данных и его состояние оплаты.
     * @param body PaymeReq
     * @private Этот метод не может быть использовано из вне класса PaymeController
     */
    async CreateTransaction(body) {
        try {
            const time = new Date().getTime();
            const {params} = body;
            if (!params.account) {
                return paymeError(body.id, -31050);
            }
            if (!params.account.user_id) {
                return paymeError(body.id, -31050);
            }
            const order = await Orders.findOne({where: {id: params.account.order_id}});
            if (!order) {
                return paymeError(body.id, -31099);
            }
            if (order.payed) {
                return paymeError(body.id, -31099);
            }
            if (order.amount != Math.round((params.amount ? params.amount : 0) / 100)) {
                return paymeError(body.id, -31001);
            }
            const trans = await Payme_transactions.create({
                trans_id: params.id,
                time: params.time,
                amount: Math.round(params.amount ? params.amount : 0 / 100),
                create_time: `${time}`,
                orderId: order.id
            }, {raw: true});
            return {
                jsonrpc: "2.0",
                result: {
                    create_time: time,
                    transaction: trans.id,
                    state: 1,
                    receivers: null
                }
            }
        } catch (e) {
            console.error(JSON.stringify(e));
            return paymeError(body.id);
        }
    }

    /**
     * Метод CreateTransaction для обработки запросов Payme.
     * Это метод завершает процесс оплаты с проверкой существование заказа в
     * базе данных, правильность сумма заказа, состояние платежа, время создание заказа.
     * @param body PaymeReq
     * @private Этот метод не может быть использовано из вне класса PaymeController
     */
    async PerformTransaction(body) {
        try {
            const time = new Date().getTime();
            const {params} = body;
            if (!params.id) {
                return paymeError(body.id, -31050);
            }
            const trans = await Payme_transactions.findOne({where: {trans_id: params.id}});
            if (!trans) {
                return paymeError(body.id, -31003);
            }
            const order = await Orders.findOne({where: {id: trans.orderId}});
            if (trans.payed) {
                return paymeError(body.id, -31008, {ru: "Платеж уже проведен.", uz: "To'lov amalga oshirib bo'lingan.", en: "The payment has already been made."});
            }
            if (trans.canceled) {
                return paymeError(body.id, -31008, {ru: "Платеж отменен.", uz: "To'lov bekor qilingan.", en: "Payment canceled."});
            }
            if (!order) {
                await trans.update({
                    payed: false,
                    canceled: true,
                    cancel_time: `${time}`
                });
                await trans.save();
                return {
                    jsonrpc: "2.0",
                    result: {
                        transaction: trans.id,
                        perform_time: time,
                        state: -1
                    }
                };
            }
            if (parseInt(trans.create_time + 300000) < time) {
                await trans.update({
                    payed: false,
                    canceled: true,
                    cancel_time: `${time}`
                });
                await trans.save();
                await order?.update({
                    payed: false
                });
                await order?.save();
                return {
                    jsonrpc: "2.0",
                    result: {
                        transaction: trans.id,
                        perform_time: time,
                        state: -1
                    }
                };
            }
            await trans.update({
                payed: true,
                perform_time: `${time}`
            });
            await trans.save();
            await order.update({
                payed: true
            });
            await InnerTransactions.create({
                transaction_id: trans.trans_id,
                payment_system: "Payme",
                amount: trans.amount,
                orderId: order.id,
                companyId: order.companyId
            })
            return {
                jsonrpc: "2.0",
                result: {
                    transaction: trans.id,
                    perform_time: time,
                    state: 2
                }
            }
        } catch (e) {
            console.error(JSON.stringify(e));
            return paymeError(body.id);
        }
    }

    /**
     * Метод CancelTransaction для обработки запросов Payme.
     * @param body PaymeReq
     * @private Этот метод не может быть использовано из вне класса PaymeController
     */
    async CancelTransaction(body) {
        try {
            const { params } = body;
            const time = new Date().getTime();
            const trans = await Payme_transactions.findOne({where: {trans_id: params.id}});
            let state
            if (!trans) {
                return paymeError(body.id);
            }
            if (trans.canceled) {
                return paymeError(body.id);
            }
            if (trans.payed) {
                state = -2;
                await trans.update({
                    canceled: true,
                    cancel_time: `${time}`
                });
                await trans.save();
            } else {
                state = -1;
                await trans.update({
                    cancel_time: `${time}`,
                    canceled: true
                });
                await trans.save();
            }
            return {
                jsonrpc: "2.0",
                result: {
                    transaction: trans.id,
                    cancel_time: time,
                    state
                }
            }
        } catch (e) {
            console.error(JSON.stringify(e));
            return paymeError(body.id);
        }
    }

    /**
     * Метод CheckTransaction для обработки запросов Payme.
     * @param body PaymeReq
     * @private Этот метод не может быть использовано из вне класса PaymeController.
     */
    async CheckTransaction(body) {
        try {
            const {params} = body;
            const trans = await Payme_transactions.findOne({where: {trans_id: params.id}});
            if (!trans) {
                return paymeError(body.id, -31003);
            }
            return {
                jsonrpc: "2.0",
                result: {
                    create_time: trans.create_time ? parseInt(trans.create_time) : 0,
                    perform_time: trans.perform_time ? parseInt(trans.perform_time) : 0,
                    cancel_time: trans.cancel_time ? parseInt(trans.cancel_time) : 0,
                    transaction: trans.id,
                    state: (trans.payed && !trans.canceled) ?
                        2 : (!trans.payed && !trans.canceled) ?
                        1 : (!trans.payed && trans.canceled) ?
                        -1 : -2,
                    reason: null
                }
            }
        } catch (e) {
            console.error(JSON.stringify(e));
            return paymeError(body.id);
        }
    }

    /**
     * Метод GetStatement для обработки запросов Payme.
     * @param body PaymeReq
     * @private Этот метод не может быть использовано из вне класса PaymeController.
     */
    async GetStatement(body) {
        try {
            const {params} = body;
            const start = new Date(params.from ? params.from : new Date().getTime());
            const end = new Date(params.to ? params.to : new Date().getTime());
            const result = [];
            const transactions = await Payme_transactions.findAll({
                where: {createdAt: {[Op.gt]: start, [Op.lt]: end}},
                raw: true,
                order: ["createdAt", "ASC"]
            });
            for (const trans of transactions) {
                const order = await Orders.findOne({where: {id: trans.orderId}, raw: true});
                result.push({
                    id: trans.trans_id,
                    time: trans.time,
                    amount: trans.amount,
                    account: {
                        order_id: order.id
                    },
                    create_time: trans.create_time ? parseInt(trans.create_time) : 0,
                    perform_time: trans.perform_time ? parseInt(trans.perform_time) : 0,
                    cancel_time: trans.cancel_time ? parseInt(trans.cancel_time) : 0,
                    transaction: trans.id,
                    state: (trans.payed && !trans.canceled) ?
                        2 : (!trans.payed && !trans.canceled) ?
                        1 : (!trans.payed && trans.canceled) ?
                        -1 : -2,
                    reason: null,
                    receivers: null
                });
            }
            return {
                jsonrpc: "2.0",
                result: {
                    transactions: result
                }
            }
        } catch (e) {
            console.error(JSON.stringify(e));
            return paymeError(body.id);
        }
    }

    /**
     * Интеграция с системой Payme
     * @param req :Express Request
     * @param res :Express Response
     */
    async merchant(req, res) {
        try {
            const {method, id} = req.body
            let result
            switch (method) {
                case "CheckPerformTransaction":
                    result = await this.CheckPerformTransaction(req.body);
                    break;
                case "CreateTransaction":
                    result = await this.CreateTransaction(req.body);
                    break;
                case "PerformTransaction":
                    result = await this.PerformTransaction(req.body);
                    break;
                case "CancelTransaction":
                    result = await this.CancelTransaction(req.body);
                    break;
                case "CheckTransaction":
                    result = await this.CheckTransaction(req.body);
                    break;
                case "GetStatement":
                    result = await this.GetStatement(req.body);
                    break;
                default:
                    result = paymeError(id, -32601);
                    break;
            }
            res.status(200).json(result);
        } catch (e) {
            console.error(JSON.stringify(e));
            const err = paymeError(req.body.id);
            res.status(200).json(err);
        }
    }
}

export default new PaymeController();