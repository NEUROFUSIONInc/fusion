const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const { error } = require("console");

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = "YOUR_REFRESH_TOKEN";

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

async function sendMail(from, to, subject, text, html) {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "ore@usefusion.app",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
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

    const mailResponse = await sendMail(
      "NeuroFusion Contact <ore@usefusion.app>",
      "contact@usefusion.app",
      `Website Contact Form Submission by ${email}`,
      `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    );

    if (mailResponse instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(200).json({ message: "Email sent successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

// sendMail()
//   .then((result) => console.log("Email sent...", result))
//   .catch((error) => console.log(error.message));
