import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "example@gmail.com",
    pass: "password",
  },
  from: "example@gmail.com",
});

const sendMail = (email: string, password: string) =>
  transporter.sendMail({
    from: '"NoteDealer Support Team', // sender address
    to: email, // list of receivers
    subject: "Password reset for " + email, // Subject line
    text:
      "Cześć, zresetowaliśmy Twoje hasło.\n" +
      "Twoje nowe hasło to: " +
      password +
      ". Prosimy o niezwłoczną zmianę hasła na własne w ustawieniach profilu użytkownika.\n" +
      "Pozdrawiamy,\n" +
      "NoteDealer Support Team.", // plain text body
    html:
      "<h1>Cześć, zresetowaliśmy Twoje hasło.\n</h1>" +
      "<p>Twoje nowe hasło to: " +
      password +
      ".</p>" +
      "<p>Prosimy o niezwłoczną zmianę hasła na własne w ustawieniach profilu użytkownika.\n</p>" +
      "<p>Pozdrawiamy,\n<br>" +
      "NoteDealer Support Team.</p>", // plain text body, // html body
  });

export default sendMail;
