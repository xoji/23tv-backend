const {
  CreateUser,
  ReadUser,
  UpdateUserAva,
  UpdateUserPassword,
  UpdateUserData,
  UpdateUserPhone,
  CheckPhone,
  ResetPassword,
  Verify,
  ClearTable,
  FindByPhone,
  CreateBalance,
  GetBalance,
  CreateId,
  GetPayment,
  GetTrans,
} = require("./model");
const axios = require("axios");
const { sign, verify } = require("../../../lib/jwt");
const sha1 = require("sha1");
const path = require("path");
const { deleteFile } = require("../../../utils");
const fs = require("fs")

// console.log(sha1('bobur1907'))

function getCode(phone) {
  const cs = JSON.parse(fs.readFileSync("./countries.json").toString())
  let str = ""
  let code
  let formatted = ""

  for (const sym of phone) {
    str += sym
    const value = cs.filter(val => {
      return val.dialCode == str && val.length <= phone.length
    })
    if (value.length) {
      code = value[0]
    }
  }

  if (code) {
    for (let index = 0; index < phone.length; index++) {
      const element = phone[index];
      if (code.separates.includes(index)) {
        formatted += ` ${element}`
      } else {
        formatted += element
      }
    }
    return {
      countryName: code.name,
      country: code.isoCode,
      formatted: `+${formatted}`,
      icon: code.flag,
      local: code.local,
      phone
    }
  } else {
    return null
  }
}

module.exports = {
  GET: async (req, res) => {
    try {
      const data = verify(req.headers.authorization);
      const userData = {
        phoneNumber: data.tel,
        password: data.pw,
      };
      const date = new Date();
      const user = await ReadUser(userData);
      if (!user) throw new Error();
      const balance = await GetBalance(user.user_id);
      const balance_id = await GetPayment(user.user_id);
      const transaction = await GetTrans(user.user_id, date.getFullYear());

      const norm = "0000";
      const id = balance_id.payment_id.toString();
      let active = false;
      if (transaction) {
        const exp = new Date(transaction.exp_date);
        active = date.getTime() < exp.getTime();
      }

      let result;

      if (id.length < norm.length) {
        result = `23TV${norm.slice(0, norm.length - id.length)}${id}`;
      } else {
        result = `23TV${id}`;
      }

      const userResult = {
        userId: user.user_id,
        userName: user.user_username,
        userPath: user.user_path || "users/user-default.png",
        userTel: user.user_tel,
        status: user.user_status,
        age: user.user_age,
        balance: balance.bal,
        balance_id: result,
        active,
        transaction: transaction && active ? transaction : null,
      };
      res.status(200).json({ data: userResult, status: 200, error: null });
    } catch (error) {
      res
        .status(400)
        .json({ error: error.message, token: null, status: 400, data: null });
    }
  },
  POST_LOGIN: async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;
      const number = phoneNumber.includes("+")
        ? phoneNumber.split("+")[1]
        : phoneNumber;
      const data = {
        phoneNumber: `+${number}`,
        password: sha1(password),
      };
      const user = await ReadUser(data);
      if (!user) throw new Error();
      const balance = await GetBalance(user.user_id);
      const balance_id = await GetPayment(user.user_id);

      const norm = "0000";
      const id = balance_id.payment_id.toString();

      let result;

      if (id.length < norm.length) {
        result = `23TV${norm.slice(0, norm.length - id.length)}${id}`;
      } else {
        result = `23TV${id}`;
      }

      const userData = {
        userId: user.user_id,
        userName: user.user_username,
        userPath: user.user_path || "users/user-default.png",
        userTel: user.user_tel,
        status: user.user_status,
        age: user.user_age,
        balance: balance.bal,
        balance_id: result,
      };
      const payload = {
        id: user.user_id,
        name: user.user_username,
        tel: user.user_tel,
        pw: user.user_password,
        balance: balance.bal,
        balance_id: result,
      };

      res.status(200).json({
        accessToken: sign(payload),
        data: userData,
        status: 200,
        error: null,
      });
    } catch (error) {
      res
        .status(400)
        .json({ error: error.message, token: null, status: 400, data: null });
    }
  },
  POST_CREATE: async (req, res) => {
    try {
      const { username, password, phoneNumber, age } = req.body;
      const number = phoneNumber.includes("+")
        ? phoneNumber.split("+")[1]
        : phoneNumber;
      await ClearTable(number);
      const newUser = await CreateUser(
        username,
        sha1(password),
        `+${number}`,
        age
      );
      const balance = await CreateBalance(newUser.user_id);
      const payment_id = await CreateId(newUser.user_id);

      const norm = "0000";
      const id = payment_id.payment_id.toString();

      let result;

      if (id.length < norm.length) {
        result = `23TV${norm.slice(0, norm.length - id.length)}${id}`;
      } else {
        result = `23TV${id}`;
      }
      const payload = {
        id: newUser.user_id,
        name: newUser.user_username,
        tel: newUser.user_tel,
        status: newUser.user_status,
        balance: balance.bal,
        balance_id: result,
      };

      const data = {
        userId: newUser.user_id,
        userName: newUser.user_username,
        userTel: newUser.user_tel,
        age: newUser.user_age,
        balance: balance.bal,
        balance_id: result,
      };
      res.status(200).json({ accessToken: sign(payload), data, status: 200 });
    } catch (error) {
      res
        .status(400)
        .json({ error: error.message, token: null, status: 400, data: null });
    }
  },
  CHECK_PHONE: async (req, res) => {
    try {
      const { phoneNumber, time, country } = req.body;
      const token = req.headers["Accept-String"]
      if (!token || !phoneNumber || !time || !country) {
        return res.status(404).json({ message: "No required data!", error: true });
      }
      const str = sha1(`93063866-7ec1-4fcf-ae5c-370b6edffc47:${time}`);
      if (token != str) {
        return res.status(401).json({ message: "You don't have access!" });
      }
      const number = phoneNumber.includes("+")
        ? phoneNumber.split("+")[1]
        : phoneNumber;
      if (parseInt(number) == NaN || number.search(/[a-z,A-Z]/g) != -1) {
        return res.status(422).json({ message: "Wrong number!", error: true });
      }
      let send = false;
      const checkUser = await CheckPhone(`+${number}`);
      await ClearTable(number);
      if (!checkUser) {
        const code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
        const buffer = fs.readFileSync("./options.json");
        const opts = JSON.parse(buffer.toString());
        if (opts.exp < new Date().getTime()) {
          const loginData = new FormData()
          loginData.append("email", "23tvuz@mail.ru");
          loginData.append("password", "Cv3LsVwx81sC1WcIgXqkCybSbBlrJgxLy4Bvftdr");
          const newRes = await axios.post("https://notify.eskiz.uz/api/auth/login", loginData, { headers: { "Content-Type": "multipart/form-data" } });
          opts.sms_token = newRes.data.data.token;
          opts.time = new Date().getTime();
          opts.exp = new Date().getTime() + 2505600000;
          fs.writeFileSync("./options.json", JSON.stringify(opts, null, "\t"));
        }
        const formatted = getCode(number);
        const form = new FormData();
        form.append("mobile_phone", `${number}`);
        form.append("message", `Код для подтверждения в платформе 23TV: ${code}`);
        if (formatted.local) {
          form.append("country_code", formatted.country);
          form.append("unicode", "1");
        } else {
          form.append("from", "4546");
        }
        const smsres = (formatted.local ? await axios.post("https://notify.eskiz.uz/api/message/sms/send", form, {
          headers: {
            "Authorization": `Bearer ${opts.sms_token}`,
            "Content-Type": "multipart/form-data",
          },
        }) : await axios.post("https://notify.eskiz.uz/api/message/sms/send-global", form, {
          headers: {
            "Authorization": `Bearer ${opts.sms_token}`,
            "Content-Type": "multipart/form-data",
          },
        }));
        if (smsres.status == 200 && smsres.data.status == "success") {
          await Verify(code, number);
          send = true;
        }
      }
      res.status(200).json({
        data: checkUser === undefined,
        error: null,
        status: 200,
        send,
      });
    } catch (error) {
      res.status(400).json({ error: error.message, status: 400, data: null });
    }
  },
  RESET_CHECK: async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      let send = false;
      const number = phoneNumber.includes("+")
        ? phoneNumber.split("+")[1]
        : phoneNumber;
      const checkUser = await CheckPhone(`+${number}`);
      const phone = await FindByPhone(number);
      if (!phone || new Date(phone.createdat) < new Date(phone.createdat).getTime() + 120000) {
        return res.status(400).json({message: "Send sms only after 2 minutes!", error: true});
      }
      await ClearTable(number);
      if (checkUser) {
        const code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
        const buffer = fs.readFileSync("./options.json");
        const opts = JSON.parse(buffer.toString());
        if (opts.exp < new Date().getTime()) {
          const loginData = new FormData();
          loginData.append("email", "23tvuz@mail.ru");
          loginData.append("password", "Cv3LsVwx81sC1WcIgXqkCybSbBlrJgxLy4Bvftdr");
          const newRes = await axios.post("https://notify.eskiz.uz/api/auth/login", loginData, { headers: { "Content-Type": "multipart/form-data" } });
          opts.sms_token = newRes.data.data.token;
          opts.time = new Date().getTime();
          opts.exp = new Date().getTime() + 2505600000;
          fs.writeFileSync("./options.json", JSON.stringify(opts, null, "\t"));
        }
        const formatted = getCode(number);
        const form = new FormData();
        form.append("mobile_phone", `${number}`);
        form.append("message", `Код для подтверждения в платформе 23TV: ${code}`);
        if (formatted.local) {
          form.append("country_code", formatted.country);
          form.append("unicode", "1");
        } else {
          form.append("from", "4546");
        }
        const smsres = (formatted.local ? await axios.post("https://notify.eskiz.uz/api/message/sms/send", form, {
          headers: {
            "Authorization": `Bearer ${opts.sms_token}`,
            "Content-Type": "multipart/form-data",
          },
        }) : await axios.post("https://notify.eskiz.uz/api/message/sms/send-global", form, {
          headers: {
            "Authorization": `Bearer ${opts.sms_token}`,
            "Content-Type": "multipart/form-data",
          },
        }));
        if (smsres.status == 200 || smsres.data.status == "success") {
          await Verify(code, number);
          send = true;
        }
      }
      res.status(200).json({
        data: checkUser != undefined,
        error: null,
        status: 200,
        send,
      });
    } catch (error) {
      res.status(400).json({ error: error.message, status: 400, data: null });
    }
  },
  CHECK_CODE: async (req, res) => {
    try {
      let verify = false;
      const { phoneNumber, code } = req.body;
      const number = phoneNumber.includes("+")
        ? phoneNumber.split("+")[1]
        : phoneNumber;
      if (!phoneNumber || !code) {
        return res.status(401).json({ message: "Нет необходимых данных!" });
      }
      const candidate = await FindByPhone(number);
      if (!candidate) {
        return res
          .status(401)
          .json({ message: "Системная ошибка! Попробуйте позже!" });
      }
      if (code == candidate.code) {
        verify = true;
      }
      res.status(200).json({ message: "Завершено!", verify });
    } catch (e) {
      res.status(502).json({ message: "Что-то пошло не так!", error: e });
    }
  },
  RESET_PASSWORD: async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;
      // console.log(phoneNumber, password)
      const number = phoneNumber.includes("+")
        ? phoneNumber.split("+")[1]
        : phoneNumber;
      const cleared = await ClearTable(number);

      const resetPassword = await ResetPassword(`+${number}`, sha1(password));

      const payload = {
        id: resetPassword.user_id,
        name: resetPassword.user_username,
        tel: resetPassword.user_tel,
        status: resetPassword.user_status,
      };

      const userData = {
        userId: resetPassword.user_id,
        userName: resetPassword.user_username,
        userPath: resetPassword.user_path || "users/user-default.png",
        userTel: resetPassword.user_tel,
        status: resetPassword.user_status,
      };

      // console.log(payload)
      // console.log(userData)

      res.status(200).json({
        accessToken: sign(payload),
        data: userData,
        error: null,
        status: 200,
      });
    } catch (error) {
      res
        .status(400)
        .json({ error: error.message, token: null, status: 400, data: null });
    }
  },
  POST_UPDATE: async (req, res) => {
    try {
      const userVerify = verify(req.headers.authorization);
      const file = req.files.file;
      const data = req.body;

      const userData = {
        phoneNumber: userVerify.tel,
        password: userVerify.pw,
      };

      const user = await ReadUser(userData);
      if (!user) throw new Error();

      if (user.user_path) {
        deleteFile(`/assets/${user.user_path}`);

        const filePath = `users/${new Date().getTime()}${path.extname(
          file.name
        )}`;
        file.mv(`./src/assets/${filePath}`, function (err) {
          if (err) return res.sendStatus(500).send(err);
        });
        const response = await UpdateUserAva({
          userImg: filePath,
          userId: userVerify.id,
        });
        const resData = {
          userId: response.user_id,
          userName: response.user_username,
          userPath: response.user_path || "users/user-default.png",
          userTel: response.user_tel,
          status: response.user_status,
          age: response.user_age,
        };
        res.status(200).json({ data: resData, status: 200, error: null });
      } else {
        const filePath = `users/${new Date().getTime()}${path.extname(
          file.name
        )}`;
        file.mv(`./src/assets/${filePath}`, function (err) {
          if (err) return res.sendStatus(500).send(err);
        });

        const response = await UpdateUserAva({
          userImg: filePath,
          userId: userVerify.id,
        });

        const resData = {
          userId: response.user_id,
          userName: response.user_username,
          userPath: response.user_path || "users/user-default.png",
          userTel: response.user_tel,
          status: response.user_status,
          age: response.user_age,
        };
        res.status(200).json({ data: resData, status: 200, error: null });
      }
    } catch (error) {
      res
        .status(400)
        .json({ error: error.message, token: null, status: 400, data: null });
    }
  },
  POST_UPDATE_DATA: async (req, res) => {
    try {
      const userVerify = verify(req.headers.authorization);
      const data = req.body;

      const userData = {
        phoneNumber: userVerify.tel,
        password: userVerify.pw,
      };
      const user = await ReadUser(userData);
      if (!user) throw new Error();

      const response = await UpdateUserData({
        userId: user.user_id,
        username: data.username,
        userAge: data.userAge,
      });

      const resData = {
        userId: response.user_id,
        userName: response.user_username,
        userPath: response.user_path || "users/user-default.png",
        userTel: response.user_tel,
        status: response.user_status,
        age: response.user_age,
      };

      res.status(200).json({ data: resData, status: 200, error: null });
    } catch (error) {
      res
        .status(400)
        .json({ error: error.message, token: null, status: 400, data: null });
    }
  },
  POST_UPDATE_PASSWORD: async (req, res) => {
    try {
      const userVerify = verify(req.headers.authorization);
      const data = req.body;

      const userData = {
        phoneNumber: userVerify.tel,
        password: userVerify.pw,
      };
      const user = await ReadUser(userData);
      if (!user) throw new Error();

      const response = await UpdateUserPassword({
        newPassword: sha1(data.newPassword),
        oldPassword: sha1(data.oldPassword),
      });
      const resData = {
        userId: response.user_id,
        userName: response.user_username,
        userPath: response.user_path || "users/user-default.png",
        userTel: response.user_tel,
        status: response.user_status,
        age: response.user_age,
      };

      const payload = {
        id: response.user_id,
        name: response.user_username,
        tel: response.user_tel,
        pw: response.user_password,
      };
      res.status(200).json({
        accessToken: sign(payload),
        data: resData,
        status: 200,
        error: null,
      });
    } catch (error) {
      res
        .status(400)
        .json({ error: error.message, token: null, status: 400, data: null });
    }
  },
  POST_UPDATE_PHONE: async (req, res) => {
    try {
      const userVerify = verify(req.headers.authorization);
      const data = req.body;

      const userData = {
        phoneNumber: userVerify.tel,
        password: userVerify.pw,
      };
      const user = await ReadUser(userData);
      if (!user) throw new Error();

      const response = await UpdateUserPhone(data);
      const resData = {
        userId: response.user_id,
        userName: response.user_username,
        userPath: response.user_path || "users/user-default.png",
        userTel: response.user_tel,
        status: response.user_status,
        age: response.user_age,
      };

      const payload = {
        id: response.user_id,
        name: response.user_username,
        tel: response.user_tel,
        pw: response.user_password,
      };
      res.status(200).json({
        accessToken: sign(payload),
        data: resData,
        status: 200,
        error: null,
      });
    } catch (error) {
      res
        .status(400)
        .json({ error: error.message, token: null, status: 400, data: null });
    }
  },
};
