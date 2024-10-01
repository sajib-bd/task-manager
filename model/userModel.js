import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      isLowercase: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    profile: {
      type: String,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: {
        type: String,
        default: "",
      },
      expired: {
        type: Number,
        default: new Date().getTime(),
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("users", userSchema);
export default User;
