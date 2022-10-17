const { verify } = require("../../../lib/jwt");
const {
  CreateCard,
  SubmitCard,
  GetById,
  GetByUser,
  DeleteCard,
} = require("./model");
const axios = require("axios");
const sha1 = require("sha1");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

class Card {
  async create(req, res, next) {
    try {
      const { user_token, card_number, expire_date } = req.body;
      if (!user_token || !card_number || !expire_date) {
        return next(res.status(400).json({ message: "No required data!" }));
      }
      const isVerify = verify(user_token);
      if (!isVerify) {
        return next(res.status(401).json({ message: "No authorization!" }));
      }
      const decoded = await jwt.decode(user_token);

      const cards = await GetByUser(decoded.id);

      if (cards && cards.length) {
        for (const card of cards) {
          if (card.verifyed) {
            const timestamp = Math.floor(Date.now() / 1000);
            const digest = sha1(`${timestamp}ttc6c96IvAa`);
            await axios.delete(
              `https://api.click.uz/v2/merchant/card_token/19359/${card.card_token}`,
              {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Auth: `${21954}:${digest}:${timestamp}`,
                },
              }
            );
            await DeleteCard(card.card_token);
          } else {
            await DeleteCard(card.card_token);
          }
        }
      }

      const clickRes = await axios.post(
        "https://api.click.uz/v2/merchant/card_token/request",
        {
          service_id: "19359",
          card_number,
          expire_date,
          temporary: 0,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (clickRes.data.error_code != 0) {
        console.log(clickRes.data, ": from card.js:68");
      }
      if (clickRes.status == 200) {
        const decoded = jwt.decode(user_token);
        const created = await CreateCard(
          decoded.id,
          clickRes.data.card_token,
          clickRes.data.phone_number
        );
        if (!created) {
          return next(
            res.status(400).json({
              message:
                "Something went wrong, unable to create, please try again later!",
            })
          );
        }
        return res.status(200).json({
          message: "Success",
          data: {
            card_id: created.card_id,
            user_id: created.user_id,
            card_number: created.card_number,
            phone_number: created.phone_number,
            verifyed: created.verifyed,
          },
        });
      } else {
        return res.status(400).json({
          message:
            "Something went wrong, unable to create, please try again later!",
        });
      }
    } catch (e) {
      return res.status(400).json({ message: "Something went wrong!" });
    }
  }
  async submit(req, res) {
    try {
      const { code, card_id } = req.body;
      if (!code || !card_id) {
        return res.status(400).json({ message: "No required data!" });
      }
      const card = await GetById(card_id);
      const timestamp = Math.floor(Date.now() / 1000);
      const digest = sha1(`${timestamp}ttc6c96IvAa`);
      const click_res = await axios.post(
        "https://api.click.uz/v2/merchant/card_token/verify",
        {
          service_id: 19359,
          card_token: card.card_token,
          sms_code: code,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Auth: `${21954}:${digest}:${timestamp}`,
          },
        }
      );
      if (click_res.data.error_code != 0) {
        console.log(click_res.data, "from: card.js:130");
      }
      if (click_res.data.card_number) {
        const { card_number } = click_res.data;
        await SubmitCard(card_number, card.card_token);
        return res.status(200).json({ message: "Success!" });
      } else {
        return res.status(401).json({ message: "Wrong sms code!" });
      }
    } catch (e) {
      return res
        .status(400)
        .json({ message: "Something went wrong!", error: e });
    }
  }
  async deleteCard(req, res) {
    try {
      const { card_id } = req.body;
      if (!card_id) {
        return res.status(400).json({ message: "No required data!" });
      }
      const card = await GetById(card_id);
      if (!card) {
        return res.status(404).json({ message: "Nothing found!" });
      }
      const timestamp = Math.floor(Date.now() / 1000);
      const digest = sha1(`${timestamp}ttc6c96IvAa`);
      const click = await axios.delete(
        `https://api.click.uz/v2/merchant/card_token/19359/${card.card_token}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Auth: `${21954}:${digest}:${timestamp}`,
          },
        }
      );
      if (click.data.error_code != 0) {
        console.log(click.data, ":from card.js:168");
        return res.status(502).json({
          message: "Failed, try later!",
          error: click.data.error_note,
          error_code: click.data.error_code,
        });
      }
      await DeleteCard(card.card_token);
      res.status(200).json({ message: "Success!" });
    } catch (e) {
      console.log(e, ":from card.js:178");
      return res.status(400).json({ message: "Something went wrong!" });
    }
  }
  async getAll(req, res, next) {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return next(res.status(401).json({ message: "No required data!" }));
      }
      const decoded = jwt.decode(authorization);
      let card = {};
      const cards = await GetByUser(decoded.id);
      for (const cd of cards) {
        if (cd.verifyed) {
          card = cd;
          break;
        }
      }
      res.status(200).json({ message: "Success!", data: card });
    } catch (e) {
      console.log(e, ": from card.js:199");
      return res
        .status(400)
        .json({ message: "Something went wrong!", error: `${e}` });
    }
  }
  async pay(req, res, next) {
    try {
      const { card_id, amount, payment_id } = req.body;
      if (!card_id || !amount || !payment_id) {
        return next(res.status(404).json({ message: "No required data!" }));
      }
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const digest = sha1(`${timestamp}ttc6c96IvAa`).toString();
      const card = await GetById(card_id);
      const click = await axios.post(
        "https://api.click.uz/v2/merchant/card_token/payment",
        {
          service_id: 19359,
          card_token: card.card_token,
          amount,
          transaction_parameter: payment_id,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Auth: `${21954}:${digest}:${timestamp}`,
          },
        }
      );
      if (click.data.error_code != 0) {
        console.log(click.data, "from: card.js:231");
        return res.status(400).json({
          message: "Платеж не проведен по неизвестным причинам!",
          error: click.data.error_note,
        });
      }
      return res.status(200).json({ message: "Success!" });
    } catch (e) {
      console.log(e, ":from card.js:239");
      return res
        .status(400)
        .json({ message: "Something went wrong!", error: `${e}` });
    }
  }
}

module.exports = new Card();
