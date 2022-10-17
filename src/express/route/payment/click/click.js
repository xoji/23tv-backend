const {
  createTransaction,
  updateOne,
  getByIdOrder,
  getByIdTransaction,
  deleteByOrder,
  CreateOrder,
  GetByPayId,
  UpdateOrder,
  GetBalance,
  UpdateBalance,
} = require("./model");
const crypto = require("crypto");
const fs = require("fs");

// @desc      Endpoint for Click
// @route     POST /api/v1/transaction/click/prepare
// @access    Public
module.exports = {
  clickPrepare: async (req, res, next) => {
    try {
      const {
        click_trans_id,
        service_id,
        merchant_trans_id,
        amount,
        action,
        sign_time,
        error,
        sign_string,
      } = req.body;

      let user_pay_id = "";

      if (
        merchant_trans_id.search(/[A-Z]/) >= 0 ||
        merchant_trans_id.search(/[a-z]/) >= 0
      ) {
        user_pay_id = parseInt(merchant_trans_id.slice(4)).toString();
      } else {
        user_pay_id = merchant_trans_id;
      }
      const user = await GetByPayId(user_pay_id);
      const user_pay = await CreateOrder(amount, `${new Date()}`, user.user_id);
      const signature = `${click_trans_id}${service_id}ttc6c96IvAa${merchant_trans_id}${amount}${action}${sign_time}`;
      const check_signat =
        crypto.createHash("md5").update(signature).digest("hex") == sign_string;
      if (!check_signat) {
        return next(
          res.status(200).json({
            click_trans_id,
            merchant_trans_id,
            error: "-1",
            error_note: "SIGN CHECK FAILED!",
          })
        );
      }
      if (user_pay && service_id == 19359 && error == 0) {
        const newTransaction = await createTransaction({
          order_id: parseInt(user_pay.order_id),
          merchant_prepare_id: user_pay.order_id.toString(),
          click_transaction_id: click_trans_id,
          amount: amount,
          user_id: user_pay.user_id,
        });
        res.status(200).json({
          click_trans_id,
          merchant_trans_id,
          merchant_prepare_id: newTransaction.merchant_prepare_id,
          error: 0,
          error_note: "Success",
        });
      } else {
        res.status(200).json({
          click_trans_id,
          merchant_trans_id,
          error: "-5",
          error_note: "User doesn't exist",
        });
      }
    } catch (e) {
      await fs.appendFile("./error.txt", `${JSON.stringify(e)}\n`, (e) => {});
      next(
        res.status(200).json({
          error: -1,
          error_note: "Неизвестная ошибка!",
          error_object: e,
        })
      );
    }
  },
  // @desc      Endpoint for Click
  // @route     POST /api/v1/transaction/click/complete
  // @access    Public
  clickComplete: async (req, res, next) => {
    try {
      const {
        click_trans_id,
        service_id,
        click_paydoc_id,
        merchant_trans_id,
        merchant_prepare_id,
        amount,
        action,
        error,
        error_note,
        sign_time,
        sign_string,
      } = req.body;
      const transaction = await getByIdTransaction(click_trans_id);
      const balance = await GetBalance(transaction.user_id);
      const newBalance = parseInt(balance.bal) + parseInt(amount);
      const signature = `${click_trans_id}${service_id}ttc6c96IvAa${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`;
      const check_signat =
        crypto.createHash("md5").update(signature).digest("hex") == sign_string;
      if (!check_signat) {
        return next(
          res.status(200).json({
            click_trans_id,
            merchant_trans_id,
            error: "-1",
            error_note: "SIGN CHECK FAILED!",
          })
        );
      }
      if (
        click_trans_id == transaction.click_transaction_id &&
        error == 0 &&
        merchant_prepare_id == transaction.merchant_prepare_id
      ) {
        await UpdateOrder(merchant_prepare_id);
        await UpdateBalance(newBalance, transaction.user_id);
        res.status(200).json({
          click_trans_id,
          merchant_trans_id,
          merchant_confirm_id: null,
          error: 0,
          error_note: "Success",
        });
      } else {
        res.status(200).json({
          click_trans_id,
          merchant_trans_id,
          error: "-5",
          error_note: "User does not exist",
        });
      }
    } catch (e) {
      return res
        .status(200)
        .json({ error: -1, error_note: "Неизвестная ошибка!" });
    }
  },
};
