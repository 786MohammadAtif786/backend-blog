

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
    //const verifyUrl = `${process.env.FRONTEND_URL}/verify/${token}`;
    const url = "https://frontend-blog-alpha-ten.vercel.app/"
    const verifyUrl = `${url}/verify/${token}`
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM, // ⚠️ verified email
      subject: "Verify Your Email",
      // html: `
      //   <h2>Welcome 🎉</h2>
      //   <p>Click below to verify your account:</p>
      //   <a href="${verifyUrl}" style="color:blue;font-weight:bold;">
      //     Verify Email
      //   </a>
      // `

      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; text-align: center;">

      <!-- Logo / Title -->
      <h1 style="color: #6b21a8; margin-bottom: 10px;">
        DevNotes 🚀
      </h1>

      <!-- Welcome -->
      <h2 style="color: #333;">
        Welcome to DevNotes 🎉
      </h2>

      <p style="color: #555; font-size: 16px;">
        We're excited to have you on board!  
        Please verify your email to start exploring amazing blogs.
      </p>

      <!-- Button -->
      <a href="${verifyUrl}" 
         style="
           display: inline-block;
           margin-top: 20px;
           padding: 12px 20px;
           background-color: #6b21a8;
           color: #ffffff;
           text-decoration: none;
           border-radius: 6px;
           font-weight: bold;
         ">
        Verify Your Email
      </a>

      <!-- Fallback link -->
      <p style="margin-top: 20px; font-size: 14px; color: #777;">
        If the button doesn't work, copy & paste this link:
      </p>

      <p style="word-break: break-all; font-size: 13px; color: #6b21a8;">
        ${verifyUrl}
      </p>

      <!-- Footer -->
      <hr style="margin: 30px 0;" />

      <p style="font-size: 12px; color: #999;">
        If you didn't create this account, you can safely ignore this email.
      </p>

      <p style="font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} DevNotes. All rights reserved.
      </p>

    </div>
  </div>
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