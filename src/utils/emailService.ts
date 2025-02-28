
import { supabase } from '@/integrations/supabase/client';

export interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Sends an email via the Supabase Edge Function
 * @param params Email parameters including to, subject, and html content
 * @returns Response with success status and data or error
 */
export const sendEmail = async (params: EmailParams) => {
  try {
    console.log('Sending email to:', params.to);
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params,
    });
    
    if (error) {
      console.error('Error calling send-email function:', error);
      throw error;
    }
    
    if (!data || !data.success) {
      console.error('Email sending failed:', data);
      throw new Error(data?.error || 'Failed to send email');
    }
    
    console.log('Email sent successfully:', data);
    
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error in sendEmail function:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    };
  }
};

/**
 * Sends a welcome email to a new user
 * @param email User's email address
 * @param name User's name
 * @returns Response with success status
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
  const subject = 'Welcome to AudioDescriptions!';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4f46e5;">Welcome to AudioDescriptions!</h1>
      <p>Hello ${name || 'there'},</p>
      <p>Thank you for signing up for AudioDescriptions - your gateway to creating engaging audio content for e-commerce products.</p>
      <h2 style="color: #4f46e5; margin-top: 20px;">What's Next?</h2>
      <ul>
        <li>Try generating your first audio description</li>
        <li>Explore our different voices and languages</li>
        <li>Check out our pricing plans for more features</li>
      </ul>
      <div style="margin: 30px 0; text-align: center;">
        <a href="https://audiodescriptions.online/generator" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Generate Your First Audio</a>
      </div>
      <p>If you have any questions or need assistance, feel free to reply to this email.</p>
      <p>Best regards,<br>The AudioDescriptions Team</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 12px;">
        <p>© 2023 AudioDescriptions. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    html,
  });
};

/**
 * Sends a notification email when a user's subscription plan changes
 * @param email User's email address
 * @param name User's name
 * @param planName New plan name
 * @returns Response with success status
 */
export const sendPlanChangeEmail = async (email: string, name: string, planName: string) => {
  const subject = 'Your AudioDescriptions Plan Has Changed';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4f46e5;">Plan Updated!</h1>
      <p>Hello ${name || 'there'},</p>
      <p>Your AudioDescriptions subscription has been updated to the <strong>${planName}</strong> plan.</p>
      <h2 style="color: #4f46e5; margin-top: 20px;">Your New Benefits:</h2>
      <ul>
        ${planName === 'Premium' ? `
          <li>Unlimited audio generations</li>
          <li>API access</li>
          <li>Priority support</li>
          <li>All premium voices</li>
        ` : planName === 'Basic' ? `
          <li>10 audio generations per day</li>
          <li>History access for 30 days</li>
          <li>Standard support</li>
        ` : `
          <li>3 audio generations per day</li>
          <li>Basic voices</li>
        `}
      </ul>
      <div style="margin: 30px 0; text-align: center;">
        <a href="https://audiodescriptions.online/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Your Dashboard</a>
      </div>
      <p>Thank you for your continued support!</p>
      <p>Best regards,<br>The AudioDescriptions Team</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 12px;">
        <p>© 2023 AudioDescriptions. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    html,
  });
};
