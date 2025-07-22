const jwt = require("jsonwebtoken");
const SECRET_KEY = "Abc23423sdf";

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded.user._id || decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
module.exports = authenticate;
