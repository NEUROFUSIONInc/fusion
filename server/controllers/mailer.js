const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");
const { error } = require("console");

const CLIENT_EMAIL = process.env.GMAIL_CLIENT_EMAIL;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;

// Define the required scopes
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

// Create an OAuth2 client with the given credentials
const auth = new google.auth.JWT(
  CLIENT_EMAIL,
  null,
  CLIENT_SECRET,
  SCOPES,
  "ore@usefusion.app"
);

// const REDIRECT_URI = "https://localhost";
// const REFRESH_TOKEN =
//   "1//04nUNitsdz_ruCgYIARAAGAQSNwF-L9Ir0okxhNE0HiIsPpUYWON4QKmiHTQ0QVGv5EUpMScoj1WbHHx2kVav7ls_QjILibaNV_Y";

// const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// oauth2Client.setCredentials({
//   refresh_token: REFRESH_TOKEN,
// });

async function sendMail(from, to, subject, text, html) {
  try {
    await auth.authorize();

    console.log("here");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        // user: "neurofusion-mailer@neurofusion-422110.iam.gserviceaccount.com",
        user: "ore@usefusion.app",
        scopes: SCOPES,
        clientId: process.env.GMAIL_CLIENT_ID,
        privateKey: process.env.GMAIL_CLIENT_SECRET,
      },
    });

    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      text: text,
    };

    if (html) {
      mailOptions.html = html;
    }

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log(name, email, message);

    const mailResponse = await sendMail(
      "NeuroFusion Contact <ore@usefusion.app>",
      "contact@usefusion.app",
      `Website Contact Form Submission by ${email}`,
      `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    );

    if (mailResponse instanceof Error) {
      console.error(mailResponse);
      return res.status(500).json({ message: error.message });
    } else {
      console.log("Email sent...", mailResponse);
      return res.status(200).json({ message: "Email sent successfully" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error });
  }
};

// sendMail()
//   .then((result) => console.log("Email sent...", result))
//   .catch((error) => console.log(error.message));
