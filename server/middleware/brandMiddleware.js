import Creator from "../models/Creator.js";
import User from "../models/User.js";

const brandMiddleware = async (req, res, next) => {
  try {
    const [user, creatorProfile] = await Promise.all([
      User.findById(req.userId).select("name role"),
      Creator.exists({ user: req.userId }),
    ]);

    if (!user || user.role !== "customer" || creatorProfile) {
      return res.status(403).json({
        success: false,
        message: "A brand account is required for this action",
      });
    }

    req.brand = user;
    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to verify your brand account",
    });
  }
};

export default brandMiddleware;
