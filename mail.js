const axios = require("axios");
require("dotenv").config();

const apiUrl = "https://api.brevo.com/v3/smtp/email";
const apiKey = process.env.brevo_secret;

const sendEmailVerification = async (email, name, link) => {
    // return
    const requestData = {
    sender: {
      name: "Odunayo from AppClick Editor",
      email: "donotreply@appclickeditor.com",
    },
    to: [
      {
        email,
        name,
      },
    ],
    subject: "Verify Your Account",
    htmlContent: `
    <html>
  <head>
    <meta charset="utf-8" />
    <title>Verify Account</title>
    <style>
      body, #bodyTable {
        margin: 0;
        padding: 0;
        width: 100% !important;
      }
      table {
        border-collapse: collapse;
      }
      td {
        font-family: Arial, sans-serif;
        font-size: 18px;
        color: #333333;
      }
      #bodyTable {
        background-color: #f4f4f4;
      }
      #emailContainer {
        background-color: white;
        max-width: 600px;
        margin: 0 auto;
      }
      #header {
        font-size: 20px;
        padding-left: 40px;
        padding-top: 30px;
        padding-bottom: 10px;
        color: #63c5da;
      }
      #body {
        padding: 40px;
      }
      .button {
        display: inline-block;
        margin: 10px 0;
        padding: 12px 24px;
        background-color: #63c5da;
        color: white !important;
        font-size: 16px;
        font-weight: bold;
        text-decoration: none;
        border-radius: 4px;
      }
      #footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <table id="bodyTable" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <table id="emailContainer" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td id="header">
                <h1>AppClick Editor</h1>
              </td>
            </tr>
            <tr>
              <td id="body">
                <p>Hello ${name},</p>
                <p>
                  You are seeing this mail because you are logging in to this service for the first time. Please click on the link below to verify your account.
                </p>
                <a class="button" href="${link}">Verify Your Account</a>
              </td>
            </tr>
            <tr>
              <td id="footer">&copy; 2024 AppClick Editor. All rights reserved.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
  };

  try {
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
    });
    console.log("Email sent successfully:", email, name, response.status);
    return response.status;
  } catch (error) {
    console.error("Error sending email:", error.response);
  }
};

module.exports = sendEmailVerification;
