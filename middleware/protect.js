import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

const protect = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(403).json({
        message: "please provide a token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(403).json({
        message: "UnAuthorized",
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({
        message: "UnAuthorized",
      });
    }

    req.headers.id = user._id;
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired.",
      });
    }
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export default protect;
