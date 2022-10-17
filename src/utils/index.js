const fs = require("fs");
const path = require("path");
const geoip = require("geoip-lite");
exports.deleteFile = (url) => {
  fs.unlink(path.join(path.dirname(__dirname), url), (err) => {
    console.log(err);
  });
};
exports.geoIp = (req) => {
  return geoip.lookup(req.headers["x-forwarded-for"]);
};
