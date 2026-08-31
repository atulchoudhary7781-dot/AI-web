import { Resend } from 'resend'

// Initialize Resend with API key from environment
let resend: Resend | null = null

const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set. Email sending disabled.')
    return null
  }
  
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  
  return resend
}

// Email templates
export const emailTemplates = {
  verification: (token: string, userEmail: string) => ({
    subject: 'Verify your NEXUS AI account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">NEXUS AI</h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Verify Your Email Address</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.5;">
                        Welcome to NEXUS AI! Please verify your email address by clicking the button below:
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                        <tr>
                          <td align="center">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}" 
                               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Verify Email
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                        Or copy and paste this link into your browser:
                      </p>
                      
                      <p style="margin: 0 0 24px; color: #667eea; font-size: 13px; word-break: break-all; background-color: #f9fafb; padding: 12px; border-radius: 6px;">
                        ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                      
                      <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                        This link will expire in <strong>24 hours</strong>. If you didn't create an account with NEXUS AI, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                        © ${new Date().getFullYear()} NEXUS AI. All rights reserved.
                      </p>
                      <p style="margin: 8px 0 0; color: #d1d5db; font-size: 12px;">
                        This email was sent to ${userEmail}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Verify your NEXUS AI account\n\nPlease verify your email by visiting:\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}\n\nThis link expires in 24 hours.\nIf you didn't create this account, please ignore this email.`
  }),

  passwordReset: (token: string, userEmail: string) => ({
    subject: 'Reset your NEXUS AI password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); border-radius: 12px 12px 0 0; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">NEXUS AI</h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Reset Your Password</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.5;">
                        We received a request to reset your password. Click the button below to create a new one:
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                        <tr>
                          <td align="center">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}" 
                               style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                        Or copy and paste this link:
                      </p>
                      
                      <p style="margin: 0 0 24px; color: #f59e0b; font-size: 13px; word-break: break-all; background-color: #fffbeb; padding: 12px; border-radius: 6px;">
                        ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                      
                      <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                        This link will expire in <strong>1 hour</strong>. If you didn't request this reset, please ignore this email - your password won't be changed.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                        © ${new Date().getFullYear()} NEXUS AI. All rights reserved.
                      </p>
                      <p style="margin: 8px 0 0; color: #d1d5db; font-size: 12px;">
                        This email was sent to ${userEmail}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Reset your NEXUS AI password\n\nReset your password by visiting:\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}\n\nThis link expires in 1 hour.\nIf you didn't request this reset, please ignore this email.`
  }),

  welcome: (userName: string, userEmail: string) => ({
    subject: 'Welcome to NEXUS AI! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to NEXUS AI</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🎉 Welcome!</h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">You're now part of NEXUS AI</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.5;">
                        Hi ${userName || 'there'},
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.5;">
                        Welcome to <strong>NEXUS AI</strong>! We're excited to have you on board. Start exploring our AI-powered features today!
                      </p>
                      
                      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.5;">
                          <strong>Quick Tips:</strong><br>
                          • Verify your email for full access<br>
                          • Check out our subscription plans<br>
                          • Join our community Discord
                        </p>
                      </div>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                        <tr>
                          <td align="center">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile" 
                               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Get Started
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                        © ${new Date().getFullYear()} NEXUS AI. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Welcome to NEXUS AI!\n\nHi ${userName || 'there'},\n\nWelcome to NEXUS AI! We're excited to have you on board.\n\nVisit ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile to get started.\n\nHappy chatting! 🚀`
  }),

  paymentConfirmation: (planName: string, amount: string, userEmail: string) => ({
    subject: `Payment Confirmed - ${planName} Plan`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmed</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); border-radius: 12px 12px 0 0; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✅ Payment Successful!</h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your subscription is active</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.5;">
                        Great news! Your payment has been processed successfully.
                      </p>
                      
                      <div style="background-color: #f5f3ff; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
                        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Plan</p>
                        <p style="margin: 0 0 16px; color: #7c3aed; font-size: 24px; font-weight: 700;">${planName}</p>
                        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Amount Charged</p>
                        <p style="margin: 0; color: #059669; font-size: 20px; font-weight: 600;">${amount}</p>
                      </div>
                      
                      <p style="margin: 0 0 20px; color: #374151; font-size: 15px; line-height: 1.5;">
                        You can now enjoy all the benefits of your ${planName} plan. Thank you for choosing NEXUS AI!
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                        <tr>
                          <td align="center">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile" 
                               style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              View Account
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                        © ${new Date().getFullYear()} NEXUS AI. All rights reserved.
                      </p>
                      <p style="margin: 8px 0 0; color: #d1d5db; font-size: 12px;">
                        Receipt will be sent separately
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Payment Confirmed!\n\nYour ${planName} plan is now active.\n\nAmount charged: ${amount}\n\nThank you for choosing NEXUS AI!\n\nVisit ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile to manage your account.`
  })
}

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  const client = getResend()
  
  if (!client) {
    // Fallback: log email in development
    console.log('=== EMAIL WOULD BE SENT ===')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`HTML Length: ${html.length}`)
    console.log('=============================')
    
    return {
      success: false,
      error: 'Resend not configured',
      devMode: true,
      preview: { to, subject, html }
    }
  }

  try {
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || 'NEXUS AI <noreply@resend.dev>',
      to: [to],
      subject,
      html,
      text: text || undefined
    })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Send email error:', error)
    return { success: false, error: error.message }
  }
}

// Convenience functions
export const sendVerificationEmail = async (email: string, token: string) => {
  const template = emailTemplates.verification(token, email)
  return sendEmail({ to: email, ...template })
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const template = emailTemplates.passwordReset(token, email)
  return sendEmail({ to: email, ...template })
}

export const sendWelcomeEmail = async (email: string, name?: string) => {
  const template = emailTemplates.welcome(name || '', email)
  return sendEmail({ to: email, ...template })
}

export const sendPaymentConfirmationEmail = async (
  email: string, 
  planName: string, 
  amount: string
) => {
  const template = emailTemplates.paymentConfirmation(planName, amount, email)
  return sendEmail({ to: email, ...template })
}
