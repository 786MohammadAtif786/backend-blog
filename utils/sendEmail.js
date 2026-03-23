

import nodemailer from "nodemailer";

// export const sendEmail = async (email, token) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS
//       }
//     });

//     console.log("Sending email to:", email);


//     const verifyUrl = `${process.env.FRONTEND_URL}/verify/${token}`;

//     await transporter.sendMail({
//       from: process.env.SMTP_USER,
//       to: email,
//       subject: "Verify Email",
//       html: `<a href="${verifyUrl}">Verify your email</a>`
//     });

//   } catch (err) {
//     console.log(err);
    
//     console.log("EMAIL FAIL ❌", err.message);
//   }
// };



import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (email, token) => {
  try {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${token}`;

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM, // ⚠️ verified email
      subject: "Verify Your Email",
      html: `
        <h2>Welcome 🎉</h2>
        <p>Click below to verify your account:</p>
        <a href="${verifyUrl}" style="color:blue;font-weight:bold;">
          Verify Email
        </a>
      `
    };

    await sgMail.send(msg);

    console.log("✅ Email sent successfully");

  } catch (error) {
    console.log("❌ EMAIL ERROR:", error.response?.body || error.message);
  }
};




export const sendTOPublishBlog = async ({ to, subject, html }) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"DevNotes" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};