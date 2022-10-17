const https = require("https");
const http = require("http");
const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./express/routes.js");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 4000;
const app = express();

// const httpsOptions = {
//     key: fs.readFileSync('./src/security/private.key'),
//     cert: fs.readFileSync('./src/security/certificate.crt')
// }
// const serverHttps = https.createServer(httpsOptions, app)

const serverHttp = http.createServer(app);

const io = require("socket.io")(serverHttp, {
  path: "/socket.io",
  allowEIO3: true,
  pingInterval: 3000,
});
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "assets", "videos1", "temp"),
  })
);
app.use(cors("https://aapi.23tv.uz/"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "assets")));
app.use(routes);
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

const liveSocket = io.of("/live");
// let broadcaster
let broadcasters = {};

liveSocket.on("connection", function (socket) {
  socket.on("waiting", function (event) {
    socket.broadcast.emit("waiting", event);
  });

  socket.on("register as broadcaster", function (room) {
    console.log("register as broadcaster for room", room);

    broadcasters[room] = socket.id;
    socket.join(room);
  });

  socket.on("register as viewer", function (user) {
    console.log("register as viewer for room", user.room);

    socket.join(user.room);
    user.id = socket.id;

    socket.to(broadcasters[user.room]).emit("new viewer", user);
  });

  socket.on("candidate", function (id, event) {
    socket.to(id).emit("candidate", socket.id, event);
  });

  socket.on("offer", function (id, event) {
    event.broadcaster.id = socket.id;
    socket.to(id).emit("offer", event.broadcaster, event.sdp);
  });

  socket.on("answer", function (event) {
    socket.to(broadcasters[event.room]).emit("answer", socket.id, event.sdp);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("waiting", {
      status: false,
      liveTitle: "",
      liveBody: "",
    });
  });
});

// serverHttps.listen(PORT, () => console.log(PORT))
serverHttp.listen(PORT, () => console.log(PORT));
