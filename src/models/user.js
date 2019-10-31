const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require("./task")

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is required")
        }
      }
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be positive number")
        }
      }
    },
    password: {
      type: String,
      trim: true,
      minlength: 7,
      required: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"')
        }
      }
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    avatar: {
      type: Buffer
    }
  },
  {
    timestamps: true
  }
)

//"methods" attached to a user instance

//toJSON() used to hide certain data from the user
userSchema.methods.toJSON = function() {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  return userObject
}

//create a virtual relationship between task and user
//not stored in the database
// just to know who owns the tasks
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id", //the relationship between user and task
  foreignField: "owner"
})

userSchema.methods.generateAuthToken = async function() {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

//attached to the user model
userSchema.statics.findByCredentials = async (email, pwd) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error("Unable to login")
  }
  const isMatch = await bcrypt.compare(pwd, user.password)
  if (!isMatch) {
    throw new Error("Unable to login")
  }
  return user
}

//cant use arrow function as we want access to this
//"pre" runs before user is saved
userSchema.pre("save", async function(next) {
  const user = this
  console.log("just before saving")
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

//delete task when user is removed - cascade delete
userSchema.pre("remove", async function(next) {
  const user = this
  await Task.deleteMany({ owner: user._id })
  next()
})

const User = mongoose.model("User", userSchema)

module.exports = User
