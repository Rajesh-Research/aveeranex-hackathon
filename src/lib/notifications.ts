import nodemailer from 'nodemailer';
import { User } from './types';

interface NotificationConfig {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  recipientEmail: string;
  googleSheetsWebhookUrl?: string;
}

const config: NotificationConfig = {
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  recipientEmail: process.env.NOTIFICATION_EMAIL || 'info@aveeranex.com',
  googleSheetsWebhookUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL,
};

/**
 * Sends an email notification to Super Admin (info@aveeranex.com) on new registration
 */
export async function sendRegistrationEmailAlert(user: User): Promise<boolean> {
  try {
    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
      console.log(`[Email Alert] New participant registered: ${user.name} (${user.email}). Configure SMTP_HOST/SMTP_USER/SMTP_PASS in Vercel to receive real emails at ${config.recipientEmail}`);
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    const mailOptions = {
      from: `"AVEERANEX Hackathon Portal" <${config.smtpUser}>`,
      to: config.recipientEmail,
      subject: `🚀 New Participant Registration: ${user.name} (Team: ${user.teamName})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050b14; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #1e3a5f;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #067f92; margin: 0; text-transform: uppercase; letter-spacing: 2px;">AVEERANEX INNOVATE HACKATHON</h2>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">New Participant Registration Alert</p>
          </div>

          <div style="background: #0d223f; padding: 18px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #1e3a5f;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; width: 140px;"><strong>Participant Name:</strong></td>
                <td style="padding: 8px 0; color: #ffffff; font-weight: bold;">${user.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Team Name:</strong></td>
                <td style="padding: 8px 0; color: #00b4d8; font-weight: bold;">${user.teamName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Email Address:</strong></td>
                <td style="padding: 8px 0; color: #ffffff;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Contact Phone:</strong></td>
                <td style="padding: 8px 0; color: #ffffff;">${user.contact}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;"><strong>College / University:</strong></td>
                <td style="padding: 8px 0; color: #ffffff;">${user.college}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Location & State:</strong></td>
                <td style="padding: 8px 0; color: #ffffff;">${user.location}, ${user.state} - ${user.pincode} (${user.country})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Topic Title:</strong></td>
                <td style="padding: 8px 0; color: #38bdf8; font-weight: bold;">${user.topicTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Topic Domain:</strong></td>
                <td style="padding: 8px 0; color: #10b981;">${user.topicDomain}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Presented On:</strong></td>
                <td style="padding: 8px 0; color: #ffffff;">${user.presentedOn}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Registered At:</strong></td>
                <td style="padding: 8px 0; color: #94a3b8;">${new Date().toLocaleString('en-GB')}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://aveeranex-hackathon.vercel.app/admin" style="background: #067f92; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Open Super Admin Console to Approve Certificate
            </a>
          </div>

          <div style="text-align: center; margin-top: 24px; border-top: 1px solid #1e3a5f; padding-top: 14px; font-size: 11px; color: #64748b;">
            AVEERANEX (OPC) PRIVATE LIMITED &bull; Research &bull; Technology &bull; Innovation
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Alert] Registration alert sent successfully to ${config.recipientEmail} for ${user.name}`);
    return true;
  } catch (err) {
    console.error('[Email Alert Error]', err);
    return false;
  }
}

/**
 * Syncs participant registration directly to Google Sheets via Webhook
 */
export async function syncToGoogleSheets(user: User): Promise<boolean> {
  try {
    const webhookUrl = config.googleSheetsWebhookUrl;
    if (!webhookUrl) {
      console.log(`[Google Sheets] Webhook URL not set. Add GOOGLE_SHEETS_WEBHOOK_URL to Vercel environment variables to enable live spreadsheet sync.`);
      return false;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      name: user.name,
      teamName: user.teamName,
      email: user.email,
      contact: user.contact,
      college: user.college,
      location: user.location,
      state: user.state,
      country: user.country,
      pincode: user.pincode,
      topicTitle: user.topicTitle,
      topicDomain: user.topicDomain,
      presentedOn: user.presentedOn,
      status: user.certificateStatus,
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`[Google Sheets] Synced row for participant: ${user.name}`);
      return true;
    } else {
      console.warn(`[Google Sheets] Sync returned status: ${res.status}`);
      return false;
    }
  } catch (err) {
    console.error('[Google Sheets Sync Error]', err);
    return false;
  }
}

/**
 * Sends Registration Confirmation Email directly to the Participant
 */
export async function sendParticipantWelcomeEmail(user: User): Promise<boolean> {
  try {
    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
      console.log(`[Confirmation Email] Registration confirmation queued for participant: ${user.email}`);
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    const mailOptions = {
      from: `"AVEERANEX HACKATHON" <${config.smtpUser}>`,
      to: user.email,
      subject: `🎉 Registration Confirmed: AVEERANEX INNOVATE ONLINE HACKATHON`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050b14; color: #f8fafc; padding: 28px; border-radius: 12px; border: 1px solid #1e3a5f;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #00b4d8; margin: 0; text-transform: uppercase; letter-spacing: 2px;">AVEERANEX INNOVATE</h2>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Registration Confirmation & Certificate Portal</p>
          </div>

          <div style="background: #0d223f; padding: 20px; border-radius: 10px; border: 1px solid #1e3a5f; margin-bottom: 24px;">
            <h3 style="color: #ffffff; margin-top: 0;">Welcome, ${user.name}!</h3>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
              Your participation record has been successfully registered for the <strong>AVEERANEX INNOVATE ONLINE HACKATHON</strong>.
            </p>

            <div style="margin: 18px 0; padding: 14px; background: #050b14; border-radius: 8px; border: 1px solid #1e3a5f; font-size: 13px;">
              <p style="margin: 4px 0; color: #94a3b8;"><strong>Team:</strong> <span style="color: #38bdf8;">${user.teamName}</span></p>
              <p style="margin: 4px 0; color: #94a3b8;"><strong>Topic:</strong> <span style="color: #ffffff;">${user.topicTitle}</span></p>
              <p style="margin: 4px 0; color: #94a3b8;"><strong>Domain:</strong> <span style="color: #10b981;">${user.topicDomain}</span></p>
              <p style="margin: 4px 0; color: #94a3b8;"><strong>College:</strong> <span style="color: #ffffff;">${user.college}</span></p>
            </div>

            <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
              To claim your official certificate of participation, log in to your dashboard and click <strong>"Generate Certificate"</strong>. Once approved by the Super Admin, your certificate will be available for instant high-definition download and social sharing.
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://aveeranex-hackathon.vercel.app/dashboard" style="background: #067f92; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Go to Your Dashboard
            </a>
          </div>

          <div style="text-align: center; border-top: 1px solid #1e3a5f; padding-top: 16px; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 6px 0;">AVEERANEX (OPC) PRIVATE LIMITED &bull; Director: Dr. Rajesh Kumar</p>
            <p style="margin: 0;"><a href="https://www.aveeranex.com" style="color: #00b4d8; text-decoration: none;">www.aveeranex.com</a> &bull; <a href="https://www.aveeranex.com/products/learn" style="color: #10b981; text-decoration: none;">AVEERANEX LEARN</a></p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Confirmation Email] Welcome email sent successfully to ${user.email}`);
    return true;
  } catch (err) {
    console.error('[Welcome Email Error]', err);
    return false;
  }
}

/**
 * Sends Password Reset Email to Participant
 */
export async function sendPasswordResetEmail(user: User, resetLink: string): Promise<boolean> {
  try {
    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
      console.log(`[Password Reset] Password reset link for ${user.email}: ${resetLink}`);
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    const mailOptions = {
      from: `"AVEERANEX Security" <${config.smtpUser}>`,
      to: user.email,
      subject: `🔒 Password Reset Request - AVEERANEX Hackathon Portal`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050b14; color: #f8fafc; padding: 28px; border-radius: 12px; border: 1px solid #1e3a5f;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #00b4d8; margin: 0; text-transform: uppercase; letter-spacing: 2px;">AVEERANEX SECURITY</h2>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Password Reset Request</p>
          </div>

          <div style="background: #0d223f; padding: 20px; border-radius: 10px; border: 1px solid #1e3a5f; margin-bottom: 24px;">
            <h3 style="color: #ffffff; margin-top: 0;">Hello ${user.name},</h3>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
              We received a request to reset the password for your account (<strong>${user.email}</strong>). Click the button below to set a new password:
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" style="background: #067f92; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                Reset My Password
              </a>
            </div>

            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
              This link is valid for 1 hour. If you did not request this password reset, you can safely ignore this email — your password will remain unchanged.
            </p>

            <p style="color: #64748b; font-size: 11px; word-break: break-all; margin-top: 14px;">
              Direct link: <a href="${resetLink}" style="color: #38bdf8;">${resetLink}</a>
            </p>
          </div>

          <div style="text-align: center; border-top: 1px solid #1e3a5f; padding-top: 16px; font-size: 12px; color: #64748b;">
            AVEERANEX (OPC) PRIVATE LIMITED &bull; Security & Verification Department
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Password Reset] Reset email sent successfully to ${user.email}`);
    return true;
  } catch (err) {
    console.error('[Password Reset Email Error]', err);
    return false;
  }
}

