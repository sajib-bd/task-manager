import nodemailer from "nodemailer";

export const EmailVerifyLink = async (email, verifyUrl) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const host = process.env.DOMAIN_HOST;
  const verificationLink = `${host}/api/v1/auth/email-verify/${verifyUrl}`;

  const mailOptions = {
    from: ` Task Manager ${process.env.MAIL_USERNAME}`,
    to: email,
    subject: "Task Manager Email Verification",
    html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #f36b21; font-size: 24px; text-align: center; margin-bottom: 20px;">Task Manager Email Verification</h2>
    <p style="font-size: 16px;">Hello,</p>
    <p style="font-size: 16px;">To complete your registration and verify your email address, please click the link below:</p>
    <p style="text-align: center; margin: 20px 0;">
      <a href="${verificationLink}" style="font-size: 18px; color: white; background-color: #f36b21; padding: 12px 24px; border-radius: 5px; text-decoration: none;">Verify Email</a>
    </p>
    <p style="font-size: 16px;">This link will be valid for the next 5 minutes.</p>
    <p style="font-size: 14px; color: #777;">If you did not create an account, you can safely ignore this email.</p>
    <p style="font-size: 16px;">Thank you for using Task Manager!</p>
    <p style="font-size: 16px;">Best Regards,<br>Team Task Manager</p>
    <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">Please do not reply to this email. This is an automated message.</p>
  </div>
</div>
`,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export const EmailCode = async (email, code) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `Task Manager ${process.env.MAIL_USERNAME}`,
    to: email,
    subject: "Task Manager OTP",
    html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #f36b21; font-size: 24px; text-align: center; margin-bottom: 20px;">Task Manager OTP</h2>
      <p style="font-size: 16px;">Hello,</p>
      <p style="font-size: 16px;">Your OTP code is: <span style="font-size: 28px; font-weight: bold; color: #f36b21; background-color: #fff3e0; padding: 10px 20px; border-radius: 5px;">${code}</span></p>
      <p style="font-size: 16px;">This code is valid for the next 5 minutes.</p>
      <p style="font-size: 14px; color: #777;">If you did not request this verification, please ignore this email.</p>
      <p style="font-size: 16px;">Thank you for choosing Task Manager!</p>
      <p style="font-size: 16px;">Best Regards,<br>Team Task Manager</p>
      <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">Please do not reply to this email. This is an automated message.</p>
    </div>
  </div>`,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
