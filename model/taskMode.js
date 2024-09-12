import mongoose from "mongoose";

const TaskSchema = mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "new",
    },
  },
  { timestamps: true, versionKey: false }
);

const Task = mongoose.model("Task", TaskSchema);
export default Task;
