/**
 * Beautiful Email Templates for RangeelaDhaba
 * All templates use inline CSS for maximum email client compatibility
 */

const brandColors = {
  primary: '#E85D04', // Vibrant Orange
  secondary: '#DC2F02', // Deep Red-Orange
  accent: '#F48C06', // Golden Orange
  dark: '#370617', // Dark Burgundy
  light: '#FFF8F0', // Cream White
  success: '#059669', // Emerald Green
  warning: '#D97706', // Amber
  error: '#DC2626', // Red
  gray: '#6B7280',
  lightGray: '#F3F4F6',
};

const baseStyles = `
  body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
  .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
`;

const getHeader = (title: string) => `
  <div style="background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); padding: 40px 30px; text-align: center;">
    <div style="margin-bottom: 15px;">
      <span style="font-size: 40px;">🍛</span>
    </div>
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
      RangeelaDhaba
    </h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
      ${title}
    </p>
  </div>
`;

const getFooter = () => `
  <div style="background-color: ${brandColors.dark}; padding: 30px; text-align: center;">
    <p style="color: rgba(255,255,255,0.8); margin: 0 0 15px 0; font-size: 14px;">
      Thank you for choosing RangeelaDhaba!
    </p>
    <div style="margin-bottom: 20px;">
      <a href="#" style="color: ${brandColors.accent}; text-decoration: none; margin: 0 10px; font-size: 13px;">Website</a>
      <span style="color: rgba(255,255,255,0.3);">|</span>
      <a href="#" style="color: ${brandColors.accent}; text-decoration: none; margin: 0 10px; font-size: 13px;">Support</a>
      <span style="color: rgba(255,255,255,0.3);">|</span>
      <a href="#" style="color: ${brandColors.accent}; text-decoration: none; margin: 0 10px; font-size: 13px;">Contact Us</a>
    </div>
    <p style="color: rgba(255,255,255,0.5); margin: 0; font-size: 12px;">
      &copy; ${new Date().getFullYear()} RangeelaDhaba. All rights reserved.
    </p>
    <p style="color: rgba(255,255,255,0.4); margin: 10px 0 0 0; font-size: 11px;">
      This email was sent from an automated system. Please do not reply directly.
    </p>
  </div>
`;

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  isFree?: boolean;
}

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  totalAmount: number;
  orderType: 'delivery' | 'takeaway';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phoneNumber?: string;
  };
  createdAt?: Date;
  specialInstructions?: string;
}

/**
 * Welcome Email Template
 */
export const welcomeEmailTemplate = (name: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to RangeelaDhaba</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    ${getHeader('Welcome to the Family!')}

    <div style="padding: 40px 30px;">
      <h2 style="color: ${brandColors.dark}; margin: 0 0 20px 0; font-size: 24px;">
        Namaste, ${name}! 🙏
      </h2>

      <p style="color: ${brandColors.gray}; line-height: 1.8; margin: 0 0 20px 0; font-size: 16px;">
        Welcome to <strong style="color: ${brandColors.primary};">RangeelaDhaba</strong> - your new favorite destination for authentic, flavorful Indian cuisine!
      </p>

      <div style="background: linear-gradient(135deg, ${brandColors.light} 0%, #FFF0E0 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid ${brandColors.primary};">
        <h3 style="color: ${brandColors.dark}; margin: 0 0 15px 0; font-size: 18px;">🎉 What's waiting for you:</h3>
        <ul style="color: ${brandColors.gray}; margin: 0; padding-left: 20px; line-height: 2;">
          <li>Authentic recipes from across India</li>
          <li>Fresh ingredients, prepared with love</li>
          <li>Fast and reliable delivery</li>
          <li>Exclusive offers and discounts</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL || 'http://localhost:5173'}"
           style="display: inline-block; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(232, 93, 4, 0.3);">
          Start Ordering Now →
        </a>
      </div>

      <p style="color: ${brandColors.gray}; line-height: 1.8; margin: 0; font-size: 14px; text-align: center;">
        We're thrilled to have you with us. Get ready for a delicious journey!
      </p>
    </div>

    ${getFooter()}
  </div>
</body>
</html>
`;

/**
 * OTP/Forgot Password Email Template
 */
export const otpEmailTemplate = (name: string, otp: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    ${getHeader('Password Reset Request')}

    <div style="padding: 40px 30px;">
      <h2 style="color: ${brandColors.dark}; margin: 0 0 20px 0; font-size: 24px;">
        Hello, ${name}! 👋
      </h2>

      <p style="color: ${brandColors.gray}; line-height: 1.8; margin: 0 0 25px 0; font-size: 16px;">
        We received a request to reset your password for your RangeelaDhaba account. Use the OTP below to proceed with resetting your password.
      </p>

      <div style="background: linear-gradient(135deg, ${brandColors.light} 0%, #FFF0E0 100%); border-radius: 16px; padding: 30px; text-align: center; margin: 25px 0;">
        <p style="color: ${brandColors.gray}; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
          Your Verification Code
        </p>
        <div style="background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); border-radius: 12px; padding: 20px; display: inline-block;">
          <span style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px;">
            ${otp}
          </span>
        </div>
        <p style="color: ${brandColors.warning}; margin: 20px 0 0 0; font-size: 13px;">
          ⏱️ This code expires in <strong>10 minutes</strong>
        </p>
      </div>

      <div style="background-color: #FEF3C7; border-radius: 10px; padding: 20px; margin: 25px 0; border-left: 4px solid ${brandColors.warning};">
        <p style="color: #92400E; margin: 0; font-size: 14px; line-height: 1.6;">
          <strong>🔒 Security Notice:</strong><br>
          If you didn't request this password reset, please ignore this email. Your account remains secure.
        </p>
      </div>

      <p style="color: ${brandColors.gray}; line-height: 1.8; margin: 0; font-size: 14px;">
        Need help? Contact our support team anytime.
      </p>
    </div>

    ${getFooter()}
  </div>
</body>
</html>
`;

/**
 * Order Placed/Confirmation Email Template
 */
export const orderPlacedEmailTemplate = (order: OrderDetails): string => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #f0f0f0;">
        <div style="display: flex; align-items: center;">
          <span style="font-size: 24px; margin-right: 12px;">${item.isFree ? '🎁' : '🍽️'}</span>
          <div>
            <p style="margin: 0; color: ${brandColors.dark}; font-weight: 600; font-size: 15px;">
              ${item.name}
              ${item.isFree ? `<span style="background-color: ${brandColors.success}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 8px;">FREE</span>` : ''}
            </p>
            <p style="margin: 5px 0 0 0; color: ${brandColors.gray}; font-size: 13px;">Qty: ${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #f0f0f0; text-align: right;">
        <p style="margin: 0; color: ${item.isFree ? brandColors.success : brandColors.dark}; font-weight: 600; font-size: 15px;">${item.isFree ? 'FREE' : `₹${(item.price * item.quantity).toFixed(2)}`}</p>
      </td>
    </tr>
  `).join('');

  const addressHtml = order.orderType === 'delivery' && order.address ? `
    <div style="background-color: ${brandColors.lightGray}; border-radius: 10px; padding: 20px; margin-top: 20px;">
      <h4 style="color: ${brandColors.dark}; margin: 0 0 10px 0; font-size: 14px;">
        📍 Delivery Address
      </h4>
      <p style="color: ${brandColors.gray}; margin: 0; font-size: 14px; line-height: 1.6;">
        ${order.address.street || ''}<br>
        ${order.address.city || ''}${order.address.state ? ', ' + order.address.state : ''} ${order.address.zipCode || ''}<br>
        ${order.address.phoneNumber ? '📞 ' + order.address.phoneNumber : ''}
      </p>
    </div>
  ` : '';

  const specialInstructionsHtml = order.specialInstructions ? `
    <div style="background-color: #FEF3C7; border-radius: 10px; padding: 20px; margin-top: 20px; border-left: 4px solid ${brandColors.warning};">
      <h4 style="color: ${brandColors.dark}; margin: 0 0 10px 0; font-size: 14px;">
        📝 Special Instructions
      </h4>
      <p style="color: ${brandColors.gray}; margin: 0; font-size: 14px; line-height: 1.6; font-style: italic;">
        "${order.specialInstructions}"
      </p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    ${getHeader('Order Confirmed!')}

    <div style="padding: 40px 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, ${brandColors.success} 0%, #10B981 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px; line-height: 80px;">✓</span>
        </div>
        <h2 style="color: ${brandColors.dark}; margin: 0; font-size: 24px;">
          Thank you, ${order.customerName}!
        </h2>
        <p style="color: ${brandColors.gray}; margin: 10px 0 0 0; font-size: 16px;">
          Your order has been successfully placed
        </p>
      </div>

      <div style="background: linear-gradient(135deg, ${brandColors.light} 0%, #FFF0E0 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center;">
        <p style="color: ${brandColors.gray}; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
        <p style="color: ${brandColors.primary}; margin: 0; font-size: 18px; font-weight: 700;">#${order.orderId.slice(-8).toUpperCase()}</p>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(0,0,0,0.1);">
          <span style="display: inline-block; background-color: ${order.orderType === 'delivery' ? brandColors.primary : brandColors.accent}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
            ${order.orderType === 'delivery' ? '🚴 Delivery' : '🏪 Takeaway'}
          </span>
        </div>
      </div>

      <h3 style="color: ${brandColors.dark}; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid ${brandColors.primary}; padding-bottom: 10px;">
        Order Summary
      </h3>

      <table style="width: 100%; border-collapse: collapse;">
        ${itemsHtml}
      </table>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 2px dashed #e0e0e0;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: ${brandColors.gray}; font-size: 14px;">Subtotal</td>
            <td style="padding: 8px 0; text-align: right; color: ${brandColors.dark}; font-size: 14px;">₹${order.subtotal.toFixed(2)}</td>
          </tr>
          ${order.discountAmount && order.discountAmount > 0 ? `
          <tr>
            <td style="padding: 8px 0; color: ${brandColors.success}; font-size: 14px;">
              Discount ${order.couponCode ? `(${order.couponCode})` : ''}
            </td>
            <td style="padding: 8px 0; text-align: right; color: ${brandColors.success}; font-size: 14px;">-₹${order.discountAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 15px 0; color: ${brandColors.dark}; font-size: 18px; font-weight: 700; border-top: 2px solid ${brandColors.dark};">Total</td>
            <td style="padding: 15px 0; text-align: right; color: ${brandColors.primary}; font-size: 20px; font-weight: 700; border-top: 2px solid ${brandColors.dark};">₹${order.totalAmount.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      ${addressHtml}

      ${specialInstructionsHtml}

      <div style="background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border-radius: 10px; padding: 20px; margin-top: 25px; text-align: center;">
        <p style="color: #1E40AF; margin: 0; font-size: 14px; line-height: 1.6;">
          📱 <strong>Track your order</strong><br>
          <span style="font-size: 13px;">You'll receive updates as your order progresses</span>
        </p>
      </div>
    </div>

    ${getFooter()}
  </div>
</body>
</html>
`;
};

/**
 * Order Preparing Email Template
 */
export const orderPreparingEmailTemplate = (order: OrderDetails): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Being Prepared</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    ${getHeader('Cooking in Progress!')}

    <div style="padding: 40px 30px; text-align: center;">
      <div style="margin-bottom: 25px;">
        <span style="font-size: 80px;">👨‍🍳</span>
      </div>

      <h2 style="color: ${brandColors.dark}; margin: 0 0 15px 0; font-size: 26px;">
        Your Food is Being Prepared!
      </h2>

      <p style="color: ${brandColors.gray}; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
        Hey ${order.customerName}, our chefs are now preparing your delicious meal with love and care!
      </p>

      <div style="background: linear-gradient(135deg, ${brandColors.light} 0%, #FFF0E0 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
        <p style="color: ${brandColors.gray}; margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
        <p style="color: ${brandColors.primary}; margin: 0; font-size: 20px; font-weight: 700;">#${order.orderId.slice(-8).toUpperCase()}</p>
      </div>

      <div style="display: flex; justify-content: center; align-items: center; margin: 30px 0;">
        <div style="text-align: center; padding: 0 20px;">
          <div style="width: 50px; height: 50px; background-color: ${brandColors.success}; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 20px; line-height: 50px;">✓</span>
          </div>
          <p style="color: ${brandColors.gray}; margin: 0; font-size: 12px;">Placed</p>
        </div>
        <div style="width: 40px; height: 3px; background: linear-gradient(90deg, ${brandColors.success}, ${brandColors.warning});"></div>
        <div style="text-align: center; padding: 0 20px;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, ${brandColors.warning} 0%, ${brandColors.accent} 100%); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;">
            <span style="color: white; font-size: 24px; line-height: 50px;">👨‍🍳</span>
          </div>
          <p style="color: ${brandColors.warning}; margin: 0; font-size: 12px; font-weight: 600;">Preparing</p>
        </div>
        <div style="width: 40px; height: 3px; background-color: #e0e0e0;"></div>
        <div style="text-align: center; padding: 0 20px;">
          <div style="width: 50px; height: 50px; background-color: #e0e0e0; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 20px; line-height: 50px;">🚴</span>
          </div>
          <p style="color: ${brandColors.gray}; margin: 0; font-size: 12px;">On the way</p>
        </div>
      </div>

      <p style="color: ${brandColors.gray}; font-size: 14px; line-height: 1.6; margin-top: 20px;">
        🕐 Estimated time: <strong>25-35 minutes</strong>
      </p>
    </div>

    ${getFooter()}
  </div>
</body>
</html>
`;

/**
 * Order Ready for Pickup Email Template
 */
export const orderReadyForPickupEmailTemplate = (order: OrderDetails): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Ready for Pickup</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    ${getHeader('Ready for Pickup!')}

    <div style="padding: 40px 30px; text-align: center;">
      <div style="margin-bottom: 25px;">
        <span style="font-size: 80px;">🎉</span>
      </div>

      <h2 style="color: ${brandColors.dark}; margin: 0 0 15px 0; font-size: 26px;">
        Your Order is Ready!
      </h2>

      <p style="color: ${brandColors.gray}; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
        Great news, ${order.customerName}! Your delicious food is packed and waiting for you!
      </p>

      <div style="background: linear-gradient(135deg, ${brandColors.success} 0%, #10B981 100%); border-radius: 16px; padding: 30px; margin: 25px 0;">
        <p style="color: rgba(255,255,255,0.9); margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Order ID</p>
        <p style="color: white; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">#${order.orderId.slice(-8).toUpperCase()}</p>
        <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 15px;">
          <p style="color: white; margin: 0; font-size: 16px; font-weight: 600;">
            🏪 Please pick up at our counter
          </p>
        </div>
      </div>

      <div style="background-color: ${brandColors.lightGray}; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: left;">
        <h3 style="color: ${brandColors.dark}; margin: 0 0 15px 0; font-size: 16px;">
          📍 Pickup Location
        </h3>
        <p style="color: ${brandColors.gray}; margin: 0; font-size: 14px; line-height: 1.8;">
          <strong>RangeelaDhaba</strong><br>
          ${process.env.RESTAURANT_ADDRESS || 'Mumbai'}<br>
          <span style="color: ${brandColors.primary};">📞 Contact us for directions</span>
        </p>
      </div>

      <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 10px; padding: 20px; margin-top: 25px;">
        <p style="color: #92400E; margin: 0; font-size: 14px;">
          ⏰ <strong>Please pick up within 30 minutes</strong><br>
          <span style="font-size: 13px;">to ensure your food stays fresh and hot!</span>
        </p>
      </div>
    </div>

    ${getFooter()}
  </div>
</body>
</html>
`;

/**
 * Order Out for Delivery Email Template
 */
export const orderOutForDeliveryEmailTemplate = (order: OrderDetails): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Out for Delivery</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    ${getHeader('On the Way!')}

    <div style="padding: 40px 30px; text-align: center;">
      <div style="margin-bottom: 25px;">
        <span style="font-size: 80px;">🚴</span>
      </div>

      <h2 style="color: ${brandColors.dark}; margin: 0 0 15px 0; font-size: 26px;">
        Your Order is On Its Way!
      </h2>

      <p style="color: ${brandColors.gray}; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
        Exciting news, ${order.customerName}! Your food is out for delivery and will reach you soon!
      </p>

      <div style="background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); border-radius: 16px; padding: 30px; margin: 25px 0;">
        <p style="color: rgba(255,255,255,0.9); margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Order ID</p>
        <p style="color: white; margin: 0; font-size: 24px; font-weight: 700;">#${order.orderId.slice(-8).toUpperCase()}</p>
      </div>

      <div style="display: flex; justify-content: center; align-items: center; margin: 30px 0;">
        <div style="text-align: center; padding: 0 15px;">
          <div style="width: 45px; height: 45px; background-color: ${brandColors.success}; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 18px; line-height: 45px;">✓</span>
          </div>
          <p style="color: ${brandColors.success}; margin: 0; font-size: 11px;">Placed</p>
        </div>
        <div style="width: 30px; height: 3px; background-color: ${brandColors.success};"></div>
        <div style="text-align: center; padding: 0 15px;">
          <div style="width: 45px; height: 45px; background-color: ${brandColors.success}; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 18px; line-height: 45px;">✓</span>
          </div>
          <p style="color: ${brandColors.success}; margin: 0; font-size: 11px;">Prepared</p>
        </div>
        <div style="width: 30px; height: 3px; background: linear-gradient(90deg, ${brandColors.success}, ${brandColors.primary});"></div>
        <div style="text-align: center; padding: 0 15px;">
          <div style="width: 45px; height: 45px; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 20px; line-height: 45px;">🚴</span>
          </div>
          <p style="color: ${brandColors.primary}; margin: 0; font-size: 11px; font-weight: 600;">On the way</p>
        </div>
        <div style="width: 30px; height: 3px; background-color: #e0e0e0;"></div>
        <div style="text-align: center; padding: 0 15px;">
          <div style="width: 45px; height: 45px; background-color: #e0e0e0; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 18px; line-height: 45px;">🏠</span>
          </div>
          <p style="color: ${brandColors.gray}; margin: 0; font-size: 11px;">Delivered</p>
        </div>
      </div>

      ${order.address ? `
      <div style="background-color: ${brandColors.lightGray}; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: left;">
        <h4 style="color: ${brandColors.dark}; margin: 0 0 10px 0; font-size: 14px;">
          📍 Delivering to
        </h4>
        <p style="color: ${brandColors.gray}; margin: 0; font-size: 14px; line-height: 1.6;">
          ${order.address.street || ''}<br>
          ${order.address.city || ''}${order.address.state ? ', ' + order.address.state : ''} ${order.address.zipCode || ''}
        </p>
      </div>
      ` : ''}

      <p style="color: ${brandColors.gray}; font-size: 14px; line-height: 1.6;">
        🕐 Estimated arrival: <strong>10-15 minutes</strong>
      </p>
    </div>

    ${getFooter()}
  </div>
</body>
</html>
`;

/**
 * Order Delivered Email Template
 */
export const orderDeliveredEmailTemplate = (order: OrderDetails): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Delivered</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    ${getHeader('Order Delivered!')}

    <div style="padding: 40px 30px; text-align: center;">
      <div style="margin-bottom: 25px;">
        <span style="font-size: 80px;">🎊</span>
      </div>

      <h2 style="color: ${brandColors.dark}; margin: 0 0 15px 0; font-size: 26px;">
        Enjoy Your Meal!
      </h2>

      <p style="color: ${brandColors.gray}; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
        Hey ${order.customerName}, your order has been delivered successfully! We hope you enjoy every bite!
      </p>

      <div style="background: linear-gradient(135deg, ${brandColors.success} 0%, #10B981 100%); border-radius: 16px; padding: 30px; margin: 25px 0;">
        <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 36px; line-height: 70px;">✓</span>
        </div>
        <p style="color: white; margin: 0; font-size: 18px; font-weight: 600;">Delivered Successfully!</p>
        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">Order #${order.orderId.slice(-8).toUpperCase()}</p>
      </div>

      <div style="background: linear-gradient(135deg, ${brandColors.light} 0%, #FFF0E0 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
        <h3 style="color: ${brandColors.dark}; margin: 0 0 15px 0; font-size: 18px;">
          ⭐ How was your experience?
        </h3>
        <p style="color: ${brandColors.gray}; margin: 0 0 20px 0; font-size: 14px;">
          Your feedback helps us serve you better!
        </p>
        <a href="${process.env.APP_URL || 'http://localhost:5173'}/orders"
           style="display: inline-block; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 14px;">
          Rate Your Order →
        </a>
      </div>

      <div style="border-top: 1px solid #e0e0e0; padding-top: 25px; margin-top: 25px;">
        <p style="color: ${brandColors.gray}; font-size: 14px; margin: 0 0 15px 0;">
          Craving more? Order again!
        </p>
        <a href="${process.env.APP_URL || 'http://localhost:5173'}/menu"
           style="display: inline-block; border: 2px solid ${brandColors.primary}; color: ${brandColors.primary}; text-decoration: none; padding: 10px 25px; border-radius: 25px; font-weight: 600; font-size: 14px;">
          Browse Menu
        </a>
      </div>
    </div>

    ${getFooter()}
  </div>
</body>
</html>
`;

/**
 * Order Cancelled Email Template
 */
export const orderCancelledEmailTemplate = (order: OrderDetails, reason?: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    ${getHeader('Order Cancelled')}

    <div style="padding: 40px 30px; text-align: center;">
      <div style="margin-bottom: 25px;">
        <span style="font-size: 80px;">😔</span>
      </div>

      <h2 style="color: ${brandColors.dark}; margin: 0 0 15px 0; font-size: 26px;">
        Order Cancelled
      </h2>

      <p style="color: ${brandColors.gray}; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
        We're sorry, ${order.customerName}. Your order has been cancelled.
      </p>

      <div style="background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); border-radius: 16px; padding: 30px; margin: 25px 0; border: 1px solid #FCA5A5;">
        <p style="color: ${brandColors.error}; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Cancelled Order</p>
        <p style="color: ${brandColors.dark}; margin: 0; font-size: 20px; font-weight: 700;">#${order.orderId.slice(-8).toUpperCase()}</p>
        ${reason ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #FCA5A5;">
          <p style="color: ${brandColors.gray}; margin: 0; font-size: 14px;">
            <strong>Reason:</strong> ${reason}
          </p>
        </div>
        ` : ''}
      </div>

      <div style="background-color: ${brandColors.lightGray}; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: left;">
        <h3 style="color: ${brandColors.dark}; margin: 0 0 15px 0; font-size: 16px;">
          💰 Refund Information
        </h3>
        <p style="color: ${brandColors.gray}; margin: 0; font-size: 14px; line-height: 1.8;">
          If you've already made a payment, your refund of <strong style="color: ${brandColors.primary};">₹${order.totalAmount.toFixed(2)}</strong> will be processed within <strong>5-7 business days</strong> to your original payment method.
        </p>
      </div>

      <div style="border-top: 1px solid #e0e0e0; padding-top: 25px; margin-top: 25px;">
        <p style="color: ${brandColors.gray}; font-size: 14px; margin: 0 0 15px 0;">
          We'd love to serve you again!
        </p>
        <a href="${process.env.APP_URL || 'http://localhost:5173'}/menu"
           style="display: inline-block; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 14px;">
          Order Again →
        </a>
      </div>

      <p style="color: ${brandColors.gray}; font-size: 13px; margin-top: 25px;">
        Need help? <a href="#" style="color: ${brandColors.primary}; text-decoration: none;">Contact our support team</a>
      </p>
    </div>

    ${getFooter()}
  </div>
</body>
</html>
`;
