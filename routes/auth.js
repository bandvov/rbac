const express = require("express");
const UserModel = require("../models/user");
const { body, validationResult } = require("express-validator");
const passport = require("../utils/passport.auth");
const connectEnsureLogin = require("connect-ensure-login");

const router = express.Router();
router.use("/login", [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email format is not correct")
    .normalizeEmail()
    .toLowerCase(),
  body("password").trim().isLength(2).withMessage("Password is too short"),
  connectEnsureLogin.ensureLoggedOut({ redirectTo: "/" }),
]);
router.use("/register", [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email format is not correct")
    .normalizeEmail()
    .toLowerCase(),
  body("password").trim().isLength(2).withMessage("Password is too short"),
  connectEnsureLogin.ensureLoggedOut({ redirectTo: "/" }),
]);
router.use("/logout", [connectEnsureLogin.ensureLoggedIn({ redirectTo: "/" })]);
router
  .route("/login")
  .get(async (req, res) => {
    res.render("login");
  })
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      successReturnToOrRedirect: "/",
      failureRedirect: "/auth/login",
    })
  );
router
  .route("/register")
  .get(async (req, res) => {
    res.render("register");
  })
  .post(async (req, res, next) => {
    const { email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => {
        req.flash("error", error.msg);
      });
      res.render("register", {
        messages: req.flash(),
        email: req.body.email,
        password: req.body.password,
      });
    }
    try {
      const userExists = await UserModel.findOne({ email });
      if (userExists) {
        res.redirect("/auth/register");
      }
      const user = await UserModel.create(req.body);
      if (user) {
        req.flash("success", { messages: "User successfully created" });
        res.redirect("/auth/login");
      }
    } catch (err) {
      next(err);
    }
  });
router.get("/logout", async (req, res) => {
  req.logOut();
  res.redirect("/");
});
// function ensureAuthentificated(req, res, next) {
//   req.isAuthenticated() ? next() : res.redirect("/auth/login");
// }
// function ensureNotAuthentificated(req, res, next) {
//   req.isAuthenticated() ? res.redirect("back") : next();
// }

module.exports = router;
