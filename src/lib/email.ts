import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'GymFlow Pro <noreply@gymflowpro.com>';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo,
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  welcome: (data: { name: string; gymName: string; loginUrl: string }) => ({
    subject: `Welcome to ${data.gymName}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #18181b; font-size: 24px; margin: 0 0 16px;">Welcome to ${data.gymName}! 🎉</h1>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${data.name},
              </p>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Your account has been created successfully. You're now part of our fitness community!
              </p>
              <a href="${data.loginUrl}" style="display: inline-block; background: #6366F1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                Log In to Your Account
              </a>
              <p style="color: #a1a1aa; font-size: 14px; margin: 32px 0 0;">
                If you didn't create this account, please ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  membershipConfirmation: (data: {
    name: string;
    gymName: string;
    planName: string;
    amount: string;
    startDate: string;
    endDate: string;
  }) => ({
    subject: `Membership Confirmed - ${data.planName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #18181b; font-size: 24px; margin: 0 0 16px;">Membership Confirmed! ✅</h1>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${data.name},
              </p>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Thank you for joining ${data.gymName}! Your membership has been activated.
              </p>
              <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
                <p style="color: #52525b; font-size: 14px; margin: 0 0 8px;"><strong>Plan:</strong> ${data.planName}</p>
                <p style="color: #52525b; font-size: 14px; margin: 0 0 8px;"><strong>Amount:</strong> ${data.amount}</p>
                <p style="color: #52525b; font-size: 14px; margin: 0 0 8px;"><strong>Start Date:</strong> ${data.startDate}</p>
                <p style="color: #52525b; font-size: 14px; margin: 0;"><strong>Valid Until:</strong> ${data.endDate}</p>
              </div>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                We're excited to have you. See you at the gym! 💪
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  classBookingConfirmation: (data: {
    name: string;
    className: string;
    trainerName: string;
    date: string;
    time: string;
    location: string;
  }) => ({
    subject: `Class Booked: ${data.className}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #18181b; font-size: 24px; margin: 0 0 16px;">Class Booked! 📅</h1>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${data.name},
              </p>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Your class has been booked successfully!
              </p>
              <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
                <p style="color: #52525b; font-size: 14px; margin: 0 0 8px;"><strong>Class:</strong> ${data.className}</p>
                <p style="color: #52525b; font-size: 14px; margin: 0 0 8px;"><strong>Trainer:</strong> ${data.trainerName}</p>
                <p style="color: #52525b; font-size: 14px; margin: 0 0 8px;"><strong>Date:</strong> ${data.date}</p>
                <p style="color: #52525b; font-size: 14px; margin: 0 0 8px;"><strong>Time:</strong> ${data.time}</p>
                <p style="color: #52525b; font-size: 14px; margin: 0;"><strong>Location:</strong> ${data.location}</p>
              </div>
              <p style="color: #a1a1aa; font-size: 14px;">
                Please arrive 10 minutes before the class starts.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  passwordReset: (data: { name: string; resetUrl: string }) => ({
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #18181b; font-size: 24px; margin: 0 0 16px;">Reset Your Password</h1>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${data.name},
              </p>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                We received a request to reset your password. Click the button below to set a new password.
              </p>
              <a href="${data.resetUrl}" style="display: inline-block; background: #6366F1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                Reset Password
              </a>
              <p style="color: #a1a1aa; font-size: 14px; margin: 32px 0 0;">
                This link will expire in 1 hour. If you didn't request this, please ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  paymentReminder: (data: {
    name: string;
    gymName: string;
    amount: string;
    dueDate: string;
    paymentUrl: string;
  }) => ({
    subject: `Payment Reminder - ${data.gymName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #18181b; font-size: 24px; margin: 0 0 16px;">Payment Reminder 💳</h1>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${data.name},
              </p>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Your membership payment of <strong>${data.amount}</strong> is due on <strong>${data.dueDate}</strong>.
              </p>
              <a href="${data.paymentUrl}" style="display: inline-block; background: #6366F1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                Pay Now
              </a>
              <p style="color: #a1a1aa; font-size: 14px; margin: 32px 0 0;">
                To avoid any interruption to your membership, please make your payment before the due date.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
  staffCreatedMemberWelcome: (data: {
    name: string;
    gymName: string;
    email: string;
    password: string;
    loginUrl: string;
  }) => ({
    subject: `Welcome to ${data.gymName} - Your Account Details`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #18181b; font-size: 24px; margin: 0 0 16px;">Welcome to ${data.gymName}!</h1>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${data.name},
              </p>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Your account has been created. Here are your login details:
              </p>
              <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
                <p style="color: #52525b; font-size: 14px; margin: 0 0 8px;"><strong>Email:</strong> ${data.email}</p>
                <p style="color: #52525b; font-size: 14px; margin: 0;"><strong>Password:</strong> ${data.password}</p>
              </div>
              <p style="color: #dc2626; font-size: 14px; margin: 0 0 24px;">
                For security, we recommend changing your password after your first login.
              </p>
              <a href="${data.loginUrl}" style="display: inline-block; background: #6366F1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                Log In to Your Account
              </a>
              <p style="color: #a1a1aa; font-size: 14px; margin: 32px 0 0;">
                If you didn't request this account, please contact the gym directly.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// Helper functions to send specific emails
export async function sendWelcomeEmail(to: string, data: Parameters<typeof emailTemplates.welcome>[0]) {
  const { subject, html } = emailTemplates.welcome(data);
  return sendEmail({ to, subject, html });
}

export async function sendMembershipConfirmationEmail(
  to: string,
  data: Parameters<typeof emailTemplates.membershipConfirmation>[0]
) {
  const { subject, html } = emailTemplates.membershipConfirmation(data);
  return sendEmail({ to, subject, html });
}

export async function sendClassBookingConfirmationEmail(
  to: string,
  data: Parameters<typeof emailTemplates.classBookingConfirmation>[0]
) {
  const { subject, html } = emailTemplates.classBookingConfirmation(data);
  return sendEmail({ to, subject, html });
}

export async function sendPasswordResetEmail(to: string, data: Parameters<typeof emailTemplates.passwordReset>[0]) {
  const { subject, html } = emailTemplates.passwordReset(data);
  return sendEmail({ to, subject, html });
}

export async function sendPaymentReminderEmail(
  to: string,
  data: Parameters<typeof emailTemplates.paymentReminder>[0]
) {
  const { subject, html } = emailTemplates.paymentReminder(data);
  return sendEmail({ to, subject, html });
}

export async function sendStaffCreatedMemberWelcomeEmail(
  to: string,
  data: Parameters<typeof emailTemplates.staffCreatedMemberWelcome>[0]
) {
  const { subject, html } = emailTemplates.staffCreatedMemberWelcome(data);
  return sendEmail({ to, subject, html });
}
