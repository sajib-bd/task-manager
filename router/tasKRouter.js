import express from "express";
import protect from "../middleware/protect.js";
import {
  CountTask,
  TaskCreate,
  TaskDeleted,
  TaskRead,
  TaskReadByStatus,
  TaskStatusUpdate,
  TaskUpdate,
} from "../controller/taskController.js";

const TaskRouter = express.Router();

TaskRouter.post("/create", protect, TaskCreate);
TaskRouter.get("/read", protect, TaskRead);
TaskRouter.get("/read/:status", protect, TaskReadByStatus);
TaskRouter.get("/count", protect, CountTask);
TaskRouter.put("/update/:taskId", protect, TaskUpdate);
TaskRouter.get("/update/status/:taskId/:status", protect, TaskStatusUpdate);
TaskRouter.delete("/delete/:taskId", protect, TaskDeleted);

export default TaskRouter;
