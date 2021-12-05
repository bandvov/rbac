const express = require("express");
const createHttpErrors = require("http-errors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.get("/", (req, res) => {
  res.send("Server up and running");
});

app.use((req, res, next) => {
  next(createHttpErrors.NotFound());
});

app.use((err, req, res) => {
  err.status = err.status || 500;
  res.status(err.status).send(err);
});

app.listen(PORT, () => {
  console.log("Started on port", PORT);
});
