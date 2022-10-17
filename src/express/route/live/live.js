const { Status, UpdateStatus } = require("./model");

module.exports = {
  GET: async (req, res) => {
    try {
      const response = await Status();
      const data = {
        liveTitle: response.livetitle,
        liveBody: response.livebody,
        status: response.live_status_status,
      };
      res.status(200).json({ data, error: null, status: "200" });
    } catch (e) {
      res.status(404).json({ data: null, error: e.message, status: "404" });
    }
  },

  UPDATE: async (req, res) => {
    try {
      const body = req.body;
      const response = await UpdateStatus(body);
      res.status(200).json({ data: response, error: null, status: "200" });
    } catch (e) {
      res.status(404).json({ data: null, error: e.message, status: "404" });
    }
  },
};
