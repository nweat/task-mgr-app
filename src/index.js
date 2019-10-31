const express = require("express")
require("./db/mongoose") //connect to mongoose
const app = require("./app")

const port = process.env.PORT

app.listen(port, () => {
  console.log("Server is listening on port " + port)
})
