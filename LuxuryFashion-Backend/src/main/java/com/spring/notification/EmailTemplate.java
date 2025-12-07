package com.spring.notification;

public class EmailTemplate {
    // Support contact information
    private static final String SUPPORT_EMAIL = "rangeelaboutique6@gmail.com";
    private static final String SUPPORT_PHONE = "8981260291";
    
    // Common premium footer with support information
    private static String getSupportFooter(int year) {
        return String.format("""
            <tr>
                <td style="background: linear-gradient(180deg, #ffffff 0%%, #f8f9fa 50%%, #f0f0f0 100%%); padding: 40px 30px; text-align: center; border-top: 3px solid #d4af37;">
                    <div style="margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #e0e0e0;">
                        <h3 style="margin: 0 0 20px; color: #2c2c2c; font-size: 20px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Need Help?</h3>
                        <div style="display: inline-block; margin: 0 25px 15px; vertical-align: top; padding: 15px 20px; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            <p style="margin: 0 0 8px; color: #666; font-size: 12px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">Email</p>
                            <a href="mailto:%s" style="color: #d4af37; text-decoration: none; font-size: 15px; font-weight: 600; transition: color 0.3s;">%s</a>
                        </div>
                        <div style="display: inline-block; margin: 0 25px 15px; vertical-align: top; padding: 15px 20px; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            <p style="margin: 0 0 8px; color: #666; font-size: 12px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">Phone</p>
                            <a href="tel:%s" style="color: #d4af37; text-decoration: none; font-size: 15px; font-weight: 600;">%s</a>
                        </div>
                    </div>
                    <div style="padding-top: 20px;">
                        <p style="margin: 0 0 8px; color: #999; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase;">&copy; %d Food Ordering. All Rights Reserved.</p>
                        <p style="margin: 0; color: #999; font-size: 11px; letter-spacing: 0.3px;">This is an automated email. Please do not reply directly to this message.</p>
                    </div>
                </td>
            </tr>
            """, SUPPORT_EMAIL, SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE, year);
    }

    public static String getResetEmailTemplate(String token, String hostURL, Object o) {
        String resetLink = hostURL + "/reset-password?token=" + token;
        int year = java.time.Year.now().getValue();

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset - Food Ordering</title>
            </head>
            <body style="margin:0; padding:0; background: linear-gradient(135deg, #f5f7fa 0%%, #e8e8e8 50%%, #d4d4d4 100%%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                <table style="width:100%%; max-width:620px; margin:50px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 50%%, #5a3d7a 100%%); padding:50px 40px; text-align:center; position:relative;">
                            <div style="position:absolute; top:0; left:0; right:0; height:5px; background: linear-gradient(90deg, #ffd700 0%%, #ffed4e 50%%, #ffd700 100%%);"></div>
                            <div style="display: inline-block; padding: 15px 25px; background: rgba(255,255,255,0.15); border-radius: 50px; backdrop-filter: blur(10px); margin-bottom: 20px;">
                                <h1 style="margin:0; font-size:32px; color:#ffffff; font-weight:700; letter-spacing: 1px; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">🔐 Password Reset</h1>
                            </div>
                            <p style="margin:15px 0 0; font-size:16px; color:#f0f0f0; letter-spacing: 0.5px; font-weight: 400;">Food Ordering</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:50px 40px; background: linear-gradient(180deg, #ffffff 0%%, #fafafa 100%%);">
                            <p style="font-size:18px; margin:0 0 25px; color:#2c2c2c; line-height:1.7; font-weight: 500; letter-spacing: 0.3px;">Hello,</p>
                            <p style="font-size:16px; margin:0 0 35px; color:#555; line-height:1.8; font-weight: 400;">You requested to reset your password. Click the button below to create a new secure password for your account.</p>
                            
                            <div style="text-align:center; margin:40px 0;">
                                <a href="%s" style="display:inline-block; padding:18px 45px; background: linear-gradient(135deg, #667eea 0%%, #764ba2 50%%, #5a3d7a 100%%); color:#ffffff; text-decoration:none; border-radius:12px; font-size:16px; font-weight:600; letter-spacing: 0.5px; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4), 0 0 0 0 rgba(102, 126, 234, 0.5); transition: all 0.3s ease; border: 2px solid rgba(255,255,255,0.2);">Reset Password</a>
                            </div>
                            
                            <div style="border-top: 2px solid #e8e8e8; border-bottom: 2px solid #e8e8e8; padding:30px 0; margin:40px 0; background: linear-gradient(90deg, transparent 0%%, #f8f9fa 50%%, transparent 100%%);">
                                <p style="font-size:14px; margin:0 0 20px; color:#666; line-height:1.7; font-weight: 400; text-align:center;">This link expires in 10 minutes. If the button doesn't work, copy and paste this link:</p>
                                <div style="background: linear-gradient(135deg, #f8f9fa 0%%, #ffffff 100%%); padding:20px; border-radius:10px; border-left:5px solid #667eea; border: 1px solid #e0e0e0; word-break:break-all; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                    <p style="margin:0; font-size:12px; color:#333; font-family:'Courier New', 'Monaco', monospace; line-height:1.6; letter-spacing: 0.3px;">%s</p>
                                </div>
                            </div>
                            
                            <p style="font-size:14px; margin:30px 0 0; color:#888; line-height:1.8; font-weight: 300; font-style:italic; padding: 15px; background: #fff9e6; border-left: 4px solid #ffd700; border-radius: 6px;">If you did not request this password reset, please ignore this email. Your account remains secure.</p>
                        </td>
                    </tr>
                    %s
                </table>
            </body>
            </html>
            """, resetLink, resetLink, getSupportFooter(year));
    }

    public static String getWelcomeTemplate(String name, String email) {
        int year = java.time.Year.now().getValue();
        return String.format("""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Food Ordering</title>
    </head>
    <body style="margin:0; padding:0; background: linear-gradient(135deg, #f5f7fa 0%%, #e8e8e8 50%%, #d4d4d4 100%%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table style="width:100%%; max-width:620px; margin:50px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);">
            <tr>
                <td style="background: linear-gradient(135deg, #d4af37 0%%, #ffd700 50%%, #ffed4e 100%%); padding:50px 40px; text-align:center; position:relative;">
                    <div style="position:absolute; top:0; left:0; right:0; height:5px; background: linear-gradient(90deg, #1a1a1a 0%%, #2c2c2c 50%%, #1a1a1a 100%%);"></div>
                    <div style="display: inline-block; padding: 20px 30px; background: rgba(255,255,255,0.2); border-radius: 50px; backdrop-filter: blur(10px); margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h1 style="margin:0; font-size:36px; color:#2c2c2c; font-weight:800; text-shadow: 0 2px 8px rgba(255,255,255,0.5); letter-spacing: 1px;">✨ Welcome to Food Ordering</h1>
                    </div>
                    <p style="margin:18px 0 0; font-size:20px; color:#2c2c2c; font-weight:600; letter-spacing: 0.5px; text-shadow: 0 1px 3px rgba(255,255,255,0.3);">Your luxury journey begins now 👑</p>
                </td>
            </tr>
            <tr>
                <td style="padding:50px 40px; background: linear-gradient(180deg, #ffffff 0%%, #fafafa 100%%);">
                    <p style="font-size:22px; margin:0 0 25px; color:#2c2c2c; font-weight:700; letter-spacing: 0.5px; line-height: 1.4;">Hello, %s 👋</p>
                    <p style="font-size:17px; line-height:1.9; color:#555; margin:0 0 30px; font-weight: 400; letter-spacing: 0.2px;">Thank you for joining Food Ordering! We're thrilled to have you as part of our exclusive community of fashion enthusiasts.</p>
                    
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%%, #ffffff 50%%, #f0f0f0 100%%); padding:30px; border-radius:12px; margin:30px 0; border-left:5px solid #d4af37; box-shadow: 0 4px 15px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5); border: 1px solid #e8e8e8;">
                        <p style="font-size:14px; margin:0 0 12px; color:#666; font-weight:600; letter-spacing: 1px; text-transform: uppercase;">Your Account</p>
                        <p style="font-size:18px; margin:0;"><a href="mailto:%s" style="color:#d4af37; text-decoration:none; font-weight:700; letter-spacing: 0.3px; text-shadow: 0 1px 2px rgba(212,175,55,0.2);">%s</a></p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #fff9e6 0%%, #ffffff 50%%, #fffbf0 100%%); padding:35px; border-radius:12px; margin:30px 0; border:3px solid #ffd700; box-shadow: 0 6px 20px rgba(255,215,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8);">
                        <h3 style="margin:0 0 20px; color:#2c2c2c; font-size:22px; font-weight:700; letter-spacing: 0.5px; text-align:center;">🛍️ What Awaits You</h3>
                        <div style="border-top: 2px solid #ffd700; padding-top: 20px; margin-top: 20px;">
                            <ul style="margin:0; padding-left:0; list-style:none; color:#555; line-height:2.2;">
                                <li style="margin-bottom:12px; font-size:16px; padding-left: 30px; position: relative; font-weight: 500;">
                                    <span style="position: absolute; left: 0; color: #d4af37; font-size: 20px;">✨</span>
                                    Exclusive luxury fashion collections
                                </li>
                                <li style="margin-bottom:12px; font-size:16px; padding-left: 30px; position: relative; font-weight: 500;">
                                    <span style="position: absolute; left: 0; color: #d4af37; font-size: 20px;">✨</span>
                                    Premium quality products
                                </li>
                                <li style="margin-bottom:12px; font-size:16px; padding-left: 30px; position: relative; font-weight: 500;">
                                    <span style="position: absolute; left: 0; color: #d4af37; font-size: 20px;">✨</span>
                                    Fast and secure delivery
                                </li>
                                <li style="margin-bottom:0; font-size:16px; padding-left: 30px; position: relative; font-weight: 500;">
                                    <span style="position: absolute; left: 0; color: #d4af37; font-size: 20px;">✨</span>
                                    Personalized shopping experience
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="text-align:center; margin:40px 0 30px;">
                        <a href="#" style="display:inline-block; padding:18px 45px; background: linear-gradient(135deg, #d4af37 0%%, #ffd700 50%%, #ffed4e 100%%); color:#2c2c2c; text-decoration:none; border-radius:12px; font-size:17px; font-weight:700; letter-spacing: 0.5px; box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4), 0 0 0 0 rgba(212, 175, 55, 0.5); transition: all 0.3s ease; border: 2px solid rgba(255,255,255,0.3); text-shadow: 0 1px 2px rgba(255,255,255,0.5);">Start Shopping</a>
                    </div>
                </td>
            </tr>
            %s
        </table>
    </body>
    </html>
    """, name, email, email, getSupportFooter(year));
    }

    public static String getOAuthWelcomeTemplate(String name, String email, String password) {
        int year = java.time.Year.now().getValue();
        return String.format("""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Food Ordering</title>
    </head>
    <body style="margin:0; padding:0; background: linear-gradient(135deg, #f5f7fa 0%%, #e8e8e8 50%%, #d4d4d4 100%%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table style="width:100%%; max-width:620px; margin:50px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);">
            <tr>
                <td style="background: linear-gradient(135deg, #d4af37 0%%, #ffd700 50%%, #ffed4e 100%%); padding:50px 40px; text-align:center; position:relative;">
                    <div style="position:absolute; top:0; left:0; right:0; height:5px; background: linear-gradient(90deg, #1a1a1a 0%%, #2c2c2c 50%%, #1a1a1a 100%%);"></div>
                    <div style="display: inline-block; padding: 20px 30px; background: rgba(255,255,255,0.2); border-radius: 50px; backdrop-filter: blur(10px); margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h1 style="margin:0; font-size:36px; color:#2c2c2c; font-weight:800; text-shadow: 0 2px 8px rgba(255,255,255,0.5); letter-spacing: 1px;">✨ Welcome to Food Ordering</h1>
                    </div>
                    <p style="margin:18px 0 0; font-size:20px; color:#2c2c2c; font-weight:600; letter-spacing: 0.5px; text-shadow: 0 1px 3px rgba(255,255,255,0.3);">Your luxury journey begins now 👑</p>
                </td>
            </tr>
            <tr>
                <td style="padding:50px 40px; background: linear-gradient(180deg, #ffffff 0%%, #fafafa 100%%);">
                    <p style="font-size:22px; margin:0 0 25px; color:#2c2c2c; font-weight:700; letter-spacing: 0.5px; line-height: 1.4;">Hello, %s 👋</p>
                    <p style="font-size:17px; line-height:1.9; color:#555; margin:0 0 30px; font-weight: 400; letter-spacing: 0.2px;">Thank you for joining Food Ordering through Google! We're thrilled to have you as part of our exclusive community of fashion connoisseurs.</p>
                    
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%%, #ffffff 50%%, #f0f0f0 100%%); padding:35px; border-radius:12px; margin:30px 0; border-left:5px solid #d4af37; box-shadow: 0 4px 15px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5); border: 1px solid #e8e8e8;">
                        <p style="font-size:14px; margin:0 0 20px; color:#666; font-weight:600; letter-spacing: 1px; text-transform: uppercase;">Your Account Details</p>
                        <div style="border-bottom: 2px solid #e8e8e8; padding-bottom: 25px; margin-bottom: 25px;">
                            <p style="font-size:13px; margin:0 0 10px; color:#888; font-weight:500; letter-spacing: 0.5px; text-transform: uppercase;">Email Address</p>
                            <p style="font-size:18px; margin:0;"><a href="mailto:%s" style="color:#d4af37; text-decoration:none; font-weight:700; letter-spacing: 0.3px; text-shadow: 0 1px 2px rgba(212,175,55,0.2);">%s</a></p>
                        </div>
                        <div>
                            <p style="font-size:13px; margin:0 0 15px; color:#888; font-weight:500; letter-spacing: 0.5px; text-transform: uppercase;">Your Password</p>
                            <div style="background: linear-gradient(135deg, #ffffff 0%%, #fff9e6 100%%); padding:20px 25px; border: 3px solid #d4af37; border-radius:10px; text-align:center; margin:15px 0; box-shadow: 0 4px 15px rgba(212,175,55,0.2), inset 0 1px 0 rgba(255,255,255,0.8);">
                                <p style="margin:0; font-size:26px; color:#2c2c2c; font-weight:800; letter-spacing:4px; font-family:'Courier New', 'Monaco', monospace; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">%s</p>
                            </div>
                            <p style="font-size:14px; margin:20px 0 0; color:#888; line-height:1.7; font-weight: 400; font-style:italic; padding: 12px; background: #fff9e6; border-left: 4px solid #ffd700; border-radius: 6px;">Please save this password securely. You can use it to log in directly to your account anytime.</p>
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #fff9e6 0%%, #ffffff 50%%, #fffbf0 100%%); padding:35px; border-radius:12px; margin:30px 0; border:3px solid #ffd700; box-shadow: 0 6px 20px rgba(255,215,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8);">
                        <h3 style="margin:0 0 20px; color:#2c2c2c; font-size:22px; font-weight:700; letter-spacing: 0.5px; text-align:center;">🛍️ What Awaits You</h3>
                        <div style="border-top: 2px solid #ffd700; padding-top: 20px; margin-top: 20px;">
                            <ul style="margin:0; padding-left:0; list-style:none; color:#555; line-height:2.2;">
                                <li style="margin-bottom:12px; font-size:16px; padding-left: 30px; position: relative; font-weight: 500;">
                                    <span style="position: absolute; left: 0; color: #d4af37; font-size: 20px;">✨</span>
                                    Exclusive luxury fashion collections
                                </li>
                                <li style="margin-bottom:12px; font-size:16px; padding-left: 30px; position: relative; font-weight: 500;">
                                    <span style="position: absolute; left: 0; color: #d4af37; font-size: 20px;">✨</span>
                                    Premium quality products
                                </li>
                                <li style="margin-bottom:12px; font-size:16px; padding-left: 30px; position: relative; font-weight: 500;">
                                    <span style="position: absolute; left: 0; color: #d4af37; font-size: 20px;">✨</span>
                                    Fast and secure delivery
                                </li>
                                <li style="margin-bottom:0; font-size:16px; padding-left: 30px; position: relative; font-weight: 500;">
                                    <span style="position: absolute; left: 0; color: #d4af37; font-size: 20px;">✨</span>
                                    Personalized shopping experience
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="text-align:center; margin:40px 0 30px;">
                        <a href="#" style="display:inline-block; padding:18px 45px; background: linear-gradient(135deg, #d4af37 0%%, #ffd700 50%%, #ffed4e 100%%); color:#2c2c2c; text-decoration:none; border-radius:12px; font-size:17px; font-weight:700; letter-spacing: 0.5px; box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4), 0 0 0 0 rgba(212, 175, 55, 0.5); transition: all 0.3s ease; border: 2px solid rgba(255,255,255,0.3); text-shadow: 0 1px 2px rgba(255,255,255,0.5);">Start Shopping</a>
                    </div>
                </td>
            </tr>
            %s
        </table>
    </body>
    </html>
    """, name, email, email, password, getSupportFooter(year));
    }

    public static String getOrderConfirmationTemplate(String customerName, Long orderId, Double totalPrice, String itemsHtml, String addressHtml) {
        int year = java.time.Year.now().getValue();
        return String.format("""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Food Ordering</title>
    </head>
    <body style="margin:0; padding:0; background: linear-gradient(135deg, #f5f7fa 0%%, #e8e8e8 50%%, #d4d4d4 100%%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table style="width:100%%; max-width:620px; margin:50px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);">
            <tr>
                <td style="background: linear-gradient(135deg, #d4af37 0%%, #ffd700 50%%, #ffed4e 100%%); padding:50px 40px; text-align:center; position:relative;">
                    <div style="position:absolute; top:0; left:0; right:0; height:5px; background: linear-gradient(90deg, #1a1a1a 0%%, #2c2c2c 50%%, #1a1a1a 100%%);"></div>
                    <div style="display: inline-block; padding: 20px 30px; background: rgba(255,255,255,0.2); border-radius: 50px; backdrop-filter: blur(10px); margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h1 style="margin:0; font-size:36px; color:#2c2c2c; font-weight:800; text-shadow: 0 2px 8px rgba(255,255,255,0.5); letter-spacing: 1px;">🎉 Order Confirmed!</h1>
                    </div>
                    <p style="margin:18px 0 0; font-size:20px; color:#2c2c2c; font-weight:600; letter-spacing: 0.5px; text-shadow: 0 1px 3px rgba(255,255,255,0.3);">Thank you for your purchase</p>
                </td>
            </tr>
            <tr>
                <td style="padding:50px 40px; background: linear-gradient(180deg, #ffffff 0%%, #fafafa 100%%);">
                    <p style="font-size:22px; margin:0 0 25px; color:#2c2c2c; font-weight:700; letter-spacing: 0.5px; line-height: 1.4;">Dear %s,</p>
                    <p style="font-size:17px; line-height:1.9; color:#555; margin:0 0 35px; font-weight: 400; letter-spacing: 0.2px;">Thank you for your order! We're excited to prepare your luxury items with the utmost care and attention.</p>
                    
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%%, #ffffff 50%%, #f0f0f0 100%%); padding:35px; border-radius:12px; margin:30px 0; border-left:5px solid #d4af37; box-shadow: 0 4px 15px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5); border: 1px solid #e8e8e8;">
                        <h3 style="margin:0 0 25px; color:#2c2c2c; font-size:22px; font-weight:700; letter-spacing: 0.5px; text-align:center;">📋 Order Details</h3>
                        <div style="border-top: 2px solid #d4af37; padding-top: 20px; margin-top: 20px;">
                            <div style="padding: 15px 0; border-bottom: 1px solid #e8e8e8;">
                                <p style="margin:0 0 8px; font-size:13px; color:#888; font-weight:600; letter-spacing: 1px; text-transform: uppercase;">Order Number</p>
                                <p style="margin:0; font-size:24px; color:#d4af37; font-weight:800; letter-spacing: 1px;">#%d</p>
                            </div>
                            <div style="padding: 15px 0;">
                                <p style="margin:0 0 8px; font-size:13px; color:#888; font-weight:600; letter-spacing: 1px; text-transform: uppercase;">Total Amount</p>
                                <p style="margin:0; font-size:32px; color:#d4af37; font-weight:800; letter-spacing: 1px;">₹%.2f</p>
                            </div>
                        </div>
                    </div>
                    
                    %s
                    %s
                    
                    <div style="background: linear-gradient(135deg, #e7f3ff 0%%, #ffffff 50%%, #f0f8ff 100%%); padding:30px; border-radius:12px; margin:30px 0; border-left:5px solid #2196F3; box-shadow: 0 4px 15px rgba(33, 150, 243, 0.15), inset 0 1px 0 rgba(255,255,255,0.5); border: 1px solid #e0e8f0;">
                        <p style="margin:0 0 15px; color:#1976D2; font-size:18px; font-weight:700; letter-spacing: 0.5px;">📦 What's Next?</p>
                        <p style="margin:15px 0 0; color:#555; font-size:15px; line-height:1.8; font-weight: 400;">We'll send you updates as your order progresses. You can track your order status in your account dashboard.</p>
                    </div>
                </td>
            </tr>
            %s
        </table>
    </body>
    </html>
    """, customerName, orderId, totalPrice, itemsHtml, addressHtml, getSupportFooter(year));
    }

    public static String getOrderStatusUpdateTemplate(String customerName, Long orderId, String status) {
        String statusMessage = getStatusMessage(status);
        String statusEmoji = getStatusEmoji(status);
        int year = java.time.Year.now().getValue();
        
        return String.format("""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update - Food Ordering</title>
    </head>
    <body style="margin:0; padding:0; background: linear-gradient(135deg, #f5f7fa 0%%, #e8e8e8 50%%, #d4d4d4 100%%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table style="width:100%%; max-width:620px; margin:50px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);">
            <tr>
                <td style="background: linear-gradient(135deg, #d4af37 0%%, #ffd700 50%%, #ffed4e 100%%); padding:50px 40px; text-align:center; position:relative;">
                    <div style="position:absolute; top:0; left:0; right:0; height:5px; background: linear-gradient(90deg, #1a1a1a 0%%, #2c2c2c 50%%, #1a1a1a 100%%);"></div>
                    <div style="display: inline-block; padding: 20px 30px; background: rgba(255,255,255,0.2); border-radius: 50px; backdrop-filter: blur(10px); margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h1 style="margin:0; font-size:36px; color:#2c2c2c; font-weight:800; text-shadow: 0 2px 8px rgba(255,255,255,0.5); letter-spacing: 1px;">%s Order Update</h1>
                    </div>
                    <p style="margin:18px 0 0; font-size:20px; color:#2c2c2c; font-weight:600; letter-spacing: 0.5px; text-shadow: 0 1px 3px rgba(255,255,255,0.3);">Food Ordering</p>
                </td>
            </tr>
            <tr>
                <td style="padding:50px 40px; background: linear-gradient(180deg, #ffffff 0%%, #fafafa 100%%);">
                    <p style="font-size:22px; margin:0 0 25px; color:#2c2c2c; font-weight:700; letter-spacing: 0.5px; line-height: 1.4;">Dear %s,</p>
                    <p style="font-size:17px; line-height:1.9; color:#555; margin:0 0 35px; font-weight: 400; letter-spacing: 0.2px;">%s</p>
                    
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%%, #ffffff 50%%, #f0f0f0 100%%); padding:35px; border-radius:12px; margin:30px 0; border-left:5px solid #d4af37; box-shadow: 0 4px 15px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5); border: 1px solid #e8e8e8;">
                        <h3 style="margin:0 0 25px; color:#2c2c2c; font-size:22px; font-weight:700; letter-spacing: 0.5px; text-align:center;">📋 Order Information</h3>
                        <div style="border-top: 2px solid #d4af37; padding-top: 20px; margin-top: 20px;">
                            <div style="padding: 15px 0; border-bottom: 1px solid #e8e8e8;">
                                <p style="margin:0 0 8px; font-size:13px; color:#888; font-weight:600; letter-spacing: 1px; text-transform: uppercase;">Order Number</p>
                                <p style="margin:0; font-size:24px; color:#d4af37; font-weight:800; letter-spacing: 1px;">#%d</p>
                            </div>
                            <div style="padding: 15px 0;">
                                <p style="margin:0 0 8px; font-size:13px; color:#888; font-weight:600; letter-spacing: 1px; text-transform: uppercase;">Current Status</p>
                                <p style="margin:0; font-size:24px; color:#d4af37; font-weight:800; letter-spacing: 1px; text-transform: uppercase;">%s</p>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
            %s
        </table>
    </body>
    </html>
    """, statusEmoji, customerName, statusMessage, orderId, status, getSupportFooter(year));
    }

    private static String getStatusMessage(String status) {
        return switch (status.toUpperCase()) {
            case "CONFIRMED" -> "Great news! Your order has been confirmed and is being prepared.";
            case "SHIPPED" -> "Your order is on its way! You should receive it soon.";
            case "DELIVERED" -> "Your order has been delivered! We hope you love your new items.";
            case "CANCELLED" -> "Your order has been cancelled. If you have any questions, please contact us.";
            default -> "Your order status has been updated.";
        };
    }

    private static String getStatusEmoji(String status) {
        return switch (status.toUpperCase()) {
            case "CONFIRMED" -> "✅";
            case "SHIPPED" -> "🚚";
            case "DELIVERED" -> "📦";
            case "CANCELLED" -> "❌";
            default -> "📋";
        };
    }
}
