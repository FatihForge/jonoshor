import nodemailer from 'nodemailer';
import { ENV } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter && ENV.EMAIL_USER && ENV.EMAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: ENV.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(ENV.EMAIL_PORT) || 587,
        secure: Boolean(ENV.EMAIL_SECURE),
        auth: {
          user: ENV.EMAIL_USER,
          pass: ENV.EMAIL_PASSWORD,
        },
      });
    }
    return this.transporter;
  }

  /**
   * Send account email verification link
   */
  async sendVerificationEmail({ email, fullName, token }) {
    const verificationUrl = `${ENV.FRONTEND_URL}/#/verify-email?token=${encodeURIComponent(token)}`;

    // Always log in console during development so testing is effortless
    if (ENV.NODE_ENV === 'development') {
      logger.info(`[EMAIL_VERIFICATION] Link for ${email}: ${verificationUrl}`);
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      logger.warn(`No SMTP transporter available. Verification email to ${email} skipped.`);
      return { sent: false, url: verificationUrl };
    }

    try {
      const from = `"${ENV.EMAIL_FROM_NAME || 'জনস্বর (JonoShor)'}" <${ENV.EMAIL_FROM_ADDRESS || ENV.EMAIL_USER}>`;
      const mailOptions = {
        from,
        to: email,
        subject: 'জনস্বর (JonoShor) — আপনার ইমেইল ঠিকানাটি যাচাই করুন',
        html: `
          <div style="font-family: Arial, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #334155;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #10b981; margin: 0; font-size: 26px; font-weight: bold;">জনস্বর (JonoShor)</h1>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">নাগরিক অভিযোগ ও সুরক্ষা প্ল্যাটফর্ম</p>
            </div>
            
            <div style="background: #1e293b; padding: 24px; border-radius: 8px; border: 1px solid #475569;">
              <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">স্বাগতম, ${fullName || 'ব্যবহারকারী'}!</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                জনস্বর প্ল্যাটফর্মে আপনার অ্যাকাউন্ট নিবন্ধনের জন্য ধন্যবাদ। প্ল্যাটফর্মের পূর্ণ সুবিধা ও নিরাপত্তা নিশ্চিত করতে অনুগ্রহ করে নিচের বোতামে ক্লিক করে আপনার ইমেইল যাচাই সম্পন্ন করুন:
              </p>
              
              <div style="text-align: center; margin: 28px 0;">
                <a href="${verificationUrl}" style="background-color: #059669; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; font-size: 15px; border-radius: 8px; display: inline-block;">
                  ইমেইল যাচাই করুন
                </a>
              </div>
              
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
                বোতামে কাজ না করলে নিচের লিঙ্কটি সরাসরি আপনার ব্রাউজারে খুলুন:<br/>
                <a href="${verificationUrl}" style="color: #38bdf8; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 20px;">
              এই লিঙ্কটি পরবর্তী ২৪ ঘণ্টার জন্য কার্যকর থাকবে। আপনি যদি এই অ্যাকাউন্ট খোলার অনুরোধ না করে থাকেন, তবে নির্দ্বিধায় এই ইমেইলটি উপেক্ষা করুন।
            </p>
          </div>
        `,
        text: `স্বাগতম ${fullName || 'ব্যবহারকারী'}!\n\nজনস্বর প্ল্যাটফর্মে আপনার ইমেইল যাচাই করতে এই লিঙ্কে যান:\n${verificationUrl}\n\nএই লিঙ্কটি ২৪ ঘণ্টা সক্রিয় থাকবে।`,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}: ${info.messageId}`);
      return { sent: true, messageId: info.messageId, url: verificationUrl };
    } catch (err) {
      logger.error(`Failed to send verification email to ${email}:`, err.message);
      return { sent: false, error: err.message, url: verificationUrl };
    }
  }
}

export const emailService = new EmailService();
