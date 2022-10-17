const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const { ReadSerial, ReadSerialOne, createSerial } = require("./model");
const { ReadVideoOne } = require("../video-upload/model");
const { deleteFile } = require("../../../utils");

module.exports = {
  GET: async (req, res) => {
    try {
      const data = req.query;
      const language = req.headers.language || "uz";
      const videos = await ReadSerial(data);
      const response = {
        serial_data: {},
        serials: [],
      };
      const resData = await ReadVideoOne(data);

      response.serial_data = {
        movie_id: resData.movie_id,
        movie_name:
          language === "uz" ? resData.movie_name : resData.movie_name_ru,
        movie_premeire_date: resData.movie_premeire_date,
        movie_body:
          language === "uz" ? resData.movie_body : resData.movie_body_ru,
        movie_rate: resData.movie_rate,
        movie_genre:
          language === "uz" ? resData.movie_genre : resData.movie_genre_ru,
        movie_thumnail_path: resData.movie_thumnail_path,
        movie_screen: resData.movie_screen,
        serial_count: resData.serial_count,
        movie_age: resData.movie_age,
        category_id: resData.category_id,
        category_name:
          language === "uz" ? resData.category_name : resData.category_name_ru,
        country_id: resData.country_id,
        country_name:
          language === "uz" ? resData.country_name : resData.country_name_ru,
      };

      response.serials.push({
        movie_seria: language === "uz" ? "1 seria" : "1 серия",
        movie_serial_id: resData.movie_id,
        movie_name:
          language === "uz" ? resData.movie_name : resData.movie_name_ru,
        movie_path: resData.movie_path,
        movie_length: resData.movie_length,
        movie_serial_is: resData.movie_serial_is,
        movie_4k_is: resData.movie_4k_is,
        movie_age: resData.movie_age,
        movie_thumnail_path: resData.movie_thumnail_path,
      });

      for (let i in videos) {
        response.serials.push({
          movie_seria:
            language === "uz" ? `${i - 0 + 2} seria` : `${i - 0 + 2} серия`,
          movie_serial_id: videos[i].movie_serial_id,
          movie_name:
            language === "uz" ? videos[i].movie_name : videos[i].movie_name_ru,
          movie_path: videos[i].movie_path,
          movie_length: videos[i].movie_length,
          movie_serial_is: videos[i].movie_serial_is,
          movie_4k_is: videos[i].movie_4k_is,
          movie_age: videos[i].movie_age,
          movie_thumnail_path: videos[i].movie_thumnail_path,
          season_id: videos[i].season_id,
        });
      }
      res.json({ data: response, error: null, status: 200 });
    } catch (error) {
      res.status(404).json({ data: null, error: error.message, status: 404 });
    }
  },
  GET_ONE: async (req, res) => {
    try {
      const data = req.query;
      const language = req.headers.language;
      const resData = await ReadSerialOne(data);

      const response = {
        movie_serial_id: resData.movie_serial_id,
        movie_name:
          language === "uz" ? resData.movie_name : resData.movie_name_ru,
        movie_path: resData.movie_path,
        movie_length: resData.movie_length,
        movie_4k_is: resData.movie_4k_is,
        movie_id: resData.movie_id,
        movie_thumnail_path: resData.movie_thumnail_path,
        movie_premeire_date: resData.movie_premeire_date,
        movie_body:
          language === "uz" ? resData.movie_body : resData.movie_body_ru,
        movie_rate: resData.movie_rate,
        movie_genre:
          language === "uz" ? resData.movie_genre : resData.movie_genre_ru,
        country_id: resData.country_id,
        country_name:
          language === "uz" ? resData.country_name : resData.country_name_ru,
        movie_screen: resData.movie_screen,
        movie_age: resData.movie_age,
        movie_serial_is: resData.movie_serial_is,
      };

      res.json({ data: response, error: null, status: 200 });
    } catch (e) {
      res.status(404).json({ data: null, error: error.message, status: 404 });
    }
  },
  POST: (req, res) => {
    const file = req.files.file;
    const { fileName, fileNameRu, videoLength, video4K, movieId, season_id } =
      req.body;
    const filePath = `${new Date().getTime()}${
      video4K === "true" ? "_4K" : ""
    }`;

    file.mv(`./src/assets/videos1/${filePath}.mp4`, function (err) {
      if (err) return res.sendStatus(500).send(err.message);
      console.log(`Movie Uploaded successfully`);
    });

    ffmpeg(`./src/assets/videos1/${filePath}.mp4`)
      .on("progress", function (progress) {
        console.log("Processing: " + progress.percent + "% done");
      })

      .output(`./src/assets/videos1/${filePath}_360p.mp4`)
      .audioCodec("copy")
      .size("720x360")

      .output(`./src/assets/videos1/${filePath}_720p.mp4`)
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
          videoLength,
          movieId,
          video4K: video4K === "true",
          videoPath: filePath,
          videoName: fileName,
          videoNameRu: fileNameRu,
          season_id: season_id,
        };
        const newVideo = await createSerial(data);

        if (video4K === "false") {
          deleteFile(`/assets/videos1/${filePath}.mp4`);
        }

        res.json({ data: newVideo, error: null, status: 200 });
      })
      .save(`./src/assets/videos1/${filePath}_HD.mp4`);
  },
};
