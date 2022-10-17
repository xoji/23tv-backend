/**
 * Этот метод возврашает ошибку для отправки на Payme. Сообщение ошибок сгенерируется автоматически
 * смотря на код ошибки!
 * @param id ID Транзакции от Payme.
 * @param code Код номера ошибки.
 * @param msg Описание ошибки.
 */

const paymeError = (id, code, msg) => {
    if (code) {
        const message = {
            ru: "",
            uz: "",
            en: ""
        }
        let data = ""
        switch (code) {
            case -31050 || -31099:
                message.en = "Required parameter not found!";
                message.ru = "Необходимый параметр не найден!";
                message.uz = "Kerakli parametr topilmadi!";
                data = "Необходимый параметр не найден!";
                break;
            case -32601:
                message.en = "The requested method was not found.";
                message.ru = "Запрашиваемый метод не найден.";
                message.uz = "Soʻralgan usul topilmadi.";
                data = "Запрашиваемый метод не найден.";
                break;
            case -31001:
                message.en = "Invalid amount.";
                message.ru = "Неверная сумма.";
                message.uz = "Noto'g'ri narx.";
                data = "Неверная сумма.";
                break;
            case -31003:
                message.en = "Transaction not found.";
                message.ru = "Транзакция не найдена.";
                message.uz = "Tranzaksiya topilmadi.";
                data = "Транзакция не найдена.";
                break;
            case -31008:
                message.en = msg ? msg.en : "This operation cannot be performed.";
                message.ru = msg ? msg.ru : "Невозможно выполнить данную операцию.";
                message.uz = msg ? msg.uz : "Ushbu operatsiyani bajarish mumkin emas.";
                data = msg ? msg.ru : "Невозможно выполнить данную операцию.";
        }
        return {
            jsonrpc: "2.0",
            error: {
                code,
                message: message,
                data
            },
            id: id
        }
    } else {
        return {
            jsonrpc: "2.0",
            error: {
                code: -32400,
                message: {
                    ru: "Системная ошибка!",
                    uz: "Tizim xatosi!",
                    en: 'System error!'
                },
                data: 'Внутренняя ошибка сервера Мерчанта!'
            },
            id: id
        }
    }
}

export default paymeError