import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import hpp from "hpp";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";
import mongodbSanitize from "mongodb-sanitize";
import cookieParser from "cookie-parser";

import connect from "./config/connect.js";
import { UserRouter } from "./router/userRouter.js";
import TaskRouter from "./router/tasKRouter.js";
import browserAgentMiddleware from "./middleware/userAgent.js";

dotenv.config();
const app = express();

const limit = rateLimit({
  windowMs: process.env.REQ_MS,
  max: process.env.REQ_LIMIT,
  message: "Too many requests, please try again later.",
  statusCode: 429,
});

app.use(limit);
app.use(
  cors({
    origin: ["https://react.sajib.xyz/", "http://localhost:5173"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(xssClean());
app.use(mongodbSanitize());
app.use(helmet());
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.disable("x-powered-by");
app.set("etag", true);

const PORT = process.env.PORT || 4000;

app.use(browserAgentMiddleware);
app.use("/api/v1", UserRouter);
app.use("/api/v1/task", TaskRouter);

app.listen(PORT, () => {
  connect();
  console.log(`Server Running ${PORT}`);
});
