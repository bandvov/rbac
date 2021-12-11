const express = require("express");

const router = express.Router();
router.get("/login", async (req, res) => {
  res.render("login");
});
router.get("/register", async (req, res) => {
  res.render("register");
});
router.post("/login", async (req, res) => {
  res.send("login");
});
router.post("/register", async (req, res) => {
  res.render("register");
});
router.get("/logout", async (req, res) => {
  res.send("logout");
});

module.exports = router;
