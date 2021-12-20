const router = require("express").Router();
const { findByIdAndUpdate } = require("../models/user");
const User = require("../models/user");

router.route("/users").get(async (req, res, next) => {
  try {
    const users = await User.find();
    res.render("manage-users", { users });
  } catch (error) {
    next(error);
  }
});
router.route("/user/:id").get(async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    return res.render("profile", {
      id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
});
router.route("/update-role").post(async (req, res) => {
  const { id, role } = req.body;

  if (id === req.user.id) {
    req.flash("error", "Admin can not remove themselves. Ask another admin");
    return res.redirect("/admin/users");
  }
  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  );
  req.flash("info", `User ${user.email} role updated to ${user.role}`);
  res.redirect("/admin/users");
});

module.exports = router;
