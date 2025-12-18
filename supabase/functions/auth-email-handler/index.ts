/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "PMHelp <noreply@pmhelp.co>";
const SEND_EMAIL_HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
const SITE_URL = Deno.env.get("SIT_URL") || "https://transcendent-sprinkles-8cd7b5.netlify.app";
const SUPABASE_URL = Deno.env.get("PROJECT_URL") || "https://igiemqicokpdyhunldtq.supabase.co";
// Initialize Resend
const resend = new Resend(RESEND_API_KEY);

// Extract secret (remove v1,whsec_ prefix)
const hookSecret = SEND_EMAIL_HOOK_SECRET?.replace("v1,whsec_", "") || "";

interface EmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
  token_new?: string;
  token_hash_new?: string;
  old_email?: string;
  old_phone?: string;
  provider?: string;
  factor_type?: string;
}

interface User {
  id: string;
  email: string;
  phone?: string;
  email_new?: string;
  [key: string]: any;
}

Deno.serve(async (req) => {
  console.log("=== AUTH EMAIL HANDLER CALLED ===");
  console.log("Timestamp:", new Date().toISOString());

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Get raw payload as text (needed for webhook verification)
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    console.log("Request method:", req.method);
    console.log("Headers received:", Object.keys(headers));

    // Verify webhook secret is configured
    if (!SEND_EMAIL_HOOK_SECRET || !hookSecret) {
      console.error("❌ SEND_EMAIL_HOOK_SECRET not configured");
      return new Response(
        JSON.stringify({
          error: {
            http_code: 500,
            message: "Webhook secret not configured",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify webhook signature using standardwebhooks
    const wh = new Webhook(hookSecret);
    let verifiedData: { user: User; email_data: EmailData };

    try {
      verifiedData = wh.verify(payload, headers) as {
        user: User;
        email_data: EmailData;
      };
      console.log("✅ Webhook signature verified");
    } catch (error) {
      console.error("❌ Webhook verification failed:", error);
      return new Response(
        JSON.stringify({
          error: {
            http_code: 401,
            message: "Invalid webhook signature",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { user, email_data } = verifiedData;

    console.log("Email action type:", email_data.email_action_type);
    console.log("User email:", user.email);
    console.log("Site URL:", SITE_URL);

    // Verify Resend API key is configured
    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({
          error: {
            http_code: 500,
            message: "Resend API key not configured",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get email template based on email_action_type
    const emailContent = getEmailTemplate(email_data, user, SITE_URL);

    if (!emailContent) {
      console.log(`⚠️ Unknown email action type: ${email_data.email_action_type}`);
      // Return success for unknown types (don't break auth flow)
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle email change with Secure Email Change (two emails)
    if (email_data.email_action_type === "email_change" && email_data.token_new && email_data.token_hash_new) {
      // Secure Email Change enabled - send two emails
      console.log("📧 Sending email change confirmation (secure mode - two emails)");

      // Email 1: Current email with token_hash_new
      const currentEmailContent = getEmailChangeTemplate(
        email_data,
        user.email,
        email_data.token,
        email_data.token_hash_new,
         SITE_URL
      );

      await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: [user.email],
        subject: "Confirm your email change",
        html: currentEmailContent,
      });

      // Email 2: New email with token_hash
      const newEmail = user.email_new || "";
      const newEmailContent = getEmailChangeTemplate(
        email_data,
        newEmail,
        email_data.token_new || "",
        email_data.token_hash,
         SITE_URL
      );

      const { data, error } = await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: [newEmail],
        subject: "Confirm your new email address",
        html: newEmailContent,
      });

      if (error) {
        console.error("❌ Resend API error:", error);
        throw error;
      }

      console.log("✅ Both emails sent successfully! Message ID:", data?.id);
    } else {
      // Single email (signup, password recovery, etc.)
      console.log(`📧 Sending email to: ${user.email}`);

      const { data, error } = await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: [user.email],
        subject: emailContent.subject,
        html: emailContent.html,
      });

      if (error) {
        console.error("❌ Resend API error:", error);
        throw error;
      }

      console.log("✅ Email sent successfully! Message ID:", data?.id);
    }

    console.log("=== FUNCTION COMPLETED SUCCESSFULLY ===");

    // Return empty response with 200 status (as per Supabase docs)
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ UNEXPECTED ERROR:", error);
    console.error("Error message:", error?.message);
    console.error("=== FUNCTION FAILED ===");

    return new Response(
      JSON.stringify({
        error: {
          http_code: error?.code || 500,
          message: error?.message || "Internal server error",
        },
      }),
      {
        status: error?.code || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

function getEmailTemplate(
  email_data: EmailData,
  user: User,
  siteUrl: string
): { subject: string; html: string } | null {
  switch (email_data.email_action_type) {
    case "signup":
      return {
        subject: "Welcome to PMHelp! Confirm your email",
        html: getSignupEmailTemplate(email_data, siteUrl),
      };
      // ... existing cases above ...
      case "recovery":
        case "password_recovery":
          return {
            subject: "Reset your PMHelp password",
            html: getPasswordResetEmailTemplate(email_data, siteUrl),
          };
  // ... existing cases below ...

    case "email_change":
      // Will be handled separately for secure email change
      return {
        subject: "Confirm your new email address",
        html: getEmailChangeTemplate(
          email_data,
          user.email_new || user.email || "",
          email_data.token_new || email_data.token,
          email_data.token_hash_new || email_data.token_hash,
          siteUrl
        ),
      };

    case "invite":
      return {
        subject: "You've been invited to PMHelp",
        html: getInviteEmailTemplate(email_data, siteUrl),
      };

    default:
      return null;
  }
}

function getSignupEmailTemplate(email_data: EmailData, siteUrl: string): string {
  // IMPORTANT:
  // - For /auth/v1/verify, use token_hash (not token)
  // - For signup confirmation, use type=signup
  // - Ensure redirect_to points to an actual file for static hosting (confirm.html)
  const defaultRedirect = `${siteUrl}/auth/confirm.html`;
  const rawRedirect = email_data.redirect_to || defaultRedirect;
  const redirectTarget = rawRedirect.endsWith("/auth/confirm")
    ? `${rawRedirect}.html`
    : rawRedirect;
  const redirectTo = encodeURIComponent(redirectTarget);

  const confirmationUrl =
    `${SUPABASE_URL}/auth/v1/verify` +
    `?token=${email_data.token_hash}` +
    `&type=signup` +
    `&redirect_to=${redirectTo}`;

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
  `;
}

function getPasswordResetEmailTemplate(email_data: EmailData, siteUrl: string): string {
  // Use Supabase's built-in verification endpoint for password reset
  // For /auth/v1/verify: use token_hash (NOT token) and type=recovery
  const defaultRedirect = `${siteUrl}/auth/confirm.html`;
  const rawRedirect = email_data.redirect_to || defaultRedirect;
  const redirectTarget = rawRedirect.endsWith("/auth/confirm")
    ? `${rawRedirect}.html`
    : rawRedirect;
  const redirectTo = encodeURIComponent(redirectTarget);
  const resetUrl = `${SUPABASE_URL}/auth/v1/verify?token=${email_data.token_hash}&type=recovery&redirect_to=${redirectTo}`;

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
  `;
}

function getEmailChangeTemplate(
  email_data: EmailData,
  email: string,
  token: string,
  token_hash: string,
  siteUrl: string
): string {
  // Use Supabase's built-in verification endpoint for email change
  // For /auth/v1/verify: use token_hash (NOT token) and type=email_change
  const defaultRedirect = `${siteUrl}/auth/confirm.html`;
  const rawRedirect = email_data.redirect_to || defaultRedirect;
  const redirectTarget = rawRedirect.endsWith("/auth/confirm")
    ? `${rawRedirect}.html`
    : rawRedirect;
  const redirectTo = encodeURIComponent(redirectTarget);
  const confirmationUrl = `${SUPABASE_URL}/auth/v1/verify?token=${token_hash}&type=email_change&redirect_to=${redirectTo}`;

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
    
    <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
    <p style="color: #9333ea; font-size: 12px; word-break: break-all;">${confirmationUrl}</p>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you didn't request this change, please contact support immediately.
    </p>
  </div>
</body>
</html>
  `;
}

function getInviteEmailTemplate(email_data: EmailData, siteUrl: string): string {
  // Use Supabase's built-in verification endpoint for invites
  // For /auth/v1/verify: use token_hash (NOT token) and type=invite
  const defaultRedirect = `${siteUrl}/auth/confirm.html`;
  const rawRedirect = email_data.redirect_to || defaultRedirect;
  const redirectTarget = rawRedirect.endsWith("/auth/confirm")
    ? `${rawRedirect}.html`
    : rawRedirect;
  const redirectTo = encodeURIComponent(redirectTarget);
  const inviteUrl = `${SUPABASE_URL}/auth/v1/verify?token=${email_data.token_hash}&type=invite&redirect_to=${redirectTo}`;

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
    
    <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
    <p style="color: #9333ea; font-size: 12px; word-break: break-all;">${inviteUrl}</p>
  </div>
</body>
</html>
  `;
}
