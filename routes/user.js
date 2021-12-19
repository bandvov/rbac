const express = require("express");

const router = express.Router();
router.get("/profile", async (req, res) => {
  res.render("profile", {
    id: req.user._id,
    email: req.user.email,
    role: req.user.role,
  });
});
module.exports = router;
