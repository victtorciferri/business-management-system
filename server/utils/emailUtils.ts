import nodemailer from "nodemailer";
import type { User, Customer } from "@shared/schema";
import type { Request } from "express";

// Initialize Nodemailer transporter
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
});

export const sendTokenEmail = async (
  req: Request, 
  token: string, 
  customer: Customer, 
  business: User
) => {
  try {
    // Get the base URL from request
    let baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // If it's a custom domain or business slug access, adjust the URL
    if (req.business) {
      if (req.business.customDomain) {
        baseUrl = `https://${req.business.customDomain}`;
      } else if (req.business.businessSlug) {
        baseUrl = `${req.protocol}://${req.get('host')}/${req.business.businessSlug}`;
      }
    } else if (business.customDomain) {
      baseUrl = `https://${business.customDomain}`;
    } else if (business.businessSlug) {
      baseUrl = `${req.protocol}://${req.get('host')}/${business.businessSlug}`;
    }
    
    // Create the access URL
    const accessUrl = `${baseUrl}/customer-portal?token=${token}`;
    
    console.log(`Sending access token email to ${customer.email} with URL: ${accessUrl.substring(0, 30)}...`);
    
    // Send email to the customer
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@appointease.com',
      to: customer.email,
      subject: `Access Your ${business.businessName} Customer Portal`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Access Your Customer Portal</h2>
          <p>Hello ${customer.firstName},</p>
          <p>You can now access your customer portal for ${business.businessName} by clicking the button below.</p>
          <div style="margin: 30px 0;">
            <a href="${accessUrl}" style="background-color: #4f46e5; color: white; padding: 12px 20px; border-radius: 4px; text-decoration: none; font-weight: bold;">
              Access Customer Portal
            </a>
          </div>
          <p>This link will expire in 7 days.</p>
          <p>If you didn't request this email, you can safely ignore it.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Powered by AppointEase - Intelligent appointment scheduling for small businesses
          </p>
        </div>
      `,
      text: `
        Hello ${customer.firstName},
        
        You can now access your customer portal for ${business.businessName} by clicking the link below:
        
        ${accessUrl}
        
        This link will expire in 7 days.
        
        If you didn't request this email, you can safely ignore it.
        
        Powered by AppointEase - Intelligent appointment scheduling for small businesses
      `
    });
    
    console.log(`Email sent successfully to ${customer.email}`);
  } catch (error) {
    console.error("Error sending access token email:", error);
    // Email failure is non-fatal, so we just log the error
  }
};