"""
Email service using Microsoft Graph API
"""
import requests
import random
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

# Microsoft Graph API credentials
TENANT_ID = "a0949e3f-bafa-4cf3-b597-1e49993ebd73"
CLIENT_ID = "da85cd2a-7451-4dc4-ad95-9c5dce442d28"
CLIENT_SECRET = "Kgq8Q~uiMuCuScDfoLDUEiXTiHCJC3p8CXbjdbsU"
FROM_EMAIL = "sales@oawo.co.uk"

def get_access_token() -> str:
    """Get Microsoft Graph API access token"""
    url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
    
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials"
    }
    
    response = requests.post(url, data=data)
    response.raise_for_status()
    return response.json()["access_token"]

def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send email via Microsoft Graph API"""
    try:
        token = get_access_token()
        
        url = f"https://graph.microsoft.com/v1.0/users/{FROM_EMAIL}/sendMail"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "message": {
                "subject": subject,
                "body": {
                    "contentType": "HTML",
                    "content": html_body
                },
                "toRecipients": [
                    {
                        "emailAddress": {
                            "address": to_email
                        }
                    }
                ]
            },
            "saveToSentItems": "true"
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return True
        
    except Exception as e:
        print(f"Email send error: {str(e)}")
        return False

def generate_otp(length: int = 6) -> str:
    """Generate random OTP"""
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

def generate_reset_token() -> str:
    """Generate secure password reset token"""
    return secrets.token_urlsafe(32)

def send_verification_email(to_email: str, otp: str, full_name: str) -> bool:
    """Send email verification OTP"""
    subject = "Verify Your Email - Buildown Platform"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #2563eb; }}
            .logo {{ max-width: 150px; }}
            .content {{ padding: 30px 20px; }}
            .otp-box {{ background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
            .otp {{ font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://account.buildown.design/bod_logo.png" alt="Buildown" class="logo">
            </div>
            
            <div class="content">
                <h2>Welcome, {full_name}! 👋</h2>
                <p>Thank you for registering with Buildown Platform.</p>
                <p>Please verify your email address by entering this code:</p>
                
                <div class="otp-box">
                    <div class="otp">{otp}</div>
                </div>
                
                <p><strong>This code will expire in 1 hour.</strong></p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
            
            <div class="footer">
                <p>© 2024 Buildown Platform. All rights reserved.</p>
                <p>OAWO - Build Your Digital Empire</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_body)

def send_password_reset_email(to_email: str, reset_token: str, full_name: str) -> bool:
    """Send password reset link"""
    reset_link = f"https://account.buildown.design/reset-password/{reset_token}"
    
    subject = "Reset Your Password - Buildown Platform"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 20px 0; border-bottom: 2px solid #2563eb; }}
            .logo {{ max-width: 150px; }}
            .content {{ padding: 30px 20px; }}
            .button {{ display: inline-block; padding: 15px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://account.buildown.design/bod_logo.png" alt="Buildown" class="logo">
            </div>
            
            <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hi {full_name},</p>
                <p>We received a request to reset your password.</p>
                <p>Click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </div>
                
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
                
                <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                    If the button doesn't work, copy and paste this link:<br>
                    {reset_link}
                </p>
            </div>
            
            <div class="footer">
                <p>© 2024 Buildown Platform. All rights reserved.</p>
                <p>OAWO - Build Your Digital Empire</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_body)
