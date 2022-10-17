const SeasonModel = require("./model");

class Seasons {
  async getSeason(req, res, next) {
    try {
      const movieId = req.query.movieId;

      if (!movieId) {
        return next(res.status(404).json({ message: "MovieId не найдено" }));
      }
      const data = await SeasonModel.SeasonFetch(movieId);

      res.json({ data });
    } catch (e) {
      console.log(e, ": from seasons:15");
      res.status(500).json({
        message: "Системная ошибка! Попробуйте снова!",
        error: `${e}`,
      });
    }
  }
  async getSesaonSeries(req, res, next) {
    try {
      const seasonId = req.query.seasonId;
      if (!seasonId) {
        return next(res.status(404).json({ message: "seasonId не найдено" }));
      }
      const data = await SeasonModel.SerialFetch(seasonId);
      res.json({ data });
    } catch (e) {
      console.log(e, ": from:31");
      res.status(500).json({
        message: "Системная ошибка! Попробуйте снова!",
        error: `${e}`,
      });
    }
  }
  async SetSeasons(req, res, next) {
    try {
      const { movieId, season } = req.body;
      const createdSeason = await SeasonModel.CreateSeason([season, movieId]);
      if (!createdSeason) {
        return next(
          res
            .status(404)
            .json({ message: "Что-то пошло не так", error: createdSeason })
        );
      }
      res.status(200).json({ created: createdSeason });
    } catch (e) {
      console.log(e, ": from seasons:51");
      res.status(500).json({
        message: "Системная ошибка! Попробуйте снова!",
        error: `${e}`,
      });
    }
  }
}
module.exports = new Seasons();
