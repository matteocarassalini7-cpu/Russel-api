const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

// API -> JSON
exports.checkJWT = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (token && token.startsWith("Bearer ")) token = token.slice(7);

  if (!token) return res.status(401).json("token_required");

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json("token_not_valid");
    req.decoded = decoded;
    next();
  });
};

// VIEWS -> cookie + redirect
exports.checkJWTView = (req, res, next) => {
  const token = req.cookies?.token; 

  if (!token) return res.redirect("/login");

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.redirect("/login");
    req.decoded = decoded;
    next();
  });
};