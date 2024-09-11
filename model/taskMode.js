import mongoose from "mongoose";

const TaskSchema = mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
    title: {
      type: "String",
      required: true,
    },
    description: {
      type: "String",
      required: true,
    },
    status: {
      type: "String",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const Task = mongoose.model("task", TaskSchema);
export default Task;
