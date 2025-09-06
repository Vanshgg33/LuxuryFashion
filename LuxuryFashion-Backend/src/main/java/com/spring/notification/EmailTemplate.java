package com.spring.notification;

public class EmailTemplate {
    public static String getResetEmailTemplate(String token, String hostURL, Object o) {
        String resetLink = hostURL + "/reset-password?token=" + token;

        return """
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            text-align: center;
                            padding: 40px;
                        }
                        .email-container {
                            background: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                            max-width: 500px;
                            margin: auto;
                        }
                        .button {
                            display: inline-block;
                            padding: 10px 20px;
                            font-size: 16px;
                            color: #fff;
                            background-color: #007bff;
                            text-decoration: none;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                        .footer {
                            margin-top: 20px;
                            font-size: 12px;
                            color: #888;
                        }
                        .link-box {
                            word-break: break-all;
                            background: #eee;
                            padding: 10px;
                            border-radius: 5px;
                            margin-top: 10px;
                            cursor: pointer;
                        }
                    </style>
                    <script>
                        function copyToClipboard() {
                            var copyText = document.getElementById("resetLink").innerText;
                            navigator.clipboard.writeText(copyText).then(function() {
                                alert("Link copied to clipboard!");
                            }, function(err) {
                                alert("Failed to copy link: " + err);
                            });
                        }
                    </script>
                </head>
                <body>
                    <div class="email-container">
                        <h2>Password Reset Request</h2>
                        <p>You requested to reset your password. Click the button below to proceed:</p>
                        <a href=""" + resetLink + """
                 class="button">Reset Password</a>
                <p>This link is valid for 10 minutes. If the button above does not work, copy and paste the link below into your browser:</p>
                <div class="link-box" id="resetLink" onclick="copyToClipboard()">""" + resetLink + """
                        </div>
                        <p>If you did not request this, please ignore this email.</p>
                        <div class="footer">&copy; 2024 Ikaansh Edutech Private Limited. All rights reserved.</div>
                    </div>
                </body>
                </html>
                """;
    }

    public static String getWelcomeTemplate(String name, String email, String appDownloadUrl) {
        String trackableDownloadUrl = appDownloadUrl + "?utm_source=welcome_email&utm_medium=email&utm_campaign=user_onboarding";

        return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Luminex</title>
    </head>
    <body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, sans-serif; color:#333;">
      <table role="presentation" style="width:100%%; border-collapse:collapse; background:#f4f6f8;">
        <tr>
          <td align="center" style="padding:40px 15px;">
            <!-- Main container -->
            <table role="presentation" style="max-width:600px; width:100%%; background:#ffffff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.08); overflow:hidden;">
              <!-- Header -->
              <tr>
                <td align="center" style="background: linear-gradient(135deg,#6a11cb,#2575fc); padding:40px 20px; color:#ffffff;">
                  <h1 style="margin:0; font-size:28px; font-weight:700;">✨ Welcome to Luminex</h1>
                  <p style="margin:8px 0 0; font-size:16px; opacity:0.9;">Your journey starts here 🚀</p>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding:30px 25px;">
                  <p style="font-size:18px; font-weight:600; margin:0;">Hello, %s 👋</p>
                  <p style="font-size:15px; line-height:1.6; margin:16px 0;">
                    We're thrilled to welcome you to the <strong>Luminex</strong> community! Your registration was successful, and you're now part of something amazing.
                  </p>
                  <p style="font-size:15px; line-height:1.6; margin:12px 0;">
                    Your account is set up with the email: <a href="mailto:%s" style="color:#2575fc; text-decoration:none;">%s</a>
                  </p>
                </td>
              </tr>

              <!-- Features -->
              <tr>
                <td style="padding:20px 25px; background:#f9fafc;">
                  <h3 style="margin:0 0 15px; font-size:18px; color:#222;">🚀 What You Can Do With Luminex</h3>
                  <ul style="padding-left:20px; margin:0; font-size:15px; line-height:1.8; color:#555;">
                    <li>Access our comprehensive dashboard and analytics</li>
                    <li>Connect with a vibrant community of users</li>
                    <li>Enjoy premium features and regular updates</li>
                    <li>Get 24/7 customer support when you need it</li>
                  </ul>
                </td>
              </tr>

              <!-- CTA -->
              <tr>
                <td style="padding:35px 25px; text-align:center;">
                  <a href="%s" target="_blank" 
                    style="display:inline-block; background:#2575fc; color:#ffffff; text-decoration:none; padding:14px 28px; 
                           font-size:16px; font-weight:600; border-radius:8px; box-shadow:0 4px 10px rgba(37,117,252,0.3);">
                    📲 Download the Mobile App
                  </a>
                  <p style="font-size:13px; margin-top:15px; color:#666;">If the button doesn’t work, copy this link:</p>
                  <p style="font-size:13px; word-break:break-all; color:#2575fc;">%s</p>
                </td>
              </tr>

              <!-- Support -->
              <tr>
                <td style="padding:20px 25px; background:#f9fafc; text-align:center;">
                  <h4 style="margin:0 0 8px; font-size:16px;">💬 Need Help Getting Started?</h4>
                  <p style="margin:0; font-size:14px; color:#666;">Our support team is here for you. Just reply to this email if you need assistance.</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding:25px; font-size:12px; color:#999;">
                  <p style="margin:0;">&copy; %d Luminex. All rights reserved.</p>
                  <p style="margin:5px 0 0;">You’re receiving this email because you registered for a Luminex account.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """.formatted(name, email, email, trackableDownloadUrl, trackableDownloadUrl, java.time.Year.now().getValue());
    }


}