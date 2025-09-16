import cron from 'node-cron';
import mysql from 'mysql2/promise';
import emailService from '../services/email-service.js';
import logger from '../logger.js';
import { logQuery } from '../middleware/logging.js';

class ReminderScheduler {
    constructor() {
        this.database = null;
        this.isRunning = false;
    }

    async intialize(database) {
        this.database = database;
        this.startSchduler();
        logger.info('Reminder scheduler initialized');
    }

    startSchduler() {
        if (this.isRunning) {
            logger.warn('Reminder scheduler is already running');
            return;
        }

        //Run every hour at minute 0
        cron.schedule('0 * * * *', async () => {
            await this.checkSendReminders();
        });

        //Daily digest at 8:00 AM
        cron.schedule('0 8 * * *', async () => {
            await this.sendDailyDigests();
        });

        this.isRunning = true;
        logger.info('Reminder scheduler started - checking hourly and sending daily digests at 8:00 AM');
    }

    async processUserReminders(user) {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        //Get events that need reminders today
        //This finds events where the reminder should be sent today
        //(event_date - today = reminder_days)
        const [events] = await logQuery(this.database.execute.bind(this.database),
            `SELECT * FROM ${user.calendar_name} 
            WHERE event_date >= ? 
            AND is_completed = FALSE 
            AND reminder_days > 0 
            AND DATEDIFF(event_date, ?) = reminder_days`,
            [todayString, todayString],
            `Get events that are not complete for user ${user.username}`);

        let remindersSent = 0;

        for (const event of events) {
            try {
                const eventDate = new Date(event.event_date);
                const daysUntil = Math.ceil((eventDate - today) / (1000 * 3600 * 24));

                await emailService.sendEventReminder(
                    user.email,
                    user.username,
                    event,
                    daysUntil
                );

                remindersSent++;
            } catch (error) {
                logger.info('Failed to send reminder for event', {
                    userId: user.id,
                    eventId: event.id,
                    eventName: event.event_name,
                    error: error.message
                });
            }
        }

        if (remindersSent > 0) {
            logger.info('Reminders sent for user', {
                userId: user.id,
                username: user.username,
                remindersSent
            });
        }

        return remindersSent;
    }


    async checkSendReminders() {
        try {
            logger.info('Starting reminder check...');

            //Get all users with email reminders enabled
            const [users] = await logQuery(this.database.execute.bind(this.database), 
                'SELECT id, username, email, calendar_name FROM users WHERE email_reminders = TRUE',
                [], 'Get all users with email reminders true to check');
            
            let totalReminders = 0;

            for (const user of users) {
                try {
                    const reminders = await this.processUserReminders(user);
                    totalReminders += reminders;
                } catch (error) {
                    logger.error('Error processing reminders for user', {
                        userId: user.id,
                        username: user.username,
                        error: error.message
                    });
                }
            }

            logger.info('Reminder check completed', {
                usersProcessed: users.length,
                totalRemindersSent: totalReminders
            });
        } catch (error) {
            logger.error('Error during reminder check', {
                error: error.message,
                stack: error.stack
            });
        }
    }

    async sendDailyDigests() {
        try {
            logger.info('Starting daily digest send...');

            //Get all users with daily digest enabled
            const [users] = await logQuery(this.database.execute.bind(this.database), 
                'SELECT id, username, email, calendar_name FROM users WHERE daily_digest = TRUE', 
                [], 'Get all users with daily digest true');

            let digestsSent = 0;

            for (const user of users) {
                try {
                    const sent = await this.sendUserDigest(user);
                    if (sent) {
                        digestsSent++;
                    }
                } catch (error) {
                    logger.error('Error sending digest to user', {
                        userId: user.id,
                        username: user.username,
                        error: error.message
                    });
                }
            }

            logger.info('Daily digest sent', {
                usersProcessed: users.length,
                digestsSent
            });
        } catch (error) {
            logger.error('Error during sending daily digest', {
                error: error.message,
                stack: error.stack
            });
        }
    }

    async sendUserDigest(user) {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const todayString = today.toISOString().split('T')[0];
        const nextWeekString = nextWeek.toISOString().split('T')[0];

        //Get upcoming events for the next 7 days
        const [upcomingEvents] = await logQuery(this.database.execute.bind(this.database), 
            `SELECT * FROM ${user.calendar_name} 
            WHERE event_date BETWEEN ? AND ? 
            AND is_completed = FALSE 
            ORDER BY event_date ASC, event_time ASC`, [todayString, nextWeekString], 
            `Get upcoming events for user ${user.username}`);

        if (upcomingEvents.length === 0) {
            return false;
        }

        await emailService.sendDailyDigest(user.email, user.username, upcomingEvents);

        logger.info('Daily digest sent', {
            userId: user.id,
            username: user.username,
            eventCount: upcomingEvents.length
        });
        return true;
    }

    //Method to start reminder check manually (for testing)
    async startReminderCheck() {
        logger.info('Reminder check started manually');
        await this.checkSendReminders();
    }

    //Method to start daily digest manually (for testing)
    async startDailyDigest() {
        logger.info('Daily digest started manually');
        await this.sendDailyDigests();
    }

    //Method to check what remainders are to be sent without sending them
    async previewReminders() {
        try {
            const [users] = await logQuery(this.database.execute.bind(this.database), 
                'SELECT id, username, email, calendar_name FROM users WHERE email_reminders = TRUE', 
                [], 'Get all users for reminder preview');

            const preview = [];

            for (const user of users) {
                const today = new Date();
                const todayString = today.toISOString().split('T')[0];

                const [events] = await logQuery(this.database.execute.bind(this.database), 
                    `SELECT * FROM ${user.calendar_name} 
                    WHERE event_date >= ? 
                    AND is_completed = FALSE 
                    AND reminder_days > 0 
                    AND DATEDIFF(event_date, ?) = reminder_days`,
                    [todayString, todayString], 
                    `Preview reminders for user ${user.username}`);

                if (events.length > 0) {
                    preview.push({
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email
                        },
                        events: events.map(event => ({
                            id: event.id,
                            name: event.event_name,
                            date: event.event_date,
                            type: event.event_type,
                            reminderDays: event.reminder_days
                        }))
                    });
                }
            }

            return preview;
        } catch (error) {
            logger.error('Error generating reminder preview', {
                error: error.message
            });
            throw error;
        }
    }

    stop() {
        this.isRunning = false;
        logger.info('Reminder scheduler stopped');
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            hasDatabase: !!this.database
        };
    }
}

export default new ReminderScheduler();