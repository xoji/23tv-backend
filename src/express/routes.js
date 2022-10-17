const express = require("express");
const router = express.Router();

const ADMIN = require("./route/admin/admin");
const USER = require("./route/users/users");
const STREAM = require("./route/stream/stream");
const CATEGORY = require("./route/category/category");
const COUNTRIES = require("./route/country/country");
const GENRES = require("./route/genres/genres");
const THUBNAIL = require("./route/upload-thubnail/thubnail-uploader");
const UPLOAD_MOVIE = require("./route/video-upload/upload-movies");
const UPLOAD_TRILLER = require("./route/video-upload/upload-trillers");
const ADS = require("./route/ads-upload/ads");
const ACTORS = require("./route/actors/actors");
const DIRECTORS = require("./route/directors/directors");
const FAVOURITE_MOVIE = require("./route/favourite-movies/favourite-movies");
const RECOMMENDED = require("./route/recommended/recommended");
const COMMENT = require("./route/comments/comments");
const SERIALS = require("./route/serials/serials");
const HISTORY = require("./route/history/history");
const LIVE = require("./route/live/live");
const CLICK = require("./route/payment/click/click");
const ORDER = require("./route/payment/user_pay/user_pay");
const Seasons = require("./route/seasons/seasons");
const Search = require("./route/search/search");
const Card = require("./route/card/card");
const Order = require("./route/order/order");
const fs = require("fs");
const path = require("path");
const { geoIp } = require("../utils/index");
const { fetch } = require("../lib/postgres");
const { UpdateBalance } = require("./route/payment/click/model");
// const {GetAll, CreateBalance} = require('./route/users/model')
// var ip = "159.69.93.1"
// var geoip = require('geoip-lite')
// var ip = "185.139.137.161"
// var geo = geoip.lookup(ip)

// const ipapi = require('ipapi.co')

// .get("/", async (req, res) => {
//   try {
//     const { movie_id } = req.query;
//     const tables = [
//       "comments",
//       "favourite_movies",
//       "histories",
//       "movie_actors",
//       "movie_category",
//       "movie_directors",
//       "movie_genres",
//       "movie_serials",
//       "recommended_movies",
//       "seasons",
//       "movies",
//     ];
//     for (const table of tables) {
//       await fetch(`DELETE FROM ${table} WHERE movie_id=$1`, movie_id);
//     }
//     res.status(200).json({ message: movie_id });
//   } catch (e) {
//     res.status(400).json({ message: e });
//   }
// })

router
  .post("/", async (req, res) => {
    try {
      const { payments } = req.body;
      const result = [];
      const errors = [];
      if (!payments || !payments.length) {
        return res.status(404).json({ message: "No required data!" });
      }
      for (const payment of payments) {
        const user = await fetch(
          "SELECT * FROM user_payment_id where payment_id=$1",
          payment.id
        );
        if (user) {
          const bal = await fetch(
            "SELECT * FROM balance WHERE user_id=$1",
            user.user_id
          );
          const newBalance = parseInt(bal.bal) + parseInt(payment.amount);
          await UpdateBalance(newBalance, user.user_id);
          result.push({
            currentBalance: newBalance,
            id: user.payment_id,
            prevBalance: bal.bal,
            createdAmount: payment.amount,
          });
        } else {
          errors.push({ id: payment.id, amount: payment.amount });
        }
      }
      res.status(200).json({
        message: "Success!",
        data: { result, errors, successCount: result.length },
      });
    } catch (e) {
      console.error(e, ":from routes:payment");
      res.status(500).json({ message: "Error", error: `${e}` });
    }
  })
  .get("/user-data", USER.GET) // DONE
  .post("/login-user", USER.POST_LOGIN) // DONE
  .post("/create-user", USER.POST_CREATE) // DONE
  .post("/update-user-ava", USER.POST_UPDATE)
  .post("/update-user-password", USER.POST_UPDATE_PASSWORD)
  .post("/update-user-phone", USER.POST_UPDATE_PHONE)
  .post("/update-user-data", USER.POST_UPDATE_DATA)
  .post("/check-phone", USER.CHECK_PHONE)
  .post("/check-code", USER.CHECK_CODE)
  .post("/reset-check", USER.RESET_CHECK)
  .post("/reset-password", USER.RESET_PASSWORD)

  .get("/admin", ADMIN.GET)
  .post("/login-admin", ADMIN.POST_LOGIN)

  .get("/favorite-movie", FAVOURITE_MOVIE.GET) // DONE
  .get("/favorite-movie-one", FAVOURITE_MOVIE.GET_ONE) // DONE
  .post("/add-favourite", FAVOURITE_MOVIE.POST) // DONE
  .post("/delete-favourite", FAVOURITE_MOVIE.DELETE) // DONE

  .get("/history-movie", HISTORY.GET) // DONE

  .get("/live-status", LIVE.GET) // DONE
  .post("/live-status-update", LIVE.UPDATE) // DONE

  .get("/countries", COUNTRIES.GET) // DONE
  .get("/country-one", COUNTRIES.GET_ONE)
  .post("/new-country", COUNTRIES.POST)
  .post("/update-country", COUNTRIES.UPDATE)
  .post("/delete-country", COUNTRIES.DELETE)

  .get("/genres", GENRES.GET) // DONE
  .get("/genre-one", GENRES.GET_ONE)
  .post("/new-genre", GENRES.POST)
  .post("/update-genre", GENRES.UPDATE)
  .post("/delete-genre", GENRES.DELETE)

  .get("/categories", CATEGORY.GET) // ? DONE
  .get("/category-with-movies", CATEGORY.GET_WITH_MOVIE) // DONE
  .get("/category-one", CATEGORY.GET_ONE)
  .get("/similar-movies", CATEGORY.GET_SIMILAR_MOVIES)
  .post("/new-category", CATEGORY.POST)
  .get("/movie-category", CATEGORY.GET_CATEGORY_MOVIE)
  .post("/update-category", CATEGORY.UPDATE)
  .post("/delete-category", CATEGORY.DELETE)

  .get("/actors", ACTORS.GET)
  .get("/movie-actors", ACTORS.GET_BY_ID) // DONE
  .get("/actor-one", ACTORS.GET_ONE)
  .post("/actor-upload", ACTORS.POST)
  .post("/update-actor", ACTORS.UPDATE)
  .post("/delete-actor", ACTORS.DELETE)

  .get("/directors", DIRECTORS.GET)
  .get("/movie-directors", DIRECTORS.GET_BY_ID) // DONE
  .get("/director-one", DIRECTORS.GET_ONE)
  .post("/director-upload", DIRECTORS.POST)
  .post("/update-director", DIRECTORS.UPDATE)
  .post("/delete-director", DIRECTORS.DELETE)

  .get("/ads-all", ADS.GET)
  .get("/ads", ADS.GET_RANDOM_ONE) // DONE
  .get("/ads-one", ADS.GET_ONE)
  .post("/ads-upload", ADS.POST)
  .post("/update-ads", ADS.UPDATE)
  .post("/delete-ads", ADS.DELETE)

  .get("/stream/movie/:filename/:resolution?", STREAM.GET)
  .get("/stream/triller/:filename/:resolution?", STREAM.GET_TRILLER)

  .get("/movies", UPLOAD_MOVIE.GET)
  .get("/movies-hashtag", UPLOAD_MOVIE.GET_HASHTAG)
  .get("/movie-all", UPLOAD_MOVIE.GET_ALL)
  .get("/movie-filter", UPLOAD_MOVIE.FILTER_ALL)
  .get("/movie-all-serials", UPLOAD_MOVIE.GET_ALL_SERIALS)
  .get("/movie-year", UPLOAD_MOVIE.GET_YEAR)
  .get("/movie-one", UPLOAD_MOVIE.GET_ONE) // DONE
  .post("/movie_hide", UPLOAD_MOVIE.HIDE)
  .post("/set-paid", UPLOAD_MOVIE.SET_PAID)

  .post("/filter-movie", UPLOAD_MOVIE.POST_FILTER) // DONE
  .post("/search-movie", UPLOAD_MOVIE.POST_KEYUP) // DONE
  .post("/search-movie-admin", UPLOAD_MOVIE.POST_ON_KEY_UP) // DONE
  .post("/upload", UPLOAD_MOVIE.POST)
  .post("/delete-movie", UPLOAD_MOVIE.DELETE)
  .post("/update-movie", UPLOAD_MOVIE.UPDATE)

  .get("/movie-trillers", UPLOAD_TRILLER.GET)
  .get("/movie-trillers-all", UPLOAD_TRILLER.GET_ALL)
  .get("/special-movies", UPLOAD_TRILLER.GET_SPECIAL)
  .post("/upload-triller", UPLOAD_TRILLER.POST)
  .post("/delete-triller", UPLOAD_TRILLER.DELETE)

  .get("/serials", SERIALS.GET)
  .get("/serial-one", SERIALS.GET_ONE)
  .post("/add-serial", SERIALS.POST)

  .get("/recommended-t", RECOMMENDED.GET_TRILLER)
  .post("/add-recommended-t", RECOMMENDED.POST_TRILLER)
  .post("/delete-triller-t", RECOMMENDED.DELETE_TRILLER)

  .get("/recommended-m", RECOMMENDED.GET_MOVIES)
  .post("/add-recommended-m", RECOMMENDED.POST_MOVIES)
  .post("/delete-triller-m", RECOMMENDED.DELETE_MOVIES)

  .get("/comments", COMMENT.GET)
  .post("/add-comment", COMMENT.POST)

  .post("/thubnail-upload", THUBNAIL.POST_THUBNAIL)
  .post("/screen-upload", THUBNAIL.POST_SCREEN)

  .post("/create-order", ORDER.CREATE_ORDER)
  .post("/search-byName", Search.byName)

  .get("/get-seasons", Seasons.getSeason)
  .get("/get-season_series", Seasons.getSesaonSeries)
  .post("/new-season", Seasons.SetSeasons)
  .post("/new-subscribe/:experience", Order.subscribe)
  .get("/check-country", (req, res) => {
    const geo = geoIp(req) || "";
    if (geo.country == "UZ") {
      res.status(200).json({ local: true });
    } else {
      res.status(200).json({ local: false });
    }
  })

  .post("/add-card", Card.create)
  .post("/submit-card", Card.submit)
  .post("/delete-card", Card.deleteCard)
  .get("/get-cards", Card.getAll)
  .post("/pay-balance", Card.pay)
  .post("/payment/click/prepare", CLICK.clickPrepare)
  .post("/payment/click/complate", CLICK.clickComplete)
  .get("/.well-known/acme-challenge/:id", (req, res) => {
    res.send(
      "Z7gU3iq0d48rgwJH6UTYLHXbD376pwc9LcaLaNd4d1E.-tESnwJZs8rmzLqhKNyBtyPdF7d945-aqaDl6QOQppU"
    );
  });
module.exports = router;
