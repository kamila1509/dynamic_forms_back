//const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
const routesConfig = require("./users/routers-config");
const cors = require("cors");


const app = express();

// settings
app.set("port", process.env.PORT || 4000);

// middlewares
//app.use(express.urlencoded({extended: false}));

// routes
app.use(bodyParser.json());
app.use(cors({ origin: true }));
routesConfig(app);

module.exports = app;
