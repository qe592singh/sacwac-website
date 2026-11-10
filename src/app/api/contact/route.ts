import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide your name" },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your message" },
        { status: 400 }
      );
    }

    const smtpUser = process.env.SMTP_USER || "sachin891singh@gmail.com";
    const smtpPass = process.env.SMTP_PASS || "wzqgwgddzujgutrq";
    const recipient = process.env.CONTACT_NOTIFICATION_EMAIL || "sacwac.work@gmail.com";

    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const sanitizedPhone = phone?.trim() || "Not provided";
    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim();
    const sanitizedMessage = message.trim();

    const mailOptions = {
      from: `"SacWac Contact Form" <${smtpUser}>`,
      to: recipient,
      replyTo: sanitizedEmail,
      subject: `New Message from ${sanitizedName} (SacWac Contact Form)`,
      text: `You received a new message from the SacWac website contact form:

Name: ${sanitizedName}
Email: ${sanitizedEmail}
Phone: ${sanitizedPhone}

Message:
${sanitizedMessage}

---
Sent from SacWac Learning Platform: https://sacwac.com`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
            .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #0284c7, #2563eb); padding: 24px 28px; color: #ffffff; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
            .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
            .body { padding: 28px; }
            .field { margin-bottom: 18px; }
            .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
            .val { font-size: 14px; font-weight: 600; color: #0f172a; }
            .message-box { background: #f1f5f9; border-left: 4px solid #0284c7; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap; margin-top: 6px; }
            .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>📩 New Contact Form Submission</h1>
              <p>Sent from SacWac Learning Website</p>
            </div>
            <div class="body">
              <div class="field">
                <div class="label">Sender Name</div>
                <div class="val">${sanitizedName}</div>
              </div>
              <div class="field">
                <div class="label">Email Address</div>
                <div class="val"><a href="mailto:${sanitizedEmail}" style="color: #0284c7; text-decoration: none;">${sanitizedEmail}</a></div>
              </div>
              <div class="field">
                <div class="label">Phone Number</div>
                <div class="val">${sanitizedPhone}</div>
              </div>
              <div class="field" style="margin-bottom: 0;">
                <div class="label">Message</div>
                <div class="message-box">${sanitizedMessage}</div>
              </div>
            </div>
            <div class="footer">
              Hit <strong>Reply</strong> to respond directly to ${sanitizedEmail}
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been sent successfully. Sachin will get back to you shortly.",
    });
  } catch (error) {
    console.error("Nodemailer error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message. Please try again or email sacwac.work@gmail.com directly.",
      },
      { status: 500 }
    );
  }
}
