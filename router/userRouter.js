import express from "express";
import {
  Login,
  SingUp,
  userFind,
  VerifyEmailLink,
  VerifyEmail,
  SendEmailCode,
  PasswordReset,
  UpdateName,
  Update,
  updatePassword,
} from "../controller/userController.js";
import EmailCheck from "../middleware/verifyCheck.js";
import protect from "../middleware/protect.js";

export const UserRouter = express.Router();

UserRouter.post("/auth/signup", SingUp);
UserRouter.post("/auth/login", EmailCheck, Login);
UserRouter.post("/user/emailVerifyRequest/:email", VerifyEmailLink);
UserRouter.get("/user/emailVerify/:token", VerifyEmail);
UserRouter.post("/user/emailCode/:email", SendEmailCode);
UserRouter.put("/user/passwordReset/:email", PasswordReset);
UserRouter.get("/user/find", protect, userFind);
UserRouter.put("/user/update/name", protect, UpdateName);
UserRouter.put("/user/update/info/:otp", protect, Update);
UserRouter.put("/user/update/password", protect, updatePassword);
