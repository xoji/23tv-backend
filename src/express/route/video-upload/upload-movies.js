const fs = require("fs");
const geoip = require("geoip-lite");
const ffmpeg = require("fluent-ffmpeg");
const jwt = require("jsonwebtoken");
// console.log(ffmpegInstaller.path, ffmpegInstaller.version);
const path = require("path");

const {
  ReadVideo,
  ReadVideoAll,
  ReadVideoAllSerials,
  ReadVideoOne,
  ReadVideoYear,
  ReadVideoFilter,
  ReadVideoSearchIngine,
  CreateVideo,
  createVideoGenre,
  createVideoCategory,
  createVideoActor,
  createVideoDirector,
  UpdateMovie,
  ReadVideoFilterWithCat,
  DeleteMovie,
  MovieHashtag,
  FilterGen,
  FilterCountry,
  FilterYear,
  ReadVideoOnKeyUp,
  FilterName,
  HideVideo,
  SetPayment,
  GetUser,
  GetTransaction,
} = require("./model");
const { ReadHistoryMovieOne, CreateHistoryMovie } = require("../history/model");
const { ReadTrillerOne } = require("./model_trillers");
const { verify } = require("../../../lib/jwt");
const { deleteFile, geoIp } = require("../../../utils");
const { fetch } = require("../../../lib/postgres");

module.exports = {
  SET_PAID: async (req, res, next) => {
    try {
      const { movie_id, value } = req.body;
      if (!movie_id) {
        return next(res.status(400).json({ message: "No required data!" }));
      }
      await SetPayment(movie_id, value);
      res.status(200).json({ message: "Success!" });
    } catch (e) {
      console.log(e);
      next(res.status(400).json({ message: "Something went wrong!" }));
    }
  },
  HIDE: async (req, res, next) => {
    const { id, value } = req.body;
    if (!id) {
      return next(res.status(400).json({ message: "Нет необходимых данных!" }));
    }
    await HideVideo(id, value);
    res.status(200).json({ message: "Успешно!", error: null });
  },
  GET: async (req, res) => {
    try {
      const videos = await ReadVideo();
      const response = videos.filter((video) => {
        return !video.hidden;
      });
      res.json({ data: response, error: null, status: 200 });
    } catch (error) {
      res.status(404).json({ data: null, error: error.message, status: 404 });
    }
  },
  GET_HASHTAG: async (req, res) => {
    try {
      const hashtag = await MovieHashtag();
      const response = hashtag.filter((video) => {
        return !video.hidden;
      });
      res.json({ data: response, error: null, status: 200 });
    } catch (error) {
      res.status(404).json({ data: null, error: error.message, status: 404 });
    }
  },
  GET_YEAR: async (req, res) => {
    try {
      const videos = await ReadVideoYear();
      const response = videos.filter((video) => {
        return !video.hidden;
      });
      res.json({ data: response, error: null, status: 200 });
    } catch (error) {
      res.status(404).json({ data: null, error: error.message, status: 404 });
    }
  },
  GET_ALL: async (req, res) => {
    try {
      const videos = await ReadVideoAll();
      res.json({ data: videos, error: null, status: 200 });
    } catch (error) {
      res.status(404).json({ data: null, error: error.message, status: 404 });
    }
  },
  GET_ALL_SERIALS: async (req, res) => {
    try {
      const videos = await ReadVideoAllSerials();
      res.json({ data: videos, error: null, status: 200 });
    } catch (error) {
      res.status(404).json({ data: null, error: error.message, status: 404 });
    }
  },
  POST_ON_KEY_UP: async (req, res) => {
    try {
      const { searchValue } = req.body;
      const videos = await ReadVideoOnKeyUp({ searchValue });
      res.json({ data: videos, error: null, status: 200 });
    } catch (error) {
      res.status(404).json({ data: null, error: error.message, status: 404 });
    }
  },
  POST_KEYUP: async (req, res) => {
    try {
      const geo = geoIp(req) || "";
      const language = req.headers.language;
      const token = req.headers.authorization;
      const { searchValue } = req.body;
      const data = {
        searchValue,
      };
      const videos = await ReadVideoSearchIngine(data);
      const dat = videos.filter((video) => {
        return !video.hidden;
      });
      if (!dat) throw new Error();
      let response = [];
      const arr = [];
      if (geo.country !== "UZ") {
        for (let i of dat) {
          if (!i.hidden) {
            if (
              i.category_name === "Uzbek seriallar" ||
              i.category_name === "Uzbek kinolar"
            ) {
              arr.push({
                movie_id: i.movie_id,
                movie_name: language === "uz" ? i.movie_name : i.movie_name_ru,
                movie_thumnail_path: i.movie_thumnail_path,
                movie_premeire_date: i.movie_premeire_date,
                movie_body: language === "uz" ? i.movie_body : i.movie_body_ru,
                movie_rate: i.movie_rate,
                movie_serial_is: i.movie_serial_is,
                movie_length: i.movie_length,
                movie_genre:
                  language === "uz" ? i.movie_genre : i.movie_genre_ru,
                movie_4k_is: i.movie_4k_is,
                movie_age: i.movie_age,
                category_id: i.category_id,
                category_name:
                  language === "uz" ? i.category_name : i.category_name_ru,
              });
            }
          }
        }
      } else {
        for (let i of dat) {
          if (!i.hidden) {
            arr.push({
              movie_id: i.movie_id,
              movie_name: language === "uz" ? i.movie_name : i.movie_name_ru,
              movie_thumnail_path: i.movie_thumnail_path,
              movie_premeire_date: i.movie_premeire_date,
              movie_body: language === "uz" ? i.movie_body : i.movie_body_ru,
              movie_rate: i.movie_rate,
              movie_serial_is: i.movie_serial_is,
              movie_length: i.movie_length,
              movie_genre: language === "uz" ? i.movie_genre : i.movie_genre_ru,
              movie_4k_is: i.movie_4k_is,
              movie_age: i.movie_age,
              category_id: i.category_id,
              category_name:
                language === "uz" ? i.category_name : i.category_name_ru,
            });
          }
        }
      }

      let uniqueList = [];
      let dupList = [];

      Array.prototype.contains = function (item) {
        let filtered_item = this.filter((i) => {
          return i.movie_id === item.movie_id;
        });
        return !!filtered_item.length;
      };

      function contains(list, item) {
        let filtered_item = list.filter((i) => {
          return i.movie_id === item.movie_id;
        });
        return !!filtered_item.length;
      }

      function pushToUniqueList(item) {
        if (!uniqueList.contains(item)) uniqueList.push(item);
      }

      function pushToDuplicateList(item) {
        if (!dupList.contains(item)) dupList.push(item);
      }

      for (let i = 0; i < arr.length; i++) {
        if (uniqueList.contains(arr[i])) {
          pushToDuplicateList(arr[i]);
        } else {
          pushToUniqueList(arr[i]);
        }
      }

      if (dupList.length === 0) {
        res.json({ data: uniqueList, error: null, status: 200 });
      } else {
        res.json({ data: dupList, error: null, status: 200 });
      }
    } catch (error) {
      res.status(404).json({ data: null, error: error.message, status: 404 });
    }
  },
  FILTER_ALL: async (req, res) => {
    try {
      const geo = geoIp(req) || "";
      const { search } = req.query;
      if (geo.country !== "UZ") {
        const data = await FilterName(search, false);
        const response = data.filter((movie) => {
          return !movie.hidden;
        });
        res.status(200).json({ data: response });
      } else {
        const data = await FilterName(search, true);
        const response = data.filter((movie) => {
          return !movie.hidden;
        });
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(404).json({ data: null, error: error.message, status: 404 });
    }
  },
  POST_FILTER: async (req, res) => {
    try {
      const geo = geoIp(req) || "";
      const language = req.headers.language;
      const { genreId, countryId, year } = req.body;
      // console.log(geo)
      let arr = [];
      let response = [];

      for (let i of genreId) {
        const filtered = await FilterGen(i);
        for (let data of filtered) {
          arr.push(data);
        }
      }

      for (let i of countryId) {
        const filtered = await FilterCountry(i);
        for (let data of filtered) {
          arr.push(data);
        }
      }

      for (let i of year) {
        const filtered = await FilterYear(i);
        for (let data of filtered) {
          arr.push(data);
        }
      }

      let uniqueList = [];
      let dupList = [];

      Array.prototype.contains = function (item) {
        let filtered_item = this.filter((i) => {
          return i.movie_id === item.movie_id;
        });
        return !!filtered_item.length;
      };

      function contains(list, item) {
        let filtered_item = list.filter((i) => {
          return i.movie_id === item.movie_id;
        });
        return !!filtered_item.length;
      }

      function pushToUniqueList(item) {
        if (!uniqueList.contains(item)) uniqueList.push(item);
      }

      function pushToDuplicateList(item) {
        if (!dupList.contains(item)) dupList.push(item);
      }

      for (let i = 0; i < arr.length; i++) {
        if (uniqueList.contains(arr[i])) {
          pushToDuplicateList(arr[i]);
        } else {
          pushToUniqueList(arr[i]);
        }
      }

      if (dupList.length === 0) {
        res.json({ data: uniqueList });
      } else {
        res.json({ data: dupList });
      }
    } catch (error) {
      res.status(404).json({ data: null, error: error.message, status: 404 });
    }
  },
  GET_ONE: async (req, res) => {
    try {
      const language = req.headers.language;
      const token = req.headers.authorization;
      const decodedToken = jwt.decode(token);
      const date = new Date();
      const users = decodedToken ? await GetUser(decodedToken.id) : null;
      let transaction = null;
      if (users) {
        transaction = await GetTransaction(users.user_id, date.getFullYear());
      }
      let user_transaction = false;
      if (transaction) {
        const exp = new Date(transaction.exp_date);
        user_transaction = date.getTime() < exp.getTime();
      }
      if (token && token.length > 10) {
        const user = verify(token);
        if (req.query.type === "t") {
          const data = await ReadTrillerOne(req.query.movieId);
          if (data.movie_id !== null) {
            const isHistoryAdded = await ReadHistoryMovieOne({
              userId: user.id,
              movieId: data.movie_id,
            });

            if (!isHistoryAdded) {
              await CreateHistoryMovie({
                userId: user.id,
                movieId: data.movie_id,
              });
            }
          } else {
            const response = {
              movie_id: null,
              movie_name:
                language === "uz" ? data.triller_name : data.triller_name_ru,
              movie_thumnail_path: data.triller_thumnail_path,
              movie_premeire_date: data.triller_premeire_date,
              movie_body:
                language === "uz" ? data.triller_body : data.triller_body_ru,
              movie_rate: data.triller_rate,
              movie_path: null,
              movie_length: null,
              movie_screen: data.triller_screen,
              movie_age: data.triller_age,
              serial_count: null,
              movie_serial_is: null,
              movie_genre:
                language === "uz" ? data.triller_genre : data.triller_genre_ru,
              movie_4k_is: data.triller_4k_is,
              country_id: data.triller_country_id,
              country_name: null,
              triller_id: data.triller_id,
              triller_name:
                language === "uz" ? data.triller_name : data.triller_name_ru,
              triller_path: data.triller_path,
              category_id: null,
              category_name: null,
            };
            res.json({
              data: language ? response : video,
              error: null,
              status: 200,
            });
          }
        } else {
          const isHistoryAdded = await ReadHistoryMovieOne({
            userId: user.id,
            movieId: req.query.movieId,
          });

          if (!isHistoryAdded) {
            await CreateHistoryMovie({
              userId: user.id,
              movieId: req.query.movieId,
            });
          }

          const video = await ReadVideoOne(req.query);

          const response = {
            movie_id: video.movie_id,
            movie_name:
              language === "uz" ? video.movie_name : video.movie_name_ru,
            movie_thumnail_path: video.movie_thumnail_path,
            movie_premeire_date: video.movie_premeire_date,
            movie_body:
              language === "uz" ? video.movie_body : video.movie_body_ru,
            movie_rate: video.movie_rate,
            movie_path: video.paid
              ? user_transaction
                ? video.movie_path
                : null
              : video.movie_path,
            movie_length: video.movie_length,
            movie_screen: video.movie_screen,
            movie_age: video.movie_age,
            serial_count: video.serial_count,
            movie_serial_is: video.movie_serial_is,
            movie_genre:
              language === "uz" ? video.movie_genre : video.movie_genre_ru,
            movie_4k_is: video.movie_4k_is,
            country_id: video.country_id,
            country_name:
              language === "uz" ? video.country_name : video.country_name_ru,
            triller_id: video.triller_id,
            triller_name:
              language === "uz" ? video.triller_name : video.triller_name_ru,
            triller_path: video.triller_path,
            category_id: video.category_id,
            category_name:
              language === "uz" ? video.category_name : video.category_name_ru,
            paid: video.paid,
          };
          if (!language) {
            video.movie_path = video.paid
              ? user_transaction
                ? video.movie_path
                : null
              : video.movie_path;
            video.movie_genre = video.movie_genre_ru;
            video.movie_body = video.movie_body_ru;
            video.movie_name = video.movie_name_ru;
            video.country_name = video.country_name_ru;
            video.triller_name = video.triller_name_ru;
            video.category_name = video.category_name_ru;
          }
          res.json({
            data: language ? response : video,
            error: null,
            status: 200,
          });
        }
      } else {
        const video = await ReadVideoOne(req.query);
        const response = {
          movie_id: video.movie_id,
          movie_name:
            language === "uz" ? video.movie_name : video.movie_name_ru,
          movie_thumnail_path: video.movie_thumnail_path,
          movie_premeire_date: video.movie_premeire_date,
          movie_body:
            language === "uz" ? video.movie_body : video.movie_body_ru,
          movie_rate: video.movie_rate,
          movie_length: video.movie_length,
          movie_screen: video.movie_screen,
          movie_age: video.movie_age,
          movie_serial_is: video.movie_serial_is,
          movie_genre:
            language === "uz" ? video.movie_genre : video.movie_genre_ru,
          movie_4k_is: video.movie_4k_is,
          country_id: video.country_id,
          country_name:
            language === "uz" ? video.country_name : video.country_name_ru,
          triller_id: video.triller_id,
          triller_name:
            language === "uz" ? video.triller_name : video.triller_name_ru,
          triller_path: video.triller_path,
          category_id: video.category_id,
          category_name:
            language === "uz" ? video.category_name : video.category_name_ru,
          paid: video.paid,
        };
        res.json({
          data: language ? response : video,
          error: null,
          status: 200,
        });
      }
    } catch (error) {
      res.status(404).json({ data: null, error: error.message, status: 404 });
    }
  },
  POST: async (req, res) => {
    try {
      const file = req.files.file;
      const {
        thubnail,
        country,
        fileName,
        fileNameRu,
        genres,
        category,
        actor,
        director,
        videoPremeireDate,
        videoBody,
        videoRate,
        videoLength,
        video4K,
        genreName,
        genreNameRu,
        screenShot,
        videoBodyRu,
        serialIs,
        movieAge,
        serialCount,
        hashtag,
        actorNames,
        actorNamesRu,
        directorNames,
        directorNamesRu,
        isNational,
      } = req.body;

      const filePath = `${new Date().getTime()}${
        video4K === "true" ? "_4K" : ""
      }`;

      //console.log({
      //	thubnail, country, fileName, fileNameRu, genres, category, actor, director, videoPremeireDate, videoBody,
      //videoRate, videoLength, video4K, genreName, genreNameRu, screenShot, videoBodyRu, serialIs, movieAge,
      //serialCount, hashtag, actorNames, actorNamesRu, directorNames, directorNamesRu
      //})
      //console.log(filePath)

      await file.mv(
        `/var/www/23tv-backend/src/assets/videos1/${filePath}.mp4`,
        (err) => {
          if (err) {
            fs.appendFile(
              path.join(__dirname, "error-video.log"),
              `${JSON.stringify(err)}\n`,
              (e) => {}
            );
            return res.status(500).json({ message: err });
          }
          ffmpeg(`/var/www/23tv-backend/src/assets/videos1/${filePath}.mp4`)
            .on("progress", function (progress) {
              console.log("Processing: " + progress.percent + "% done");
            })

            .output(
              `/var/www/23tv-backend/src/assets/videos1/${filePath}_360p.mp4`
            )
            .audioCodec("copy")
            .size("720x360")

            .output(
              `/var/www/23tv-backend/src/assets/videos1/${filePath}_720p.mp4`
            )
            .audioCodec("copy")
            .size("1280x720")

            .on("error", function (err, stdout, stderr) {
              console.log("An error movie occurred: " + err);
              if (video4K === "true") {
                deleteFile(`/assets/videos1/${filePath}_4K.mp4`);
                deleteFile(`/assets/videos1/${filePath}.mp4`);
                deleteFile(`/assets/videos1/${filePath}_720p.mp4`);
                deleteFile(`/assets/videos1/${filePath}_360p.mp4`);
              } else if (video4K === "false") {
                deleteFile(`/assets/videos1/${filePath}.mp4`);
                deleteFile(`/assets/videos1/${filePath}_720p.mp4`);
                deleteFile(`/assets/videos1/${filePath}_360p.mp4`);
              } else {
                throw Error;
              }
            })

            .on("end", async function () {
              console.log("Processing movie finished !");
              const data = {
                videoCountry: country,
                videoPremeireDate,
                genreName,
                screenShot: `screen/${screenShot}`,
                genreNameRu,
                videoBody,
                videoBodyRu,
                movieAge: movieAge - 0,
                serialCount: serialCount - 0,
                serialIs: serialIs == "true",
                videoRate: videoRate - 0 > 0 ? videoRate - 0 : 0,
                videoLength,
                video4K: video4K == "true",
                videoPath: filePath,
                videoName: fileName,
                videoNameRu: fileNameRu,
                videoThubnail: `thubnails/${thubnail}`,
                hashtag,
                actorNames,
                actorNamesRu,
                directorNames,
                directorNamesRu,
                is_national: isNational,
              };

              const newVideo = await CreateVideo(data);
              const movieId = newVideo.movie_id;

              for (let i of genres.split(",")) {
                await createVideoGenre(i, movieId);
              }

              for (let i of category.split(",")) {
                await createVideoCategory(i, movieId);
              }

              for (let i of director.split(",")) {
                await createVideoDirector(i, movieId);
              }

              for (let i of actor.split(",")) {
                await createVideoActor(i, movieId);
              }

              if (video4K === "false") {
                deleteFile(`/assets/videos1/${filePath}.mp4`);
              }

              res.json({ data: newVideo, error: null, status: 200 });
            })
            .save(
              `/var/www/23tv-backend/src/assets/videos1/${filePath}_HD.mp4`
            );
        }
      );
    } catch (e) {
      fs.appendFile(
        path.join(__dirname, "error-video.log"),
        `${JSON.stringify(e)}\n`,
        () => {}
      );
    }
  },
  DELETE: async (req, res) => {
    try {
      const data = req.body;
      const deleteMovie = await DeleteMovie(data);

      deleteFile(`./src/assets/${deleteMovie.movie_screen}`);
      deleteFile(`./src/assets/${deleteMovie.movie_thumnail_path}`);

      if (deleteMovie.movie_4k_is === true) {
        deleteFile(`/assets/videos/${deleteMovie.movie_path}.mp4`);
        deleteFile(`/assets/videos/${deleteMovie.movie_path}_360p.mp4`);
        deleteFile(`/assets/videos/${deleteMovie.movie_path}_720p.mp4`);
        deleteFile(`/assets/videos/${deleteMovie.movie_path}_HD.mp4`);
      } else {
        deleteFile(`/assets/videos/${deleteMovie.movie_path}_HD.mp4`);
        deleteFile(`/assets/videos/${deleteMovie.movie_path}_720p.mp4`);
        deleteFile(`/assets/videos/${deleteMovie.movie_path}_360p.mp4`);
      }

      res.json({ data: deleteMovie, error: null, status: 200 });
    } catch (error) {
      res.status(404).json({ data: null, error: error.message, status: "404" });
    }
  },
  UPDATE: async (req, res) => {
    try {
      let dataUpdate;
      let NEW_DATAS;
      const data = req.body;
      let updatedMovie;
      if (data.thubnail !== "undefined" && data.screen !== "undefined") {
        dataUpdate = {
          id: data.id,
          videoCountry: data.country,
          videoPremeireDate: data.videoPremeireDate,
          videoBody: data.videoBody ? data.videoBody : "",
          videoBodyRu: data.videoBodyRu ? data.videoBodyRu : "",
          videoRate: data.videoRate - 0 > 0 ? data.videoRate - 0 : 0,
          video4K: data.video4K === "true",
          videoName: data.fileName,
          videoNameRu: data.fileNameRu,
          videoThubnail: `thubnails/${data.thubnail}`,
          screenShot: `screen/${data.screen}`,
        };
        NEW_DATAS = `UPDATE movies SET movie_thumnail_path = $1, movie_country = $2, movie_name = $3, movie_name_ru = $4, movie_premeire_date = $5, movie_body = $6, movie_body_ru = $7, movie_rate = $8, movie_4k_is = $9, movie_screen = $10 WHERE movie_id = $11 RETURNING *`;
        updatedMovie = await fetch(
          NEW_DATAS,
          dataUpdate.videoThubnail,
          dataUpdate.videoCountry,
          dataUpdate.videoName,
          dataUpdate.videoNameRu,
          dataUpdate.videoPremeireDate,
          dataUpdate.videoBody,
          dataUpdate.videoBodyRu,
          dataUpdate.videoRate,
          dataUpdate.video4K,
          dataUpdate.screenShot,
          dataUpdate.id
        );
        deleteFile(`/src/assets/${data.oldthubnail}`);
        deleteFile(`/src/assets/${data.oldscreen}`);
      } else if (data.thubnail !== "undefined" && data.screen === "undefined") {
        dataUpdate = {
          id: data.id,
          videoCountry: data.country,
          videoPremeireDate: data.videoPremeireDate,
          videoBody: data.videoBody ? data.videoBody : "",
          videoBodyRu: data.videoBodyRu ? data.videoBodyRu : "",
          videoRate: data.videoRate - 0 > 0 ? data.videoRate - 0 : 0,
          video4K: data.video4K === "true",
          videoName: data.fileName,
          videoNameRu: data.fileNameRu,
          videoThubnail: `thubnails/${data.thubnail}`,
        };
        NEW_DATAS = `UPDATE movies SET movie_thumnail_path = $1, movie_country = $2, movie_name = $3, movie_name_ru = $4, movie_premeire_date = $5, movie_body = $6, movie_body_ru = $7, movie_rate = $8, movie_4k_is = $9 WHERE movie_id = $10 RETURNING *`;
        updatedMovie = await fetch(
          NEW_DATAS,
          dataUpdate.videoThubnail,
          dataUpdate.videoCountry,
          dataUpdate.videoName,
          dataUpdate.videoNameRu,
          dataUpdate.videoPremeireDate,
          dataUpdate.videoBody,
          dataUpdate.videoBodyRu,
          dataUpdate.videoRate,
          dataUpdate.video4K,
          dataUpdate.id
        );
        deleteFile(`/src/assets/${data.oldthubnail}`);
      } else if (data.thubnail === "undefined" && data.screen !== "undefined") {
        dataUpdate = {
          id: data.id,
          videoCountry: data.country,
          videoPremeireDate: data.videoPremeireDate,
          videoBody: data.videoBody ? data.videoBody : "",
          videoBodyRu: data.videoBodyRu ? data.videoBodyRu : "",
          videoRate: data.videoRate - 0 > 0 ? data.videoRate - 0 : 0,
          video4K: data.video4K === "true",
          videoName: data.fileName,
          videoNameRu: data.fileNameRu,
          screenShot: `screen/${data.screen}`,
        };
        NEW_DATAS = `UPDATE movies SET movie_country = $1, movie_name = $2, movie_name_ru=$3, movie_premeire_date = $4, movie_body = $5, movie_body_ru = $6, movie_rate = $7, movie_4k_is = $8, movie_screen = $9 WHERE movie_id = $10 RETURNING *`;
        updatedMovie = await fetch(
          NEW_DATAS,
          dataUpdate.videoCountry,
          dataUpdate.videoName,
          dataUpdate.videoNameRu,
          dataUpdate.videoPremeireDate,
          dataUpdate.videoBody,
          dataUpdate.videoBodyRu,
          dataUpdate.videoRate,
          dataUpdate.video4K,
          dataUpdate.screenShot,
          dataUpdate.id
        );
        deleteFile(`/src/assets/${data.oldscreen}`);
      } else if (data.thubnail === "undefined" && data.screen === "undefined") {
        dataUpdate = {
          id: data.id,
          videoCountry: data.country,
          videoPremeireDate: data.videoPremeireDate,
          videoBody: data.videoBody ? data.videoBody : " ",
          videoBodyRu: data.videoBodyRu ? data.videoBodyRu : " ",
          videoRate: data.videoRate - 0 > 0 ? data.videoRate - 0 : 0,
          video4K: data.video4K === "true",
          videoName: data.fileName,
          videoNameRu: data.fileNameRu,
        };
        NEW_DATAS = `UPDATE movies SET movie_country = $1, movie_name = $2, movie_name_ru = $3, movie_premeire_date = $4, movie_body = $5, movie_body_ru = $6, movie_rate = $7, movie_4k_is = $8 WHERE movie_id = $9 RETURNING *`;
        updatedMovie = await fetch(
          NEW_DATAS,
          dataUpdate.videoCountry,
          dataUpdate.videoName,
          dataUpdate.videoNameRu,
          dataUpdate.videoPremeireDate,
          dataUpdate.videoBody,
          dataUpdate.videoBodyRu,
          dataUpdate.videoRate,
          dataUpdate.video4K,
          dataUpdate.id
        );
      }
      // const updatedMovie = await UpdateMovie(NEW_DATAS, dataUpdate)
      res.json({ data: updatedMovie, error: null, status: 200 });
    } catch (error) {
      res.status(404).json({ data: null, error: error, status: "404" });
    }
  },
};
