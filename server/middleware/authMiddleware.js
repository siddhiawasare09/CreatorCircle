import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === "string" || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token",
      });
    }

    req.userId = decoded.userId;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

export default authMiddleware;
