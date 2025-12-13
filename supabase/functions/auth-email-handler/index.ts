// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'PMHelp <noreply@pmhelp.co>'
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') // Set this in Supabase secrets

interface AuthEvent {
  type: string
  user: {
    id: string
    email: string
    email_confirmed_at?: string
  }
  email?: string
  token?: string
  redirect_to?: string
}

Deno.serve(async (req) => {
  try {
    // For Auth Hooks, Supabase sends the secret in Authorization header
    // Format: "Bearer <secret>" or just the secret
    const authHeader = req.headers.get('Authorization')
    
    // If WEBHOOK_SECRET is set, verify it
    if (WEBHOOK_SECRET) {
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'No authorization header' }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      // Extract token (handle both "Bearer <token>" and just "<token>")
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader
      
      if (token !== WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ error: 'Invalid authorization token' }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    const event: AuthEvent = await req.json()
    
    // Validate event structure
    if (!event || !event.type) {
      return new Response(JSON.stringify({ error: 'Invalid event data' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Get email template based on event type
    const emailContent = getEmailTemplate(event)
    
    if (!emailContent) {
      console.log(`Unknown event type: ${event.type}`)
      // Return success for unknown events (don't break auth flow)
      return new Response(JSON.stringify({ success: true, message: 'Event type not handled' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get recipient email
    const recipientEmail = event.user?.email || event.email
    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: 'No recipient email' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    })

    const data = await resendResponse.json()

    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(data)}`)
    }

    return new Response(JSON.stringify({ success: true, messageId: data.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

function getEmailTemplate(event: AuthEvent) {
  const siteUrl = Deno.env.get('SITE_URL') || 'https://pmhelp.co'
  
  switch (event.type) {
    case 'user.signup':
      return {
        subject: 'Welcome to PMHelp! Confirm your email',
        html: getSignupEmailTemplate(event, siteUrl)
      }
    
    case 'user.password_recovery':
      return {
        subject: 'Reset your PMHelp password',
        html: getPasswordResetEmailTemplate(event, siteUrl)
      }
    
    case 'user.email_change':
      return {
        subject: 'Confirm your new email address',
        html: getEmailChangeTemplate(event, siteUrl)
      }
    
    case 'user.invite':
      return {
        subject: 'You\'ve been invited to PMHelp',
        html: getInviteEmailTemplate(event, siteUrl)
      }
    
    default:
      return null
  }
}

function getSignupEmailTemplate(event: AuthEvent, siteUrl: string): string {
  const confirmationUrl = `${siteUrl}/auth/confirm?token=${event.token}&type=signup`
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #7e22ce, #9333ea); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">PMHelp</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Welcome to PMHelp!</h2>
    
    <p>Hello,</p>
    
    <p>Thank you for signing up! Please confirm your email address to get started.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${confirmationUrl}" style="background: linear-gradient(135deg, #7e22ce, #9333ea); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Confirm Email Address
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
    <p style="color: #9333ea; font-size: 12px; word-break: break-all;">${confirmationUrl}</p>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
  `
}

function getPasswordResetEmailTemplate(event: AuthEvent, siteUrl: string): string {
  const resetUrl = `${siteUrl}/reset-password?token=${event.token}`
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #7e22ce, #9333ea); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">PMHelp</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
    
    <p>Hello,</p>
    
    <p>We received a request to reset your password for your PMHelp account.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #7e22ce, #9333ea); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
    <p style="color: #9333ea; font-size: 12px; word-break: break-all;">${resetUrl}</p>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
  `
}

function getEmailChangeTemplate(event: AuthEvent, siteUrl: string): string {
  const confirmationUrl = `${siteUrl}/auth/confirm?token=${event.token}&type=email_change`
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #7e22ce, #9333ea); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">PMHelp</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Confirm Your New Email</h2>
    
    <p>Hello,</p>
    
    <p>Please confirm your new email address to complete the change.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${confirmationUrl}" style="background: linear-gradient(135deg, #7e22ce, #9333ea); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Confirm Email
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">If you didn't request this change, please contact support immediately.</p>
  </div>
</body>
</html>
  `
}

function getInviteEmailTemplate(event: AuthEvent, siteUrl: string): string {
  const inviteUrl = `${siteUrl}/auth/accept-invite?token=${event.token}`
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #7e22ce, #9333ea); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">PMHelp</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">You've Been Invited!</h2>
    
    <p>Hello,</p>
    
    <p>You've been invited to join PMHelp. Click the button below to accept your invitation and create your account.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" style="background: linear-gradient(135deg, #7e22ce, #9333ea); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Accept Invitation
      </a>
    </div>
  </div>
</body>
</html>
  `
}