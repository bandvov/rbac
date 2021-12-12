const express = require("express");
const UserModel = require("../models/user");

const router = express.Router();
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
    try {
      const userExists = await UserModel.findOne({ email });
      if (userExists) {
        res.redirect("/auth/register");
      }
      const user = await UserModel.create(req.body);

      res.send({ email: user.email });
    } catch (err) {
      next(err);
    }
  });
router.get("/logout", async (req, res) => {
  res.send("logout");
});

module.exports = router;
