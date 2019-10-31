const mongoose = require("mongoose")

const TaskSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" } //add reference to User model
  },
  {
    timestamps: true
  }
)

const Task = mongoose.model("Task", TaskSchema)

module.exports = Task
