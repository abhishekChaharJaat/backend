const jwt = require("jsonwebtoken");
const JWT_SECRET = "iamjaat";

const fetchuser = (req, res, next) => {
  // Get user from the JWT-Token
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).json({ error: "Access denied" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(400).json({ error: "invalid token" });
  }
};

module.exports = fetchuser;
