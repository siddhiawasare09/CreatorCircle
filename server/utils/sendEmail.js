import nodemailer from "nodemailer";

const logDevelopmentResetLink = (resetToken) => {
  const clientUrl =
    process.env.CLIENT_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  console.log(`[DEV] Password Reset Link: ${resetUrl}`);
};

const sendEmail = async ({ to, subject, resetToken }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, CLIENT_URL } =
    process.env;
  const port = Number(SMTP_PORT);

  if (
    !SMTP_HOST ||
    SMTP_PORT === undefined ||
    !Number.isInteger(port) ||
    port <= 0 ||
    port > 65535 ||
    !SMTP_USER ||
    !SMTP_PASS ||
    !EMAIL_FROM ||
    !CLIENT_URL
  ) {
    logDevelopmentResetLink(resetToken);
    return;
  }
  const resetUrl = `${CLIENT_URL.replace(/\/$/, "")}/reset-password/${resetToken}`;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
  } catch (error) {
    console.error("[Email] SMTP verification failed; using development fallback:", {
      name: error instanceof Error ? error.name : "Unknown error",
      code: error?.code,
    });
    logDevelopmentResetLink(resetToken);
    return;
  }

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    text: `Reset your CreatorCircle password: ${resetUrl}`,
  });
};

export default sendEmail;
