const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SECRET_KEY = process.env.SECRET_KEY;
const EXPIRES_IN = 24 * 60 * 60; // 24h

exports.getAll = async () => {
  return User.find().select("-password");
};

exports.create = async ({ username, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("email_already_exists");
    err.code = "EMAIL_EXISTS";
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const created = await User.create({ username, email, password: hashed });

  const safeUser = created.toObject();
  delete safeUser.password;
  return safeUser;
};

exports.authenticate = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;

  const token = jwt.sign(
    { user: { id: user._id, email: user.email } },
    SECRET_KEY,
    { expiresIn: EXPIRES_IN }
  );

  const safeUser = user.toObject();
  delete safeUser.password;

  return { token, user: safeUser };
};

exports.getByEmail = async (email) => {
  return User.findOne({ email }).select("-password");
};

exports.updateByEmail = async (email, { username, password }) => {
  const update = {};
  if (username) update.username = username;
  if (password) update.password = await bcrypt.hash(password, 10);

  return User.findOneAndUpdate({ email }, update, {
    new: true,
    runValidators: true,
  }).select("-password");
};

exports.deleteByEmail = async (email) => {
  const deleted = await User.findOneAndDelete({ email });
  return deleted ? true : false;
};