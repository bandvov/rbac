const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const createHttpError = require("http-errors");
const roles = require("../utils/constants");

const userSchema = Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(roles),
    default: roles.client,
  },
});
userSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(5);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
      if (this.email === process.env.ADMIN_EMAIL) {
        this.role = roles.admin;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});
userSchema.methods.isValidPassword = async function (password) {
  console.log(password);
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw createHttpError.InternalServerError(error.message);
  }
};

module.exports = model("user", userSchema);
