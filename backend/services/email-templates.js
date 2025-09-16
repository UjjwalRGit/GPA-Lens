// 1. WELCOME EMAIL TEMPLATE (Registration)
const welcomeEmailTemplate = (dashURL, username) => `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 50%, #e0e7ff 100%); border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c2d92 0%, #db2777 50%, #4338ca 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                📊 Welcome to GPA Lens!
            </h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.9; font-weight: 500;">
                Where tracking grades and GPA becomes a breeze
            </p>
        </div>
        
        <!-- Content -->
        <div style="background: rgba(255,255,255,0.95); padding: 40px 30px; backdrop-filter: blur(10px); border: 2px solid rgba(124,45,146,0.1);">
            <p style="font-size: 18px; color: #6b21a8; margin: 0 0 20px 0; font-weight: 600;">
                Hi <strong>${username}</strong>! 🎉
            </p>
            
            <p style="color: #7c2d92; margin: 0 0 25px 0; line-height: 1.6; font-size: 16px;">
                Thank you for joining GPA Lens! Your academic success journey starts now.
            </p>
            
            <div style="background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); padding: 25px; border-radius: 12px; border: 2px solid rgba(124,45,146,0.2); margin: 25px 0;">
                <h3 style="color: #7c2d92; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">
                    🚀 Get Started:
                </h3>
                <ul style="color: #6b21a8; margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li>Track your class grades and calculate GPA automatically</li>
                    <li>Manage academic events and assignments</li>
                    <li>Get reminders for important deadlines</li>
                    <li>View your academic progress with beautiful charts</li>
                </ul>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${dashURL}" style="display: inline-block; background: linear-gradient(135deg, #7c2d92 0%, #4338ca 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 25px rgba(124,45,146,0.3); transition: all 0.3s ease;">
                    🎯 Start Tracking Now
                </a>
            </div>
            
            <hr style="border: none; height: 2px; background: linear-gradient(135deg, #7c2d92 0%, #db2777 50%, #4338ca 100%); margin: 30px 0; border-radius: 2px;">
            
            <div style="background: rgba(124,45,146,0.05); padding: 20px; border-radius: 8px; border-left: 4px solid #7c2d92;">
                <p style="margin: 0 0 10px 0; color: #7c2d92; font-weight: 600;">
                    📧 Email Preferences:
                </p>
                <p style="margin: 0; color: #6b21a8; font-size: 14px; line-height: 1.5;">
                    You'll receive reminders for upcoming events and a daily digest of your schedule. 
                    You can customize these preferences anytime in your account settings.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: rgba(124,45,146,0.1); padding: 20px 30px; text-align: center; border-radius: 0 0 16px 16px;">
            <p style="margin: 0; color: #7c2d92; font-size: 14px; font-weight: 500;">
                © ${new Date().getFullYear()} GPA Lens - Your academic success companion
            </p>
        </div>
    </div>
`;

// 2. GOOGLE SIGN-UP WELCOME EMAIL
const googleWelcomeEmailTemplate = (dashURL, username) => `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 50%, #e0e7ff 100%); border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c2d92 0%, #db2777 50%, #4338ca 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 900;">
                📊 Welcome to GPA Lens, ${username}!
            </h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.9; font-weight: 500;">
                You've successfully signed up with Google! 🎉
            </p>
        </div>
        
        <!-- Content -->
        <div style="background: rgba(255,255,255,0.95); padding: 40px 30px;">
            <p style="color: #7c2d92; margin: 0 0 25px 0; line-height: 1.6; font-size: 16px;">
                Your account has been created and you're ready to start tracking your grades and managing your academic calendar.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${dashURL}" style="display: inline-block; background: linear-gradient(135deg, #7c2d92 0%, #4338ca 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 25px rgba(124,45,146,0.3);">
                    🚀 Get Started!
                </a>
            </div>
            
            <hr style="border: none; height: 2px; background: linear-gradient(135deg, #7c2d92 0%, #db2777 50%, #4338ca 100%); margin: 30px 0;">
            
            <div style="background: rgba(124,45,146,0.05); padding: 20px; border-radius: 8px;">
                <p style="margin: 0; color: #7c2d92; font-size: 14px; line-height: 1.5;">
                    <strong>Note:</strong> To change your username or email later, you'll need to create a password in your account settings.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: rgba(124,45,146,0.1); padding: 20px 30px; text-align: center;">
            <p style="margin: 0; color: #7c2d92; font-size: 14px;">
                © ${new Date().getFullYear()} GPA Lens - Your academic success companion
            </p>
        </div>
    </div>
`;

// 3. FORGOT PASSWORD EMAIL TEMPLATE
const forgotPasswordEmailTemplate = (resetURL, username) => `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 50%, #e0e7ff 100%); border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c2d92 0%, #db2777 50%, #4338ca 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 900;">
                🔐 Password Reset Request
            </h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">
                Secure your GPA Lens account
            </p>
        </div>
        
        <!-- Content -->
        <div style="background: rgba(255,255,255,0.95); padding: 40px 30px;">
            <p style="color: #7c2d92; margin: 0 0 25px 0; line-height: 1.6; font-size: 16px;">
                Hi there! We received a request to reset your password for your GPA Lens account.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetURL}" style="display: inline-block; background: linear-gradient(135deg, #7c2d92 0%, #4338ca 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 25px rgba(124,45,146,0.3);">
                    🔑 Reset Password
                </a>
            </div>
            
            <div style="background: rgba(124,45,146,0.05); padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; color: #7c2d92; font-weight: 600;">
                    Or copy and paste this URL:
                </p>
                <p style="margin: 0; color: #6b21a8; font-size: 14px; word-break: break-all; background: white; padding: 10px; border-radius: 4px; border: 1px solid rgba(124,45,146,0.2);">
                    ${resetURL}
                </p>
            </div>
            
            <hr style="border: none; height: 2px; background: linear-gradient(135deg, #7c2d92 0%, #db2777 50%, #4338ca 100%); margin: 30px 0;">
            
            <div style="background: rgba(239,68,68,0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
                <p style="margin: 0 0 10px 0; color: #ef4444; font-weight: 600;">
                    ⏰ Important:
                </p>
                <p style="margin: 0; color: #dc2626; font-size: 14px; line-height: 1.5;">
                    This link will expire in <strong>1 hour</strong>. If you didn't request this password reset, you can safely ignore this email.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: rgba(124,45,146,0.1); padding: 20px 30px; text-align: center;">
            <p style="margin: 0; color: #7c2d92; font-size: 14px;">
                © ${new Date().getFullYear()} GPA Lens - Your academic success companion
            </p>
        </div>
    </div>
`;

// 4. EMAIL CHANGE CONFIRMATION TEMPLATES
const emailChangeOldEmailTemplate = (username, newEmail) => `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 50%, #e0e7ff 100%); border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c2d92 0%, #db2777 50%, #4338ca 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 900;">
                📧 Email Address Changed
            </h1>
        </div>
        
        <!-- Content -->
        <div style="background: rgba(255,255,255,0.95); padding: 40px 30px;">
            <p style="color: #7c2d92; margin: 0 0 20px 0; font-size: 16px;">
                Hi <strong>${username}</strong>,
            </p>
            <p style="color: #6b21a8; margin: 0 0 25px 0; line-height: 1.6;">
                Your GPA Lens account email has been successfully changed from this address to <strong>${newEmail}</strong>.
            </p>
            <p style="color: #6b21a8; margin: 0; line-height: 1.6;">
                All future notifications will be sent to your new email address.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: rgba(124,45,146,0.1); padding: 20px 30px; text-align: center;">
            <p style="margin: 0; color: #7c2d92; font-size: 14px;">
                © ${new Date().getFullYear()} GPA Lens - Your academic success companion
            </p>
        </div>
    </div>
`;

const emailChangeNewEmailTemplate = (username) => `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 50%, #e0e7ff 100%); border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c2d92 0%, #db2777 50%, #4338ca 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 900;">
                ✅ Welcome to your new email
            </h1>
        </div>
        
        <!-- Content -->
        <div style="background: rgba(255,255,255,0.95); padding: 40px 30px;">
            <p style="color: #7c2d92; margin: 0 0 20px 0; font-size: 16px;">
                Hi <strong>${username}</strong>,
            </p>
            <p style="color: #6b21a8; margin: 0 0 20px 0; line-height: 1.6;">
                Your GPA Lens account email has been successfully updated to this address.
            </p>
            <p style="color: #6b21a8; margin: 0 0 20px 0; line-height: 1.6;">
                You'll now receive all notifications and reminders at this email address.
            </p>
            <p style="color: #6b21a8; margin: 0; line-height: 1.6;">
                Your email can be changed again after 15 days.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: rgba(124,45,146,0.1); padding: 20px 30px; text-align: center;">
            <p style="margin: 0; color: #7c2d92; font-size: 14px;">
                © ${new Date().getFullYear()} GPA Lens - Your academic success companion
            </p>
        </div>
    </div>
`;

// 5. DAILY DIGEST EMAIL TEMPLATE
function dailyDigestEmailTemplate(username, upcomingEvents, dashboardURL){
    const eventsList = upcomingEvents.map(event => {
        const eventDate = new Date(event.event_date);
        const today = new Date();
        const timeDiff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        
        const typeEmoji = {
            'exam': '📝', 'quiz': '❓', 'project': '🎯',
            'due_date': '📅', 'assignment': '📋', 'other': '📌'
        };

        const urgencyColor = timeDiff === 0 ? '#ef4444' : timeDiff === 1 ? '#f59e0b' : '#10b981';
        const urgencyText = timeDiff === 0 ? '🔥 TODAY!' : timeDiff === 1 ? '⚡ Tomorrow' : `📅 In ${timeDiff} days`;

        return `
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 20px; margin: 15px 0; border-radius: 12px; border: 2px solid rgba(124,45,146,0.1); box-shadow: 0 2px 8px rgba(124,45,146,0.1);">
                <h3 style="margin: 0 0 12px 0; color: #7c2d92; font-size: 18px; font-weight: 700;">
                    ${typeEmoji[event.event_type] || '📌'} ${event.event_name}
                </h3>
                <p style="margin: 5px 0; color: #6b21a8; font-size: 14px;">
                    📅 ${eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    ${event.event_time ? `at ${new Date(`2000-01-01T${event.event_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : ''}
                    ${event.class_department && event.class_id ? `<br>📚 ${event.class_department} ${event.class_id}` : ''}
                </p>
                <p style="margin: 8px 0 0 0; font-weight: 700; color: ${urgencyColor}; font-size: 15px;">
                    ${urgencyText}
                </p>
            </div>
        `;
    }).join('');

    return `
        <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 50%, #e0e7ff 100%); border-radius: 16px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c2d92 0%, #db2777 50%, #4338ca 100%); color: white; padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 900;">
                    📊 Daily Academic Digest
                </h1>
                <p style="margin: 0; font-size: 18px; opacity: 0.9;">
                    Your upcoming events at a glance
                </p>
            </div>
            
            <!-- Content -->
            <div style="background: rgba(255,255,255,0.95); padding: 40px 30px;">
                <p style="color: #7c2d92; margin: 0 0 25px 0; font-size: 18px; font-weight: 600;">
                    Good morning <strong>${username}</strong>! ☀️
                </p>
                
                <p style="color: #6b21a8; margin: 0 0 30px 0; line-height: 1.6;">
                    Here are your upcoming academic events for the next 7 days:
                </p>
                
                ${eventsList}
                
                <p style="color: #6b21a8; margin: 30px 0 25px 0; line-height: 1.6;">
                    Stay organized and good luck with your studies! 🎓
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${dashboardURL}" style="display: inline-block; background: linear-gradient(135deg, #7c2d92 0%, #4338ca 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 25px rgba(124,45,146,0.3);">
                        📅 View Full Calendar
                    </a>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background: rgba(124,45,146,0.1); padding: 20px 30px; text-align: center;">
                <p style="margin: 0; color: #7c2d92; font-size: 14px;">
                    © ${new Date().getFullYear()} GPA Lens - Your academic success companion
                </p>
            </div>
        </div>
    `;
};

// 6. EVENT REMINDER EMAIL TEMPLATE
function eventReminderEmailTemplate(username, event, daysUntil, dashboardURL) {
    const eventDate = new Date(event.event_date);
    const typeEmoji = {
        'exam': '📝', 'quiz': '❓', 'project': '🎯',
        'due_date': '📅', 'assignment': '📋', 'other': '📌'
    };

    const urgencyColor = daysUntil === 0 ? '#ef4444' : daysUntil === 1 ? '#f59e0b' : '#10b981';
    const urgencyText = daysUntil === 0 ? 'is TODAY!' : daysUntil === 1 ? 'is TOMORROW!' : `is in ${daysUntil} days`;

    return `
        <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 50%, #e0e7ff 100%); border-radius: 16px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c2d92 0%, #db2777 50%, #4338ca 100%); color: white; padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 900;">
                    🔔 Event Reminder
                </h1>
                <p style="margin: 0; font-size: 18px; opacity: 0.9;">
                    Don't miss your upcoming event!
                </p>
            </div>
            
            <!-- Content -->
            <div style="background: rgba(255,255,255,0.95); padding: 40px 30px;">
                <p style="color: #7c2d92; margin: 0 0 25px 0; font-size: 18px; font-weight: 600;">
                    Hi <strong>${username}</strong>! 👋
                </p>
                
                <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 25px; border-radius: 12px; border: 2px solid rgba(124,45,146,0.2); margin: 25px 0;">
                    <h2 style="margin: 0 0 15px 0; color: #7c2d92; font-size: 24px; font-weight: 800;">
                        ${typeEmoji[event.event_type] || '📌'} ${event.event_name}
                    </h2>
                    
                    <div style="margin: 15px 0;">
                        <p style="margin: 5px 0; color: #6b21a8; font-size: 16px; font-weight: 600;">
                            📅 <strong>Date:</strong> ${eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        ${event.event_time ? 
                            `<p style="margin: 5px 0; color: #6b21a8; font-size: 16px; font-weight: 600;">
                                🕒 <strong>Time:</strong> ${new Date(`2000-01-01T${event.event_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </p>` : ''}
                        ${event.class_department && event.class_id ? 
                            `<p style="margin: 5px 0; color: #6b21a8; font-size: 16px; font-weight: 600;">
                                📚 <strong>Class:</strong> ${event.class_department} ${event.class_id}
                            </p>` : ''}
                    </div>

                    ${event.description ? 
                        `<div style="margin: 20px 0; padding: 15px; background: rgba(124,45,146,0.05); border-radius: 8px;">
                            <p style="margin: 0 0 8px 0; color: #7c2d92; font-weight: 600;">📋 Description:</p>
                            <p style="margin: 0; color: #6b21a8; line-height: 1.5;">${event.description}</p>
                        </div>` : ''}
                </div>
                
                <div style="text-align: center; margin: 25px 0; padding: 20px; background: ${urgencyColor}10; border-radius: 12px; border: 2px solid ${urgencyColor}30;">
                    <p style="margin: 0; color: ${urgencyColor}; font-size: 20px; font-weight: 800;">
                        🚨 This event ${urgencyText}
                    </p>
                </div>
                
                <p style="color: #6b21a8; margin: 25px 0; line-height: 1.6; text-align: center;">
                    Good luck with your ${event.event_type.replace('_', ' ')}! 🍀
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${dashboardURL}" style="display: inline-block; background: linear-gradient(135deg, #7c2d92 0%, #4338ca 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 25px rgba(124,45,146,0.3);">
                        📅 View Calendar
                    </a>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background: rgba(124,45,146,0.1); padding: 20px 30px; text-align: center;">
                <p style="margin: 0 0 5px 0; color: #7c2d92; font-size: 14px;">
                    This reminder was sent ${daysUntil} day${daysUntil !== 1 ? 's' : ''} before your event.
                </p>
                <p style="margin: 0; color: #7c2d92; font-size: 14px;">
                    © ${new Date().getFullYear()} GPA Lens - Your academic success companion
                </p>
            </div>
        </div>
    `;
}

const accountDeletionEmailTemplate = (username) => `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 50%, #e0e7ff 100%); border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c2d92 0%, #db2777 50%, #4338ca 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                👋 Goodbye ${username}!
            </h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.9; font-weight: 500;">
                Your GPA Lens account has been successfully deleted
            </p>
        </div>
        
        <!-- Content -->
        <div style="background: rgba(255,255,255,0.95); padding: 40px 30px; backdrop-filter: blur(10px); border: 2px solid rgba(124,45,146,0.1);">
            <p style="font-size: 18px; color: #6b21a8; margin: 0 0 25px 0; font-weight: 600;">
                Hi <strong>${username}</strong>,
            </p>
            
            <p style="color: #7c2d92; margin: 0 0 25px 0; line-height: 1.6; font-size: 16px;">
                Your GPA Lens account and all associated data have been permanently deleted from our servers. This includes:
            </p>
            
            <!-- Data Deleted Section -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 25px; border-radius: 12px; border: 2px solid rgba(124,45,146,0.2); margin: 25px 0;">
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">📚</span>
                        <span style="color: #6b21a8; font-weight: 600; font-size: 16px;">All your class and grade data</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">📅</span>
                        <span style="color: #6b21a8; font-weight: 600; font-size: 16px;">All your calendar events and reminders</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">👤</span>
                        <span style="color: #6b21a8; font-weight: 600; font-size: 16px;">Your user profile and preferences</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">📧</span>
                        <span style="color: #6b21a8; font-weight: 600; font-size: 16px;">Email notification subscriptions</span>
                    </div>
                </div>
            </div>
            
            <p style="color: #7c2d92; margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                We're sorry to see you go! If you decide to use GPA Lens again in the future, you'll need to create a new account.
            </p>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; border: 2px solid rgba(34,197,94,0.3);">
                <p style="margin: 0; color: #16a34a; font-size: 18px; font-weight: 700;">
                    ✨ Thank you for using GPA Lens!
                </p>
                <p style="margin: 8px 0 0 0; color: #15803d; font-size: 16px; font-weight: 500;">
                    We wish you all the best in your academic journey! 🎓
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: rgba(124,45,146,0.1); padding: 20px 30px; text-align: center;">
            <p style="margin: 0; color: #7c2d92; font-size: 14px;">
                © ${new Date().getFullYear()} GPA Lens - Your academic success companion
            </p>
        </div>
    </div>
`;

const passwordCreationEmailTemplate = (username) => `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 50%, #e0e7ff 100%); border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c2d92 0%, #db2777 50%, #4338ca 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                🔐 Password Created!
            </h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.9; font-weight: 500;">
                Your account is now more secure
            </p>
        </div>
        
        <!-- Content -->
        <div style="background: rgba(255,255,255,0.95); padding: 40px 30px; backdrop-filter: blur(10px); border: 2px solid rgba(124,45,146,0.1);">
            <p style="font-size: 18px; color: #6b21a8; margin: 0 0 25px 0; font-weight: 600;">
                Hi <strong>${username}</strong>! 🎉
            </p>
            
            <p style="color: #7c2d92; margin: 0 0 25px 0; line-height: 1.6; font-size: 16px;">
                You have successfully created a password for your GPA Lens account. Your account security has been enhanced!
            </p>
            
            <!-- Features Section -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 25px; border-radius: 12px; border: 2px solid rgba(124,45,146,0.2); margin: 25px 0;">
                <h2 style="margin: 0 0 20px 0; color: #7c2d92; font-size: 20px; font-weight: 800;">
                    🚀 You can now:
                </h2>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">✅</span>
                        <span style="color: #6b21a8; font-weight: 600; font-size: 16px;">Change your username and email address</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">✅</span>
                        <span style="color: #6b21a8; font-weight: 600; font-size: 16px;">Use either Google Sign-In or email/password to log in</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">✅</span>
                        <span style="color: #6b21a8; font-weight: 600; font-size: 16px;">Update your account information securely</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px;">✅</span>
                        <span style="color: #6b21a8; font-weight: 600; font-size: 16px;">Access advanced account security features</span>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border: 2px solid rgba(245,158,11,0.3);">
                <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 600;">
                    🔒 <strong>Security Note:</strong> Your password will be required to confirm future account changes for enhanced security.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: rgba(124,45,146,0.1); padding: 20px 30px; text-align: center;">
            <p style="margin: 0; color: #7c2d92; font-size: 14px;">
                © ${new Date().getFullYear()} GPA Lens - Your academic success companion
            </p>
        </div>
    </div>
`;



export const EmailTemplates = {
    welcomeEmailTemplate,
    googleWelcomeEmailTemplate, 
    forgotPasswordEmailTemplate,
    emailChangeOldEmailTemplate,
    emailChangeNewEmailTemplate,
    dailyDigestEmailTemplate,
    eventReminderEmailTemplate,
    accountDeletionEmailTemplate,
    passwordCreationEmailTemplate
}

export default EmailTemplates;