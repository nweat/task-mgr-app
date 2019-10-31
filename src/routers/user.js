const express = require("express")
const multer = require("multer")
const sharp = require("sharp")
const router = new express.Router()
const auth = require("../middleware/auth")
const User = require("../models/user")
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account")

const upload = multer({
  //dest: "avatars", //remove dest so we can get access to the file
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"))
    }
    cb(undefined, true)
  }
})

router.get("/users/me", auth, async (req, res) => {
  try {
    //const users = await User.find({})
    res.send(req.user)
  } catch (e) {
    res.status(500).send()
  }
})

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }
    //set response header to image to display image
    res.set("Content-Type", "image/png")
    res.send(user.avatar)
  } catch (e) {
    res.status(404).send()
  }
})

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ["name", "email", "password", "age"]
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid" })
  }

  try {
    //const user = await User.findById(req.params.id)
    //use this method to update because findByIdAndUpdate ignores middleware
    //and this way only updates what we need to
    updates.forEach(update => (req.user[update] = req.body[update])) // need to use this method to apply "save" middlewarre
    await req.user.save()
    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post("/users", async (req, res) => {
  console.log(req.body)
  const user = new User(req.body)
  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send()
  }
})

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .png()
      .resize({ width: 250, heigth: 250 })
      .toBuffer()
    req.user.avatar = buffer //get binary data of file only if dest option not supplied
    await req.user.save()
    res.send()
  },
  (error, req, res, next) => {
    //must follow this call signature
    res.status(400).send({ error: error.message })
  }
)

router.delete("/users/me", auth, async (req, res) => {
  const _id = req.params.id
  try {
    // const user = await User.findByIdAndDelete(req.user_id)
    // if (!user) {
    //   return res.status(404).send()
    // }
    await req.user.remove()
    sendCancelationEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(500).send()
  }
})

router.delete(
  "/users/me/avatar",
  auth,
  async (req, res) => {
    req.user.avatar = undefined //delete the field
    await req.user.save()
    res.send()
  },
  (error, req, res, next) => {
    //must follow this call signature
    res.status(400).send({ error: error.message })
  }
)

module.exports = router
