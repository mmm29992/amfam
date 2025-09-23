// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = function authenticateToken(req, res, next) {
  // Prefer Bearer for tooling/tests, else cookie
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const cookieToken = req.cookies?.token;
  const token = bearer || cookieToken;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Backward + forward compatibility:
    // - old tokens used { userId, userType }
    // - new tokens use { sub, userType }
    const userId = payload.sub ?? payload.userId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    // Keep the shape your routes expect
    req.user = { userId: String(userId), userType: payload.userType };
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
