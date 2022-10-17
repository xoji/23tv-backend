const { createNewOrder, deleteOrder } = require("./model");

module.exports = {
  CREATE_ORDER: async (req, res) => {
    try {
      const { user_id, amount } = req.body;

      await deleteOrder(user_id);
      const user_pays = await createNewOrder({ user_id, amount });
      res.status(200).json({ data: user_pays });
    } catch (e) {
      console.log(e, ":from user_pays:12");
    }
  },
};
