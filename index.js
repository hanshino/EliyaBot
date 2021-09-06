// Run dotenv
require("dotenv").config();
const express = require("express");
const app = express();
const listenport = process.env.PORT || 8888;
var cookieParser = require("cookie-parser");
const i18next = require("i18next");
const i18nextMiddleware = require("i18next-express-middleware");
const Backend = require("i18next-node-fs-backend");

const { createCanvas, loadImage } = require("canvas");
const path = require("path");
app.use(
  express.static("public", {
    maxAge: "30d",
  })
);
app.set("view engine", "ejs");
app.use(express.json()); // support json encoded bodies
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
i18next
  .use(i18nextMiddleware.LanguageDetector)
  .use(Backend)
  .init({
    backend: {
      loadPath: __dirname + "/locales/{{lng}}/{{ns}}.json",
    },
    debug: false,
    detection: {
      order: ["querystring", "cookie"],
      caches: ["cookie"],
    },
    preload: ["en", "ja", "zh-TW"],
    fallbackLng: ["en"],
  });
app.use(i18nextMiddleware.handle(i18next));
const viewFolder = path.join(__dirname, "./views/");

app.get("/", function (req, res) {
  res.render(viewFolder + "index.ejs", {
    title: "hanshino",
    data: {},
    server: req.query.sv ? req.query.sv : "jp",
  });
});
app.get("/:id(\\d+)/", function (req, res) {
  res.render(viewFolder + "index.ejs", {
    title: "hanshino",
    data: {
      listid: req.params.id,
    },
    server: req.query.sv ? req.query.sv : "jp",
  });
});
app.get("/list", function (req, res) {
  res.render(viewFolder + "index.ejs", {
    title: "hanshino",
    data: {
      listview: true,
    },
    server: req.query.sv ? req.query.sv : "jp",
  });
});
app.get("/:id(\\d+)/", function (req, res) {
  res.render(viewFolder + "char.js", {
    title: "hanshino",
    data: {
      listid: req.params.id,
    },
    server: req.query.sv ? req.query.sv : "jp",
  });
});
app.get("/comp/:w", function (req, res) {
  const canvas = createCanvas(480, 205);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var url = req.params.w.replace(".png", "");
  var lang = "";
  if (url.indexOf(".") > 0) {
    lang = "_" + url.split(".")[1];
    url = url.split(".")[0];
  }
  const units = url.split("-");
  var count = 0;
  loadImage("./public/img/party_full" + lang + ".png").then((bg) => {
    ctx.drawImage(bg, 0, 0, 480, 205);
    for (i = 0; i < units.length; i++) {
      var imageUrl = "";
      if (i < 6) {
        imageUrl = "./public/img/assets/chars/" + units[i] + "/square_0.png";
      } else if (i < 12) {
        if (i % 2 == 0) {
          imageUrl = "./public/img/assets/item/equipment/" + units[i] + ".png";
        } else {
          imageUrl =
            "./public/img/assets/item/equipment/" + units[i] + "_soul.png";
        }
      }
      loadImage(imageUrl).then((image) => {
        var width = 82;
        var x, y;
        switch (count) {
          case 0:
          case 2:
          case 4:
            x = 10 + (count / 2) * 160;
            y = 10;
            break;
          case 1:
          case 3:
          case 5:
            x = 81 + ((count - 1) / 2) * 160;
            y = 110;
            width = 69;
            break;
          case 6:
          case 8:
          case 10:
            x = 96 + ((count - 6) / 2) * 160;
            y = 26;
            width = 54;
            break;
          case 7:
          case 9:
          case 11:
            x = 13 + ((count - 7) / 2) * 160;
            y = 135;
            width = 44;
            break;
          default:
            break;
        }
        ctx.drawImage(image, x, y, width, width);
        count++;
        if (count >= units.length) {
          var data = canvas.toDataURL();
          data = data.replace(/^data:image\/png;base64,/, "");
          var img = new Buffer.from(data, "base64");
          res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": img.length,
          });
          res.end(img);
        }
      });
    }
  });
});

app.listen(listenport);
