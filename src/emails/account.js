const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

const sendWelcomeEmail = (to, name) => {
  sgMail.send({
    to,
    from: "nikkiweat@gmail.com", //set sender authentication in sendgrid to setup custom domain
    subject: "Welcome to Tasky",
    text: `HI ${name}, Welcome to the app.`
  })
}

const sendCancelationEmail = (to, name) => {
  sgMail.send({
    to,
    from: "nikkiweat@gmail.com",
    subject: "Sad to see you go..",
    text: `Goodbye ${name}, Hope to see you back sometiem soon!`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}
