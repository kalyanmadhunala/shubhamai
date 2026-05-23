import { createTransport } from "nodemailer";

// ── Transporter ───────────────────────────────────────────────────────────────
const createTransporter = () => {
  return createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ── Generate 6-digit OTP ──────────────────────────────────────────────────────
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ── Send OTP Email ────────────────────────────────────────────────────────────
export const sendOTPEmail = async ({ to, otp, type }) => {
  const transporter = createTransporter();

  const isSignup = type === "signup";

  const subject = isSignup
    ? `🎉 Verify Your ShubhaMAI Account - ${otp}`
    : `🔑 ShubhaMAI Password Reset OTP ${otp}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
          <td align="center">
            <table width="500" cellpadding="0" cellspacing="0"
              style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

              <!-- Header gradient -->
              <tr>
                <td style="background:linear-gradient(135deg,#00BCD4,#0D47A1);padding:36px 40px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:1px;">
                    ShubhaM.AI
                  </h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                    AI Powered Poster Generator
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:22px;">
                    ${isSignup ? "🎉 Verify Your Account" : "🔑 Reset Your Password"}
                  </h2>
                  <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">
                    ${
                      isSignup
                        ? "Thanks for signing up! Use the OTP below to verify your ShubhaMAI account. It expires in <strong>10 minutes</strong>."
                        : "We received a request to reset your password. Use the OTP below. It expires in <strong>10 minutes</strong>."
                    }
                  </p>

                  <!-- OTP Box -->
                  <div style="background:linear-gradient(135deg,rgba(0,188,212,0.08),rgba(13,71,161,0.08));
                              border:2px solid #00BCD4;border-radius:12px;padding:28px;text-align:center;
                              margin:0 0 28px;">
                    <p style="margin:0 0 8px;color:#777;font-size:13px;letter-spacing:1px;text-transform:uppercase;">
                      Your OTP Code
                    </p>
                    <span style="font-size:42px;font-weight:900;color:#0D47A1;letter-spacing:12px;">
                      ${otp}
                    </span>
                  </div>

                  <p style="margin:0 0 16px;color:#888;font-size:13px;line-height:1.6;">
                    ⏱️ This OTP is valid for <strong>10 minutes</strong>.<br/>
                    🔒 Never share this OTP with anyone.<br/>
                    📧 If you didn't request this, please ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px;background:#f8f9fa;border-top:1px solid #eee;text-align:center;">
                  <p style="margin:0;color:#aaa;font-size:12px;">
                    © ${new Date().getFullYear()} ShubhaMAI · Made with ❤️ in Telangana
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default { generateOTP, sendOTPEmail };
