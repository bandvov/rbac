const express = require("express");
const createHttpErrors = require("http-errors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const path = require("path");
const connectFlash = require("connect-flash");
const session = require("express-session");

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      domain: "localhost",
      httpOnly: true,
    },
  })
);
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname + "/public")));
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("💾connected to mongodb");
    app.listen(PORT, () => {
      console.log("Started on port", PORT);
    });
  })
  .catch((err) => {
    console.error(err);
  });

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);

app.use((req, res, next) => {
  next(createHttpErrors.NotFound());
});

// Error Handler
app.use((error, req, res, next) => {
  console.log(error);
  error.status = error.status || 500;
  res.status(error.status);
  res.render("error_40x", { error });
});
