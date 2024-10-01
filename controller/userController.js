import User from "../model/userModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import TokenGenerate from "../utils/token.js";
import jwt from "jsonwebtoken";
import { EmailVerifyLink, EmailCode } from "../utils/email.js";
import OTPGenerate from "../utils/OTPgenerate.js";
import imageUpload from "../utils/multer.js";

export const SingUp = async (req, res) => {
  try {
    const { email, mobile, password, name } = req.body;

    if (!email || !mobile || !password || !name) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (
      email.trim() === "" ||
      mobile.trim() === "" ||
      password.trim() === "" ||
      name.trim() === ""
    ) {
      return res.status(400).json({
        message: "Fields cannot be empty",
      });
    }

    const mobileRegex = /(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/;
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (!mobileRegex.test(mobile.trim())) {
      return res.status(400).json({
        message:
          "Invalid mobile number format. It must be 11 digits long and start with one of the specified prefixes.",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email }, { mobile: mobile }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(405).json({
          message: "This Email Address already exists",
        });
      }
      if (existingUser.mobile === mobile) {
        return res.status(405).json({
          message: "This Mobile Number already exists",
        });
      }
    }

    if (password.length < 6 || password.length > 20) {
      return res.status(400).json({
        message: "Password should be at least 6 and less than 20 characters",
      });
    }

    const CreateUser = await User.create({
      email: email,
      mobile: mobile,
      password: await bcrypt.hash(password, 11),
      name: name,
    });

    if (!CreateUser) {
      return res.status(404).json({
        status: "fail",
        message: "Something went wrong",
      });
    }

    return res.status(201).json({
      status: "success",
      user: "user created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(403).json({
        message: "All fields are required",
      });
    }

    if ((email.trim() == "", password.trim() == "")) {
      return res.status(400).json({
        message: "Fields cannot be empty",
      });
    }

    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      return res.status(400).json({
        message: "this email does not have an account",
      });
    }

    const MatchPassword = await bcrypt.compare(password, findUser.password);
    if (!MatchPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    if (!findUser.verify) {
      return res.status(401).json({
        message: "Your need to do email verification",
      });
    }

    await TokenGenerate(findUser._id, res);

    return res.status(200).json({
      status: "success",
      message: "Login successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const VerifyEmailLink = async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(400).json({
        message: "Please Provide Email Address",
      });
    }

    const findEmail = await User.findOne({ email: email });
    if (!findEmail) {
      return res.status(404).json({
        message: "this email does not have an account",
      });
    }
    if (findEmail?.verify) {
      return res.status(400).json({
        message: "Sorry, Your email address is already verify",
      });
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    const SendEmail = await EmailVerifyLink(email, token);

    return res.status(200).json({
      message: "Please Check Your Mail Box",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An Error has occurred while processing your request",
    });
  }
};

export const VerifyEmail = async (req, res) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(404).json({
        message: "Please Provide Token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (user?.verify) {
      return res.status(200).json({
        message: "Already verified",
      });
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        $set: { verify: true },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({
        message: "Verifying Failed",
      });
    }

    return res.status(200).json({
      message: "Verification Success",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token. Please login again.",
      });
    }

    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const SendEmailCode = async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(404).json({
        message: "Please Provide Email Address",
      });
    }

    const find = await User.findOne({ email: email });
    if (!find) {
      return res.status(204).json({
        message: "No Account Found With This Email Address",
      });
    }

    const OTP = OTPGenerate(6);
    if (find.otp.expired - 180000 > new Date().getTime()) {
      const minuteCat = find.otp.expired - 180000;
      const time = minuteCat - new Date().getTime();
      const showTime = time / 1000;
      return res.status(404).json({
        message: `OTP  has already send to you email. please try again ${showTime.toFixed(
          0
        )} seconds later`,
      });
    }
    const sendCode = await EmailCode(email, OTP);
    const update = await User.findByIdAndUpdate(find._id, {
      $set: {
        "otp.code": OTP,
        "otp.expired": new Date().getTime() + 5 * 60 * 1000,
      },
    });

    if (!update) {
      return res.status(404).json({
        message: "Sorry, Something Wrong",
      });
    }

    return res.status(200).json({
      message: "Mail sent successfully Please check your mail box",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const PasswordReset = async (req, res) => {
  try {
    const email = req.params.email;
    const { code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({
        message: "Please provide email address, OTP, and new password",
      });
    }

    if (code == "" || password == "") {
      return res.status(400).json({
        message: "Please Provide OTP and New Password",
      });
    }
    const find = await User.findOne({ email: email });

    if (!find) {
      return res.status(404).json({
        message: "Sorry, User does not exist",
      });
    }

    if (find.otp.code != code) {
      return res.status(401).json({
        message: "This OTP Wrong. Please Provide Correct OTP",
      });
    }

    if (find.otp.expired < new Date().getTime()) {
      return res.status(401).json({
        message: "Code Expired",
      });
    }

    const PassMatchCheck = await bcrypt.compare(password, find.password);

    if (PassMatchCheck) {
      return res.status(400).json({
        message:
          "you account currently has this password. please enter new password",
      });
    }

    const updatePass = await User.findByIdAndUpdate(
      find._id,
      {
        $set: {
          password: await bcrypt.hash(password, 11),
          "otp.expired": new Date().getTime(),
        },
      },
      { new: true }
    );

    if (!updatePass) {
      return res.status(404).json({
        message: "Password update failed. Please try again later.",
      });
    }

    return res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const userFind = async (req, res) => {
  try {
    const id = req.headers.id;
    if (!id) {
      return res.status(404).json({
        message: "UserId not found",
      });
    }

    const userInfo = await User.findById(id, {
      _id: 0,
      name: 1,
      mobile: 1,
      email: 1,
    });
    return res.status(200).json({
      status: "success",
      userInfo: userInfo,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const UpdateName = async (req, res) => {
  try {
    const userId = req.headers.id;

    const { name } = req.body;

    if (!name || name == "") {
      return res.status(400).json({
        message: "Name fields are required",
      });
    }

    if (name.length < 5) {
      return res.status(400).json({
        message: "You Have To Enter 5 Character Name",
      });
    }

    const find = await User.findOne(userId, {
      name: 1,
    });

    if (!find) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const update = await User.findByIdAndUpdate(
      find._id,
      {
        $set: { name: name },
      },
      { new: true }
    );

    if (!update) {
      return res.status(404).json({
        message: "Update Failed",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Name Update successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const Update = async (req, res) => {
  try {
    const { otp } = req.params;
    const userId = req.headers.id;
    const { email, mobile } = req.body;

    if (!email && !mobile) {
      return res.status(404).json({
        message: "Email Address or Number Field is required",
      });
    }

    if (email === "" && mobile === "") {
      return res.status(400).json({
        message: "Either email or number should be changed",
      });
    }

    const mobileRegex = /(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/;
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }
    }

    if (!mobileRegex.test(mobile.trim())) {
      return res.status(400).json({
        message:
          "Invalid mobile number format. It must be 11 digits long and start with one of the specified prefixes.",
      });
    }

    const userFind = await User.findOne({ _id: userId });

    if (!userFind) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (email == userFind.email && number == userFind.number) {
      return res.status(400).json({
        message: "your haven't changed anything",
      });
    }

    const existing = await User.findOne({
      $or: [{ email: email, mobile: mobile }],
    });

    if (existing) {
      return res.status(400).json({
        message: "This Email or Number already exists",
      });
    }

    if (!otp) {
      return res.status(404).json({
        message: "to change email or number you need to provide OTP",
      });
    }

    if (otp != userFind.otp.code) {
      return res.status(404).json({
        message: "you entered the wrong OTP",
      });
    }

    if (userFind.otp.expired < new Date().getTime()) {
      return res.status(401).json({
        message: "OTP Expired",
      });
    }

    const update = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          email: email,
          mobile: mobile,
          "otp.expired": new Date().getTime(),
        },
      },
      { new: true }
    );

    if (!update) {
      return res.status(404).json({
        message: "Update Failed",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Update Success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const userId = req.headers.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "All Fields are required",
      });
    }

    if (oldPassword == "" || newPassword == "") {
      return res.status(400).json({
        message: "Field cannot be empty",
      });
    }

    const findUser = await User.findById(userId);

    if (!findUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const MatchPassword = await bcrypt.compare(oldPassword, findUser.password);
    if (!MatchPassword) {
      return res.status(404).json({
        message: "you entered the wrong password",
      });
    }

    if (oldPassword == newPassword) {
      return res.status(400).json({
        message: "This Password Already Have Your Account",
      });
    }

    const update = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          password: await bcrypt.hash(newPassword, 11),
        },
      },
      { new: true }
    );

    if (!update) {
      return res.status(404).json({
        message: "Update Failed",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.headers;

    // fileUpload Array

    // imageUpload(id, "profile").array("profile", 2)(req, res, async (err) => {
    //   if (err) {
    //     return res.status(400).json({ message: "Profile Upload Failed" });
    //   }

    //   const profileFilenames = req.files.map((file) => file.filename);

    //   const update = await User.findByIdAndUpdate(
    //     id,
    //     {
    //       profile: profileFilenames.map((filename) => ({ url: filename })),
    //     },
    //     {
    //       new: true,
    //     }
    //   );

    // file Upload single
    imageUpload(id, "profile").single("profile")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "Profile Upload Failed" });
      }

      const update = await User.findByIdAndUpdate(
        id,
        {
          profile: req.file.filename,
        },
        {
          new: true,
        }
      );

      res.status(200).json({
        message: "Profile updated successfully",
        filePath: req.file.filename,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
