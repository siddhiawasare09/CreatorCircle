import jwt from "jsonwebtoken";

const optionalAuthMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) return next();

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization header",
    });
  }

  try {
    const decoded = jwt.verify(
      authorization.slice("Bearer ".length).trim(),
      process.env.JWT_SECRET,
    );

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

export default optionalAuthMiddleware;
