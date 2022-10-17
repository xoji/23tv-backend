const { search } = require("./model");

class Search {
  async byName(req, res, next) {
    try {
      const { value } = req.body;
      if (!value) {
        return next(res.status(400).json({ message: "No required data!" }));
      }
      const movies = await search(`%${value}%`);
      res.status(200).json({ message: "Success!", data: movies });
    } catch (e) {
      console.log(e, ":from search:13");
      next(res.status(400).json({ message: "Something went wrong!", e }));
    }
  }
}

module.exports = new Search();
