import { Resend } from 'resend';
import logger from './logger';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = 'orders@brewandboard.coffee';
const SUPPORT_EMAIL = 'support@brewandboard.coffee';

export interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  vendorName: string;
  deliveryAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  subtotal: string;
  serviceFee: string;
  deliveryFee: string;
  tax: string;
  gratuity: string;
  total: string;
}

export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean> {
  if (!resend) {
    logger.warn('system', 'Email service not configured - RESEND_API_KEY missing');
    return false;
  }
  
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price}</td>
    </tr>
  `).join('');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Georgia, serif; background: #fef3c7; color: #1a0f09; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a0f09, #5a3620); color: #fef3c7; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border: 1px solid #d4a574; }
        .order-details { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #1a0f09; color: #fef3c7; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        .total-row { font-weight: bold; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>☕ Brew & Board Coffee</h1>
          <p>Order Confirmation</p>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Thank you for your order! We're preparing your coffee and will have it delivered on time.</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0;">Order #${data.orderId.slice(-8).toUpperCase()}</h3>
            <p><strong>Vendor:</strong> ${data.vendorName}</p>
            <p><strong>Delivery:</strong> ${data.scheduledDate} at ${data.scheduledTime}</p>
            <p><strong>Address:</strong> ${data.deliveryAddress}</p>
          </div>
          
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <table style="margin-top: 20px;">
            <tr><td style="padding: 5px;">Subtotal</td><td style="text-align: right;">$${data.subtotal}</td></tr>
            <tr><td style="padding: 5px;">Service Fee (15%)</td><td style="text-align: right;">$${data.serviceFee}</td></tr>
            <tr><td style="padding: 5px;">Delivery</td><td style="text-align: right;">$${data.deliveryFee}</td></tr>
            <tr><td style="padding: 5px;">Tax</td><td style="text-align: right;">$${data.tax}</td></tr>
            <tr><td style="padding: 5px;">Gratuity</td><td style="text-align: right;">$${data.gratuity}</td></tr>
            <tr class="total-row" style="border-top: 2px solid #1a0f09;">
              <td style="padding: 10px 5px;">Total</td>
              <td style="text-align: right; padding: 10px 5px;">$${data.total}</td>
            </tr>
          </table>
          
          <p style="margin-top: 30px;">Questions? Reply to this email or contact us at support@brewandboard.coffee</p>
        </div>
        <div class="footer">
          <p>Brew & Board Coffee | Nashville, TN</p>
          <p>Delivering Nashville Luxury to Your Meeting</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.vendorName} for ${data.scheduledDate}`,
      html,
    });
    
    logger.info('system', `Order confirmation email sent to ${data.customerEmail}`, { orderId: data.orderId });
    return true;
  } catch (error: any) {
    logger.error('system', `Failed to send order confirmation email`, error, { orderId: data.orderId });
    return false;
  }
}

export interface OrderStatusUpdateData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  statusMessage: string;
  driverName?: string;
  estimatedArrival?: string;
  trackingUrl?: string;
}

export async function sendOrderStatusUpdate(data: OrderStatusUpdateData): Promise<boolean> {
  if (!resend) {
    logger.warn('system', 'Email service not configured');
    return false;
  }
  
  const statusEmoji: Record<string, string> = {
    confirmed: '✅',
    preparing: '👨‍🍳',
    picked_up: '📦',
    out_for_delivery: '🚗',
    delivered: '🎉',
    cancelled: '❌',
  };
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Georgia, serif; background: #fef3c7; color: #1a0f09; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a0f09, #5a3620); color: #fef3c7; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #d4a574; }
        .status-badge { display: inline-block; background: #5a3620; color: white; padding: 10px 20px; border-radius: 20px; font-size: 18px; }
        .footer { background: #1a0f09; color: #fef3c7; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>☕ Brew & Board Coffee</h1>
          <p>Order Update</p>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span class="status-badge">${statusEmoji[data.status] || '📋'} ${data.statusMessage}</span>
          </div>
          
          <p style="text-align: center; font-size: 14px; color: #666;">Order #${data.orderId.slice(-8).toUpperCase()}</p>
          
          ${data.driverName ? `<p><strong>Driver:</strong> ${data.driverName}</p>` : ''}
          ${data.estimatedArrival ? `<p><strong>Estimated Arrival:</strong> ${data.estimatedArrival}</p>` : ''}
          ${data.trackingUrl ? `<p><a href="${data.trackingUrl}" style="color: #5a3620;">Track Your Order</a></p>` : ''}
        </div>
        <div class="footer">
          <p>Brew & Board Coffee | Nashville, TN</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Update: ${data.statusMessage}`,
      html,
    });
    
    logger.info('system', `Order status update email sent to ${data.customerEmail}`, { orderId: data.orderId, status: data.status });
    return true;
  } catch (error: any) {
    logger.error('system', `Failed to send status update email`, error, { orderId: data.orderId });
    return false;
  }
}

export interface OrderCancellationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  refundAmount?: string;
  refundStatus?: 'pending' | 'processed' | 'not_applicable';
}

export async function sendOrderCancellation(data: OrderCancellationData): Promise<boolean> {
  if (!resend) {
    logger.warn('system', 'Email service not configured');
    return false;
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Georgia, serif; background: #fef3c7; color: #1a0f09; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a0f09, #5a3620); color: #fef3c7; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #d4a574; }
        .footer { background: #1a0f09; color: #fef3c7; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>☕ Brew & Board Coffee</h1>
          <p>Order Cancelled</p>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          
          <p>Your order #${data.orderId.slice(-8).toUpperCase()} has been cancelled.</p>
          
          <p><strong>Reason:</strong> ${data.reason}</p>
          
          ${data.refundAmount && data.refundStatus ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Refund Amount:</strong> $${data.refundAmount}</p>
              <p style="margin: 5px 0 0 0;"><strong>Status:</strong> ${data.refundStatus === 'processed' ? 'Refund processed - please allow 3-5 business days' : 'Refund pending'}</p>
            </div>
          ` : ''}
          
          <p>We're sorry for any inconvenience. If you have questions, please contact us at support@brewandboard.coffee.</p>
        </div>
        <div class="footer">
          <p>Brew & Board Coffee | Nashville, TN</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Cancelled - #${data.orderId.slice(-8).toUpperCase()}`,
      html,
    });
    
    logger.info('system', `Cancellation email sent to ${data.customerEmail}`, { orderId: data.orderId });
    return true;
  } catch (error: any) {
    logger.error('system', `Failed to send cancellation email`, error, { orderId: data.orderId });
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string, customerName: string): Promise<boolean> {
  if (!resend) {
    logger.warn('system', 'Email service not configured - RESEND_API_KEY missing');
    return false;
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Georgia, serif; background: #fef3c7; color: #1a0f09; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a0f09, #5a3620); color: #fef3c7; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border: 1px solid #d4a574; }
        .button { display: inline-block; background: linear-gradient(135deg, #5c4033, #2d1810); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #1a0f09; color: #fef3c7; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>☕ Brew & Board Coffee</h1>
          <p>Password Reset</p>
        </div>
        <div class="content">
          <p>Hi ${customerName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button" style="color: white;">Reset My Password</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this reset, you can safely ignore this email. Your password will not be changed.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:<br>${resetUrl}</p>
        </div>
        <div class="footer">
          <p>Brew & Board Coffee | Nashville, TN</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password - Brew & Board Coffee',
      html,
    });
    
    logger.info('system', `Password reset email sent to ${email}`);
    return true;
  } catch (error: any) {
    logger.error('system', `Failed to send password reset email`, error, { email });
    return false;
  }
}

export function isConfigured(): boolean {
  return resend !== null;
}
