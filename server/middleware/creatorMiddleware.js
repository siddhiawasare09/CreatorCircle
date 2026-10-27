import Creator from "../models/Creator.js";

const creatorMiddleware = async (req, res, next) => {
  try {
    const creator = await Creator.findOne({ user: req.userId }).select(
      "_id name category skills",
    );

    if (!creator) {
      return res.status(403).json({
        success: false,
        message: "A creator profile is required to generate a proposal",
      });
    }

    req.creator = creator;
    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to verify your creator profile",
    });
  }
};

export default creatorMiddleware;
