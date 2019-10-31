const express = require("express")
require("./db/mongoose") //connect to mongoose

const userRouter = require("./routers/user")
const taskRouter = require("./routers/task")

const app = express()
const port = process.env.PORT

app.use(express.json()) //parse incoming to json
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
  console.log("Server is listening on port " + port)
})
