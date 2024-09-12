import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import hpp from "hpp";
import helmet from "helmet";
import RateLimit from "express-rate-limit";

import connect from "./config/connect.js";
import { UserRouter } from "./router/userRouter.js";
import TaskRouter from "./router/tasKRouter.js";


dotenv.config();
const app = express();

app.use(
  RateLimit({ windowMs: process.env.REQ_MS, max: process.env.REQ_LIMIT })
);
app.use(cors());
app.use(helmet());
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

app.use("/api/v1", UserRouter);
app.use("/api/v1/task", TaskRouter);

app.listen(PORT, () => {
  connect();
  console.log(`Server Running ${PORT}`);
});
