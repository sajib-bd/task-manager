import Task from "../model/taskMode.js";
import mongoose from "mongoose";

export const TaskCreate = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (
      !title ||
      !description ||
      title.trim() === "" ||
      description.trim() === ""
    ) {
      return res.status(400).json({
        message: "All fields are required and cannot be empty",
      });
    }

    const createTask = await Task.create(
      {
        clientId: req.headers.id,
        title: title.trim(),
        description: description.trim(),
      },
      { title: 1, description: 1, status: 1 }
    );

    if (!createTask) {
      return res.status(404).json({
        message: "Task Create Failed",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Task created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const TaskRead = async (req, res) => {
  try {
    const findTask = await Task.find(
      { clientId: req.headers.id },
      { title: 1, description: 1, status: 1 }
    );
    if (!findTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Read Successfully",
      data: findTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const TaskReadByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const userId = req.headers.id;
    if (!status) {
      return res.status(400).json({
        message: "Status Field is required",
      });
    }

    const FindTaskByStatus = await Task.find(
      {
        clientId: userId,
        status: status,
      },
      { title: 1, description: 1, status: 1 }
    );

    if (!FindTaskByStatus) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Read Successfully",
      data: FindTaskByStatus,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const TaskUpdate = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.headers.id;
    const { title, description } = req.body;

    if (!taskId) {
      return res.status(400).json({
        message: "Task ID is required",
      });
    }
    if (!title && !description) {
      return res.status(400).json({
        message: "At least one field (title or description) is required",
      });
    }
    if (title === "" || description === "") {
      return res.status(400).json({
        message: "Fields cannot be empty",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        message: "Task id invalid",
      });
    }

    const findTask = await Task.findById(taskId);
    if (!findTask) {
      return res.status(404).json({
        message: "Sorry, Task does not exist",
      });
    }

    if (String(findTask.clientId) != String(userId)) {
      return res.status(403).json({
        message: "Sorry, it's  not your task",
      });
    }

    const TaskUpdate = await Task.findByIdAndUpdate(
      taskId,
      {
        $set: {
          title: title,
          description: description,
        },
      },
      {
        new: true,
      }
    );

    if (!TaskUpdate) {
      return res.status(404).json({
        message: "Task not updated",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Task update successful",
      data: TaskUpdate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const TaskStatusUpdate = async (req, res) => {
  try {
    const { taskId, status } = req.params;
    const userId = req.headers.id;
    if (!taskId || !status) {
      return res.status(400).json({
        message: "task id and status are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        message: "Task id invalid",
      });
    }

    const findTask = await Task.findById(taskId);
    if (!findTask) {
      return res.status(404).json({
        message: "Sorry, Task does not exist",
      });
    }

    if (String(findTask.clientId) != String(userId)) {
      return res.status(403).json({
        message: "Sorry, it's  not your task",
      });
    }

    const updateTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $set: {
          status: status,
        },
      },
      {
        new: true,
      }
    );

    if (!updateTask) {
      return res.status(404).json({
        message: "Status Update Failed",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Status Update Success",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const TaskDeleted = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.headers.id;
    if (!taskId) {
      return res.status({
        message: "task id are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        message: "Task id invalid",
      });
    }

    const findTask = await Task.findById(taskId);
    if (!findTask) {
      return res.status(404).json({
        message: "Sorry, Task does not exist",
      });
    }

    if (String(findTask.clientId) != String(userId)) {
      return res.status(403).json({
        message: "Sorry, it's  not your task",
      });
    }

    const Deleted = await Task.findByIdAndDelete(taskId);

    if (!Deleted) {
      return res.status(404).json({
        message: "Task Deleted Failed",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Task Deleted Success",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const CountTask = async (req, res) => {
  try {
    const userId = req.headers.id;

    const TaskCount = await Task.aggregate([
      { $match: { clientId: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      status: "success",
      message: "Task count retrieved successfully",
      data: TaskCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};
