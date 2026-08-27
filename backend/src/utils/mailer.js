import nodemailer from 'nodemailer';

const getCleanEnv = (val) => (val ? val.replace(/["']/g, '').trim() : '');

const createTransporter = () => {
  const user = getCleanEnv(process.env.GMAIL_USER);
  const pass = getCleanEnv(process.env.GMAIL_APP_PASS);

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user,
      pass,
    },
  });
};

export const sendOTPEmail = async (email, otp, fullname = 'Creator') => {
  const user = getCleanEnv(process.env.GMAIL_USER);
  const pass = getCleanEnv(process.env.GMAIL_APP_PASS);

  const mailOptions = {
    from: `"NoAdTube Security" <${user || 'noadtube@gmail.com'}>`,
    to: email,
    subject: `Your NoAdTube Verification Code: ${otp}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NoAdTube Verification Code</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #0f0f0f;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #f1f1f1;
          }
          .container {
            max-width: 540px;
            margin: 30px auto;
            background-color: #181818;
            border-radius: 16px;
            border: 1px solid #282828;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          .header {
            padding: 28px 24px;
            text-align: center;
            background: linear-gradient(180deg, rgba(255,0,0,0.15) 0%, rgba(24,24,24,0) 100%);
            border-bottom: 1px solid #282828;
          }
          .logo {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #ffffff;
            display: inline-block;
          }
          .logo-accent {
            color: #FF0000;
          }
          .content {
            padding: 32px 28px;
            text-align: center;
          }
          .title {
            font-size: 20px;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 12px 0;
          }
          .message {
            font-size: 14px;
            line-height: 1.6;
            color: #aaaaaa;
            margin: 0 0 28px 0;
          }
          .otp-box {
            background-color: #0d0d0d;
            border: 2px dashed #FF0000;
            border-radius: 12px;
            padding: 20px;
            margin: 0 auto 28px auto;
            display: inline-block;
            min-width: 220px;
          }
          .otp-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 34px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #ffffff;
            margin: 0;
          }
          .expiry-badge {
            display: inline-block;
            font-size: 12px;
            font-weight: 600;
            color: #ff8888;
            background: rgba(255, 0, 0, 0.1);
            padding: 6px 14px;
            border-radius: 20px;
            margin-bottom: 24px;
          }
          .footer {
            padding: 20px 24px;
            text-align: center;
            border-top: 1px solid #282828;
            background-color: #121212;
            font-size: 12px;
            color: #717171;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NoAd<span class="logo-accent">Tube</span></div>
          </div>
          <div class="content">
            <h1 class="title">Verify Your Email</h1>
            <p class="message">
              Hi <strong>${fullname}</strong>, thank you for joining <strong>NoAdTube</strong>. Please enter the verification code below to verify your email address and activate your account.
            </p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <div>
              <span class="expiry-badge">⏱️ Valid for 10 minutes</span>
            </div>
            <p class="message" style="font-size: 12px; color: #717171; margin-bottom: 0;">
              If you didn't create a NoAdTube account, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            © 2026 NoAdTube • Ad-Free Video Streaming & Community Platform
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`\n✅ [NoAdTube Email Sent] MessageId: ${info.messageId} to ${email}`);
    return info;
  } catch (error) {
    console.error(`\n⚠️ [Nodemailer SMTP Warning]:`, error.message);
    console.log(`=======================================================`);
    console.log(`🔑 [NoAdTube OTP Fallback] Verification code for ${email}: ${otp}`);
    console.log(`⏱️ Code expires in 10 minutes`);
    console.log(`=======================================================\n`);
    return { fallback: true, otp };
  }
};
