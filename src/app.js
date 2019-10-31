const express = require("express")

require("./db/mongoose") //connect to mongoose
const userRouter = require("./routers/user")
const taskRouter = require("./routers/task")

const app = express()

app.use(express.json()) //parse incoming to json
app.use(userRouter)
app.use(taskRouter)

module.exports = app
