const fs = require("fs");

const checkFile = async (path, filename, resolution) => {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return path;
  } catch (e) {
    return `./src/assets/videos1/${filename}${
      resolution === "4K" ? "" : `_${resolution}`
    }.mp4`;
  }
};

module.exports = {
  GET: async (req, res) => {
    try {
      const { filename, resolution = "360p" } = req.params;
      if (!filename) throw new Error();
      const path = await checkFile(
        `./src/assets/videos/${filename}${
          resolution === "4K" ? "" : `_${resolution}`
        }.mp4`,
        filename,
        resolution
      );
      // fs.accessSync(
      //   `./src/assets/videos/${filename}${
      //     resolution === "4K" ? "" : `_${resolution}`
      //   }.mp4`,
      //   fs.constants.F_OK,
      //   (err) => {
      //     if (err) {
      //       path = `./src/assets/videos1/${filename}${
      //         resolution === "4K" ? "" : `_${resolution}`
      //       }.mp4`;
      //       const stat = fs.statSync(path);
      //       const fileSize = stat.size;
      //       const range = req.headers.range;
      //       if (range) {
      //         const parts = range.replace(/bytes=/, "").split("-");
      //
      //         const start = parseInt(parts[0], 10);
      //         const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      //         const chunkSize = end - start + 1;
      //         const file = fs.createReadStream(path, { start, end });
      //         const head = {
      //           "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      //           "Accept-Ranges": "bytes",
      //           "Content-Length": chunkSize,
      //           "Content-Type": "video/mp4",
      //         };
      //         res.writeHead(206, head);
      //         file.pipe(res);
      //       } else {
      //         const head = {
      //           "Content-Length": fileSize,
      //           "Content-Type": "video/mp4",
      //         };
      //         res.writeHead(200, head);
      //         fs.createReadStream(path).pipe(res);
      //       }
      //     } else {
      //
      //     }
      //   }
      // );
      const stat = fs.statSync(path);
      const fileSize = stat.size;
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");

        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        const file = fs.createReadStream(path, { start, end });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
      }
    } catch (e) {
      res.status(404);
    }
  },
  GET_TRILLER: (req, res) => {
    try {
      const { filename, resolution = "360p" } = req.params;
      if (!filename) throw new Error();
      const path = `./src/assets/trillers/${filename}_${resolution}.mp4`;
      const stat = fs.statSync(path);
      const fileSize = stat.size;
      const range = req.headers.range;
      // if (!range) throw new Error
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        const file = fs.createReadStream(path, { start, end });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
      }
    } catch (e) {
      res.status(404);
    }
  },
};
