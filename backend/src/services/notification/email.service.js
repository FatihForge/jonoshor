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
   * Send account email verification code & link
   */
  async sendVerificationEmail({ email, fullName, token, code }) {
    const frontendBase = (ENV.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const verificationUrl = `${frontendBase}/verify-email?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code || '')}&token=${encodeURIComponent(token || '')}`;

    // Log dispatch intent in development with code for easy debugging
    if (ENV.NODE_ENV === 'development') {
      logger.info(`[EMAIL_VERIFICATION] Dispatched for ${email} with 6-digit code [${code}]`);
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      logger.warn(`No SMTP transporter available. Verification email to ${email} (code: ${code}) skipped.`);
      return { sent: false };
    }

    try {
      const from = `"${ENV.EMAIL_FROM_NAME || 'জনস্বর (JonoShor)'}" <${ENV.EMAIL_FROM_ADDRESS || ENV.EMAIL_USER}>`;
      const mailOptions = {
        from,
        to: email,
        subject: `জনস্বর (JonoShor) — আপনার ভেরিফিকেশন কোড: ${code}`,
        html: `
          <div style="font-family: Arial, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #334155;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #38bdf8; margin: 0; font-size: 26px; font-weight: bold;">জনস্বর (JonoShor)</h1>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">নাগরিক অভিযোগ ও সুরক্ষা প্ল্যাটফর্ম</p>
            </div>
            
            <div style="background: #1e293b; padding: 24px; border-radius: 8px; border: 1px solid #475569;">
              <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">স্বাগতম, ${fullName || 'ব্যবহারকারী'}!</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                জনস্বর প্ল্যাটফর্মে আপনার অ্যাকাউন্ট নিবন্ধনের জন্য ধন্যবাদ। প্ল্যাটফর্মের নিরাপত্তা নিশ্চিত করতে আপনার রেজিস্ট্রেশন স্ক্রিনে নিচের ৬-সংখ্যার ভেরিফিকেশন কোডটি প্রদান করুন:
              </p>

              <div style="background: #020617; padding: 20px; border-radius: 10px; border: 2px dashed #0284c7; text-align: center; margin: 24px 0;">
                <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 8px 0; font-weight: bold;">
                  আপনার ৬-সংখ্যার ভেরিফিকেশন কোড (OTP)
                </p>
                <div style="font-size: 38px; font-weight: 900; letter-spacing: 0.3em; color: #38bdf8; font-family: 'Courier New', Courier, monospace; padding: 4px 0;">
                  ${code}
                </div>
                <p style="color: #64748b; font-size: 11px; margin: 8px 0 0 0;">
                  কোডটির মেয়াদ পরবর্তী ২৪ ঘণ্টা পর্যন্ত থাকবে।
                </p>
              </div>
              
              <div style="text-align: center; margin: 24px 0 12px 0;">
                <p style="color: #94a3b8; font-size: 13px; margin-bottom: 12px;">অথবা সরাসরি নিচের বোতামে ক্লিক করে ভেরিফাই করুন:</p>
                <a href="${verificationUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 8px; display: inline-block;">
                  সরাসরি ইমেইল যাচাই করুন (Verify Email)
                </a>
              </div>
              
              <p style="color: #94a3b8; font-size: 12px; margin-top: 20px; word-break: break-all;">
                সরাসরি লিঙ্ক:<br/>
                <a href="${verificationUrl}" style="color: #38bdf8;">${verificationUrl}</a>
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 20px;">
              এই কোড ও লিঙ্কটি পরবর্তী ২৪ ঘণ্টার জন্য কার্যকর থাকবে। আপনি যদি এই অ্যাকাউন্ট খোলার অনুরোধ না করে থাকেন, তবে নির্দ্বিধায় এই ইমেইলটি উপেক্ষা করুন।
            </p>
          </div>
        `,
        text: `স্বাগতম ${fullName || 'ব্যবহারকারী'}!\n\nজনস্বর প্ল্যাটফর্মে আপনার ইমেইল যাচাইয়ের ৬-সংখ্যার কোড:\n>>> ${code} <<<\n\nঅথবা সরাসরি এই লিঙ্কে যান:\n${verificationUrl}\n\nএই কোড ও লিঙ্কটি ২৪ ঘণ্টা সক্রিয় থাকবে।`,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email} (code: ${code}): ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (err) {
      logger.error(`Failed to send verification email to ${email}:`, err.message);
      return { sent: false, error: err.message };
    }
  }

  /**
   * Send password reset instructions link
   */
  async sendPasswordResetEmail({ email, fullName, token }) {
    const frontendBase = (ENV.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const resetUrl = `${frontendBase}/reset-password?token=${encodeURIComponent(token)}`;

    // Log dispatch intent in development without logging raw reset token or URL
    if (ENV.NODE_ENV === 'development') {
      logger.info(`[PASSWORD_RESET] Password reset email dispatched for ${email}`);
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      logger.warn(`No SMTP transporter available. Password reset email to ${email} skipped.`);
      return { sent: false };
    }

    try {
      const from = `"${ENV.EMAIL_FROM_NAME || 'জনস্বর (JonoShor)'}" <${ENV.EMAIL_FROM_ADDRESS || ENV.EMAIL_USER}>`;
      const mailOptions = {
        from,
        to: email,
        subject: 'জনস্বর (JonoShor) — পাসওয়ার্ড রিসেট নির্দেশাবলী',
        html: `
          <div style="font-family: Arial, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #334155;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #10b981; margin: 0; font-size: 26px; font-weight: bold;">জনস্বর (JonoShor)</h1>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">নাগরিক অভিযোগ ও সুরক্ষা প্ল্যাটফর্ম</p>
            </div>
            
            <div style="background: #1e293b; padding: 24px; border-radius: 8px; border: 1px solid #475569;">
              <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">পাসওয়ার্ড রিসেট অনুরোধ</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                প্রিয় ${fullName || 'ব্যবহারকারী'}, আপনার জনস্বর অ্যাকাউন্টের পাসওয়ার্ড রিসেটের একটি অনুরোধ পাওয়া গেছে। নতুন পাসওয়ার্ড সেট করতে নিচের বোতামে ক্লিক করুন:
              </p>
              
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetUrl}" style="background-color: #059669; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; font-size: 15px; border-radius: 8px; display: inline-block;">
                  পাসওয়ার্ড রিসেট করুন
                </a>
              </div>
              
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
                বোতামে কাজ না করলে নিচের লিঙ্কটি সরাসরি আপনার ব্রাউজারে খুলুন:<br/>
                <a href="${resetUrl}" style="color: #38bdf8; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 20px;">
              এই লিঙ্কটি পরবর্তী ১ ঘণ্টার জন্য কার্যকর থাকবে। আপনি যদি এই অনুরোধ না করে থাকেন, তবে নির্দ্বিধায় এই ইমেইলটি উপেক্ষা করুন; আপনার অ্যাকাউন্ট নিরাপদ থাকবে।
            </p>
          </div>
        `,
        text: `প্রিয় ${fullName || 'ব্যবহারকারী'}!\n\nজনস্বর অ্যাকাউন্টের পাসওয়ার্ড রিসেট করতে এই লিঙ্কে যান:\n${resetUrl}\n\nএই লিঙ্কটি ১ ঘণ্টা সক্রিয় থাকবে।`,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (err) {
      logger.error(`Failed to send password reset email to ${email}:`, err.message);
      return { sent: false, error: err.message };
    }
  }

  /**
   * Send Join Us application confirmation email
   */
  async sendJoinUsConfirmationEmail({ email, fullName, role = null }) {
    if (ENV.NODE_ENV === 'development') {
      logger.info(`[JOIN_US_EMAIL] Join Us confirmation email dispatched for ${email}`);
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      logger.warn(`No SMTP transporter available. Join Us confirmation email to ${email} skipped.`);
      return { sent: false };
    }

    try {
      const from = `"${ENV.EMAIL_FROM_NAME || 'জনস্বর (JonoShor)'}" <${ENV.EMAIL_FROM_ADDRESS || ENV.EMAIL_USER}>`;
      const mailOptions = {
        from,
        to: email,
        subject: 'জনস্বর (JonoShor) — আপনার আবেদনটি সফলভাবে গৃহীত হয়েছে',
        html: `
          <div style="font-family: Arial, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #334155;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #10b981; margin: 0; font-size: 26px; font-weight: bold;">জনস্বর (JonoShor)</h1>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">নাগরিক অধিকার ও সুরক্ষা প্ল্যাটফর্ম</p>
            </div>
            
            <div style="background: #1e293b; padding: 24px; border-radius: 8px; border: 1px solid #475569;">
              <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">প্রিয় ${fullName || 'আবেদনকারী'},</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                জনস্বর (JonoShor) প্ল্যাটফর্মে অবদান রাখার আগ্রহ প্রকাশ করার জন্য আপনাকে আন্তরিক ধন্যবাদ।${role ? ` আপনার আবেদনটি <strong>${role}</strong> ভূমিকায় গৃহীত হয়েছে।` : ''}
              </p>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                আমাদের পর্যালোচক দল আপনার আবেদনটি পর্যালোচনা করবে। পর্যালোচনার পর পরবর্তী পদক্ষেপ সম্পর্কে এই ইমেইলের মাধ্যমে আপনার সাথে যোগাযোগ করা হবে।
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 20px;">
              এই ইমেইলটি স্বয়ংক্রিয়ভাবে প্রেরিত। কোনো তথ্যের প্রয়োজন হলে আমাদের সাথে যোগাযোগ করুন।
            </p>
          </div>
        `,
        text: `প্রিয় ${fullName || 'আবেদনকারী'},\n\nজনস্বর প্ল্যাটফর্মে অবদান রাখার আগ্রহ প্রকাশের জন্য ধন্যবাদ। আপনার আবেদনটি সফলভাবে জমা হয়েছে। পর্যালোচনার পর আমাদের দল আপনার সাথে যোগাযোগ করবে।`,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Join Us confirmation email sent to ${email}: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (err) {
      logger.error(`Failed to send Join Us confirmation email to ${email}:`, err.message);
      return { sent: false, error: err.message };
    }
  }
}

export const emailService = new EmailService();
