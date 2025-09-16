import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import logger from '../logger.js';
import { EmailTemplates } from './email-templates.js';

class EmailService { //JS Class
    // constructor() { //JS Class constructor
    //     // FORCE CLEAN the password - remove ALL whitespace characters
    //     const originalPass = process.env.EMAILAPPPASS || '';
    //     const cleanPassword = originalPass.replace(/\s+/g, '');

        
    //     console.log('🔧 Email Service Auto-Clean Debug:');
    //     console.log('📧 Email:', process.env.EMAIL);
    //     console.log('🔑 Original password length:', originalPass.length);
    //     console.log('🧹 Cleaned password length:', cleanPassword.length);
    //     console.log('✂️ Removed chars:', originalPass.length - cleanPassword.length);
    //     console.log('🔑 First 4 chars:', cleanPassword.substring(0, 4));
        
    //     if (!process.env.EMAIL || !cleanPassword || cleanPassword.length !== 16) {
    //         throw new Error(`Email setup failed: EMAIL=${!!process.env.EMAIL}, CLEAN_PASS_LENGTH=${cleanPassword.length}`);
    //     }
        
    //     this.transporter = nodemailer.createTransporter({
    //         host: 'smtp.gmail.com',
    //         port: 587,
    //         secure: false,
    //         auth: {
    //             user: process.env.EMAIL,
    //             pass: cleanPassword  // Use the cleaned password
    //         }
    //     });
    // }

    constructor() { //class constructor

        console.log('[DEBUG] EmailService EMAIL:', process.env.EMAIL);
        console.log('[DEBUG] EmailService EMAILAPPPASS:', process.env.EMAILAPPPASS ? 'Loaded' : 'NOT LOADED');

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAILAPPPASS
            }
        });
    }

    async sendEventReminder(userEmail, username, event, daysUntil) {
        try {
            const dashboardURL = `${process.env.FRONTEND_URL}/calendar`;
            
            const emailHTML = EmailTemplates.eventReminderEmailTemplate(username, event, daysUntil, dashboardURL);

            const mailOptions = {
                from: `"GPA Lens" <${process.env.EMAIL}>`,
                to: userEmail,
                subject: `🔔 Reminder: ${event.event_name} ${daysUntil === 0 ? 'is today' : 
                        daysUntil === 1 ? 'is tomorrow' : `in ${daysUntil} days`}`,
                html: emailHTML
            };

            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            logger.error('Failed to send event reminder email', {
                userEmail,
                eventId: event.id,
                error: error.message
            });
            throw error;
        }
    }

    async sendDailyDigest(userEmail, username, upcomingEvents) {
        try {
            if (upcomingEvents.length === 0) {
                return false;
            }

            const dashboardURL = `${process.env.FRONTEND_URL}/calendar`;
            
            const emailHTML = EmailTemplates.dailyDigestEmailTemplate(username, upcomingEvents, dashboardURL);

            const mailOptions = {
                from: `"GPA Lens" <${process.env.EMAIL}>`,
                to: userEmail,
                subject: `📊 Your Daily Academic Digest - ${upcomingEvents.length} upcoming event${upcomingEvents.length !== 1 ? 's' : ''}`,
                html: emailHTML
            };

            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            logger.error('Failed to send daily digest email', {
                userEmail,
                error: error.message
            });
            throw error;
        }
    }

    async testConnection() {
        try {
            await this.transporter.verify();
            logger.info('Email service connection verified');
            return true;
        } catch (error) {
            logger.error('Email service connection failed', {
                error: error.message
            });
            throw error;
        }
    }

    async sendTestEmail(userEmail, username) {
        try {
            const mailOptions = {
                from: `"GPA Lens" <${process.env.EMAIL}>`,
                to: userEmail,
                subject: '✅ GPA Lens Email Test',
                html: `
                    <div style = "font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>📧 Email Test Successful!</h2>
                        <p>Hi <strong>${username}</strong>,</p>
                        <p>This is a test email to verify that the GPA Lens email system is working correctly.</p>
                        <p>✅ If you received this email, your email reminders and daily digest should work perfectly!</p>
                        <hr>
                        <p style = "color: #666; font-size: 0.9em;">
                            This test was sent at ${new Date().toLocaleString()}
                        </p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);

            logger.info('Test email sent successfully', {
                userEmail,
                username
            });

            return true;
        } catch (error) {
            logger.error('Failed to send test email', {
                userEmail,
                username,
                error: error.message
            });
            throw error;
        }
    }

    async sendEmail(userEmail, username, emailFormat) {
        try {
            await this.transporter.sendMail(emailFormat);
            logger.info('Email sent', { 
                userEmail,
                username
            });
        } catch (error) {
            logger.error('Failed to send email', {
                userEmail,
                username,
                error: error.message
            });
        }
    }
}

export default new EmailService(); //exporting an instance of the class