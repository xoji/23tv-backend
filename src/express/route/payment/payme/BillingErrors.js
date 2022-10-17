exports.BillingErrors = {
    TransactionNotFound: function () {
        return {
            code: -31001,
            message: "Транзакция не найденна",
            data: null,
        };
    },
    UnexpectedTransactionState: function () {
        return {
            code: -31008,
            message: {
                ru: "Статус транзакции не позволяет выполнить операцию",
            },
            data: null,
        };
    },
    YesTransaction: function () {
        return {
            code: -31099,
            message: "Kuting",
        };
    },
    IncorrectAmount: function () {
        return {
            code: -31001,
            message: {
                ru: "Неверная сумма заказа",
                uz: "Buyurtma summasi noto`g`ri",
                en: "Incorrect order price",
            },
            data: null,
        };
    },
    UserNotFound: function () {
        return {
            code: -31050,
            message: {
                ru: "Пользователь не найден",
                uz: "Foydalanuvhi topilmadi",
                en: "The user was not found",
            },
            data: null,
        };
    },
    OrderAvailable: function () {
        return {
            code: -31051,
            message: {
                ru: "Не возможно выполнить операцию. Заказ ожидает оплаты или оплачен.",
            },
        };
    },
    OrderNotСanceled: function () {
        return {
            code: -31007,
            message: {
                ru: "Заказ полность выполнен и не подлежит отмене.",
            },
            data: null,
        };
    },
};
