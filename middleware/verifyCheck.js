import User from "../model/userModel.js";

const EmailCheck = async (req, res, next) => {
  try {
    const { email } = req.body;
    const find = await User.find({ email: email });
    return find?.verify
      ? res.status(404).json({
          message: "Please verify your email",
        })
      : next();
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export default EmailCheck;
