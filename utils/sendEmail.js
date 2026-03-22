import nodemailer from "nodemailer"

export const sendEmail = async(email,token)=>{

 const transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
   user:process.env.SMTP_USER,
   pass:process.env.SMTP_PASS
  }
 })

 const verifyUrl = `${process.env.FRONTEND_URL}/verify/${token}`

 await transporter.sendMail({
  from:process.env.SMTP_USER,
  to:email,
  subject:"Verify Email",
  html:`<a href="${verifyUrl}">Verify your email</a>`
 })

}


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