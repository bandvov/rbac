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
const passport = require("./utils/passport.auth");
const MongoStore = require("connect-mongo");
const connectEnsureLogin = require("connect-ensure-login");
const adminRouter = require("./routes/admin");
const roles = require("./utils/constants");

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
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
require("./utils/passport.auth");
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
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
app.use(
  "/user",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  userRouter
);
app.use(
  "/admin",
  connectEnsureLogin.ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureIsAdmin,
  adminRouter
);

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
// function ensureAuthentificated(req, res, next) {
//   req.isAuthenticated() ? next() : res.redirect("/auth/login");
// }
function ensureIsAdmin(req, res, next) {
  if (req.user.role === roles.admin) {
    next();
  } else {
    req.flash("warning", "You are not authorized to see this route");
    res.redirect("/");
  }
}
function ensureIsModerator(req, res, next) {
  if (req.user.role === roles.moderator) {
    next();
  } else {
    req.flash("warning", "You are not authorized to see this route");
    res.redirect("/");
  }
}
