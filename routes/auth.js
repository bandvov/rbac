const express = require("express");
const UserModel = require("../models/user");
const { body, validationResult } = require("express-validator");

const router = express.Router();
router.use("/register", [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email format is not correct")
    .normalizeEmail()
    .toLowerCase(),
  body("password").trim().isLength(2).withMessage("Password is too short"),
]);
router
  .route("/login")
  .get(async (req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {
    res.send("login");
  });
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
      res.render("register", { messages: req.flash() });
    }
    try {
      const userExists = await UserModel.findOne({ email });
      if (userExists) {
        res.redirect("/auth/register");
      }
      const user = await UserModel.create(req.body);
      if (user) {
        res.redirect("/auth/login");
      }
    } catch (err) {
      next(err);
    }
  });
router.get("/logout", async (req, res) => {
  res.send("logout");
});

module.exports = router;
