const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const User = require("../../src/models/user")
const Task = require("../../src/models/task")

const userOnId = new mongoose.Types.ObjectId()
const userOne = {
  _id: userOnId,
  name: "Nik",
  email: "nikkiweat@example.com",
  password: "nikkinikki",
  tokens: [
    {
      token: jwt.sign({ _id: userOnId }, process.env.JWT_SECRET)
    }
  ]
}

const userTwoID = new mongoose.Types.ObjectId()
const userTwo = {
  _id: userTwoID,
  name: "Nicole",
  email: "nicole@example.com",
  password: "nikkinikki",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoID }, process.env.JWT_SECRET)
    }
  ]
}

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "user 1 task",
  completed: false,
  owner: userOne._id
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "user 2 task",
  completed: true,
  owner: userTwo._id
}

const setupDatabase = async () => {
  await User.deleteMany()
  await Task.deleteMany()
  await new User(userOne).save()
  await new User(userTwo).save()
  await new Task(taskOne).save()
  await new Task(taskTwo).save()
}

module.exports = {
  userOnId,
  userOne,
  userTwo,
  userTwoID,
  taskOne,
  taskTwo,
  setupDatabase
}
