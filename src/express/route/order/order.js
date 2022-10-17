const { CreateNewOrder, GetBalance, SetBalance } = require("./model");

class Order {
  async subscribe(req, res, next) {
    try {
      const { experience } = req.params;
      const { amount } = req.query;
      const { userId, comment } = req.body;
      if (!userId || !experience || !amount) {
        return next(res.status(400).json({ message: "No required data!" }));
      }
      const date = new Date();
      const exp = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + parseInt(experience) + 3
      );
      const balance = await GetBalance(userId);
      if (parseInt(balance.bal) < parseInt(amount)) {
        return next(
          res
            .status(400)
            .json({ message: "There are not enough funds on your balance!" })
        );
      }
      const order = await CreateNewOrder(
        userId,
        `${date.getDate()}`,
        `${date.getMonth()}`,
        `${date.getFullYear()}`,
        comment,
        `${exp}`,
        amount
      );
      if (!order) {
        next(res.status(400).json({ message: "Unhandled error!" }));
      }
      const newBalance = parseInt(balance.bal) - parseInt(amount);
      await SetBalance(newBalance, userId);
      res.status(200).json({ message: "Success!", order });
    } catch (e) {
      next(
        res.status(400).json({ message: "Something went wrong!", error: e })
      );
    }
  }
}

module.exports = new Order();
