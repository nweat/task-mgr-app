const request = require("supertest")
const app = require("../src/app")
const User = require("../src/models/user")
const { userOnId, userOne, setupDatabase } = require("./fixtures/db")
//run before each test case
beforeEach(setupDatabase)

afterEach(() => {
  console.log("after each")
})

test("Should sign up a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Nikki",
      email: "nikkiweat@gmail.com",
      password: "nikkinikki"
    })
    .expect(201)

  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  expect(response.body).toMatchObject({
    user: {
      name: "Nikki",
      email: "nikkiweat@gmail.com"
    },
    token: user.tokens[0].token
  })
})

test("Should login user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200)

  const user = await User.findById(userOnId)
  expect(user).not.toBeNull()
})

test("Should not login user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "wrong password"
    })
    .expect(400)
})

test("should get profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test("should not get profile", async () => {
  await request(app)
    .get("/users/me")
    .send()
    .expect(401)
})

test("should delete account", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test("should not delete account for unauthenticated user", async () => {
  await request(app)
    .delete("/users/me")
    .send()
    .expect(401)
})

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/Avatar.png")
    .expect(200)

  const user = await User.findById(userOnId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Nikkuu"
    })
    .expect(200)

  const user = await User.findById(userOnId)
  expect(user.name).toBe("Nikkuu")
})

test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      lastname: "Nikkuu"
    })
    .expect(400)
})
