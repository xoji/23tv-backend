module.exports = {
  POST_THUBNAIL: (req, res) => {
    const thubnail = req.files.thubnail;
    const path = `${new Date().getTime()}-${thubnail.name}`;
    thubnail.mv(
      `/var/www/23tv-backend/src/assets/thubnails/${path}`,
      function (err) {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Something went wrong", error: err });
        } else {
          res.status(200).json({ data: path, error: null, status: 200 });
        }
      }
    );
  },
  POST_SCREEN: (req, res) => {
    const screen = req.files.screen;
    const path = `${new Date().getTime()}-${screen.name}`;
    screen.mv(
      `/var/www/23tv-backend/src/assets/screen/${path}`,
      function (err) {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Something went wrong", error: err });
        } else {
          res.status(200).json({ data: path, error: null, status: 200 });
        }
      }
    );
  },
};
