import dotenv from 'dotenv';

// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
import { OAuth2Client } from 'google-auth-library';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import logger from './logger.js';
import { requestLogger, errorLogger, logQuery } from './middleware/logging.js';
import reminderScheduler from './schedulers/reminder-scheduler.js';
import emailService from './services/email-service.js';
// Add this line to test
import { EmailTemplates } from './services/email-templates.js';

console.log('[DEBUG] Loaded EMAIL from .env:', process.env.EMAIL);
console.log('[DEBUG] Loaded EMAILAPPPASS from .env:', process.env.EMAILAPPPASS ? 'Loaded' : 'NOT LOADED');

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(requestLogger);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

let database;

// Initialize database connection
async function initDatabase() {
  try {
    console.log('[DEBUG] Attempting to connect with config:', dbConfig);
    database = await mysql.createConnection(dbConfig);
    logger.info('Connected to mysql database', {
        host: dbConfig.host,
        database: dbConfig.database
    })
    
    // Create users table if it doesn't exist
    const sql = `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            pass VARCHAR(255) NOT NULL,
            table_name VARCHAR(255) UNIQUE NOT NULL,
            calendar_name VARCHAR(255) UNIQUE NOT NULL,
            email_reminders BOOLEAN DEFAULT TRUE,
            daily_digest BOOLEAN DEFAULT TRUE,
            google_id VARCHAR(255) UNIQUE,
            has_password BOOLEAN DEFAULT TRUE,
            username_last_changed TIMESTAMP NULL,
            email_last_changed TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_google_id (google_id))`;

    await logQuery(database.execute.bind(database), sql, [], 'Initialize users table');

    //These columns were added after the user table creation
    //These are for system migration, I didn't want to make a new function
    //like I did for semester migration

    //await addSemesterColumn();

    // try {
    //     await logQuery(database.execute.bind(database),
    //         `ALTER TABLE users ADD COLUMN calendar_name VARCHAR(255) UNIQUE`,
    //         [], 'Add calendar_name column');
    //     logger.info('Added calendar_name column to users table');
    // } catch (error) {
    //     if (!error.message.includes('Duplicate column name')) {
    //         logger.warn('Error adding calendar_name column', { error: error.message });
    //     }
    // }

    //Add email preference column to users table (if needed)
    //reminders
    // try {
    //     await logQuery(database.execute.bind(database), 
    //         `ALTER TABLE users ADD COLUMN email_reminders BOOLEAN DEFAULT TRUE`, 
    //         [], 'Add email_reminders column to users table');
    //     logger.info('Added email_reminders column to users table');
    // } catch (error) {
    //     if (!error.message.includes('Duplicate column name')) {
    //         logger.warn('Error adding email_reminders column', {error: error.message});
    //     }
    // }

    // //daily digests
    // try {
    //     await logQuery(database.execute.bind(database), 
    //         `ALTER TABLE users ADD COLUMN daily_digest BOOLEAN DEFAULT TRUE`, 
    //         [], 'ADD');
    //     logger.info('Added daily_digest column to users table');
    // } catch (error) {
    //     if (!error.message.includes('Duplicate column name')) {
    //         logger.warn('Error adding daily_digest column', { error: error.message });
    //     }
    // }

    //Add idx_reminder column to each user's calendar
    // const [existingCalendars] = await logQuery(database.execute.bind(database), 
    //     `SELECT calendar_name FROM users WHERE calendar_name IS NOT NULL`,
    //     [], 'Get existing user calendar tables');
    
    // for (const calendar of existingCalendars) {
    //     try {
    //         await logQuery(database.execute.bind(database),
    //             `ALTER TABLE ${calendar.calendar_name} 
    //             ADD INDEX idx_reminder (reminder_days, event_date, is_completed)`,
    //             [], `Add reminder index to ${calendar.calendar_name}`);
    //     } catch (error) {
    //         if (!error.message.includes('Duplicate key name')) {
    //             logger.warn('Error adding reminder index', {
    //                 calendarName: calendar.calendar_name,
    //                 error: error.message
    //             });
    //         }
    //     }
    // }

    //Create calendar table for users without one (calendar system migration)
    // const [existingUsers] = await logQuery(database.execute.bind(database),
    //     `SELECT * FROM users WHERE calendar_name IS NULL`,
    //     [], 'Get users without calendar table names');

    // for (const user of existingUsers) {
    //     const calendarName = generateCalendarName(user.username);
    //     await logQuery(database.execute.bind(database),
    //         `UPDATE users SET calendar_name = ? WHERE id = ?`,
    //         [calendarName, user.id], `Update user ${user.id} calendar table name`);


    //     await createUserCalendar(calendarName);
    // }

    // Add Google ID column if it doesn't exist
    // try {
    //     await logQuery(database.execute.bind(database),
    //         `ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE`,
    //         [], 'Add Google ID column');
    //     logger.info('Added google_id column to users table');
    // } catch (error) {
    //     if (!error.message.includes('Duplicate column name')) {
    //         logger.warn('Error adding google_id column', { error: error.message });
    //     }
    // }

    // // Add Google ID index for better performance
    // try {
    //     await logQuery(database.execute.bind(database),
    //         `CREATE INDEX idx_google_id ON users(google_id)`,
    //         [], 'Add Google ID index');
    //     logger.info('Added idx_google_id index to users table');
    // } catch (error) {
    //     if (!error.message.includes('Duplicate key name') && 
    //         !error.message.includes('already exists')) {
    //         logger.warn('Error adding Google ID index', { error: error.message });
    //     }
    // }

    //Add account settings columns
    //await runAccountSettingsMigration();

    await reminderScheduler.intialize(database);


    logger.info('Database successfully initialized (with reminder system)');
        
  } catch (error) {
    logger.error('Database connection failed', {
        error: error.message,
        host: dbConfig.host,
        database: dbConfig.database
    });
    process.exit(1);
  }
}

const authenticateToken = (request, response, next) => {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn('Authentication error: no token provided', {
            ip: request.ip,
            url: request.url
        });
        return response.status(401).json({ err: 'Access token required '});
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, user) => {
        if (error) {
            logger.warn('Authentication error: invalid token', {
                ip: request.ip,
                url: request.url,
                error: error.message
            });
            return response.status(403).json({ error: 'Invalid token' });
            
        } else {
            logger.debug('Authentication successful', {
                userId: user.userId,
                username: user.username
            });
            request.user = user;
            next();
        }
    })
}

// async function runAccountSettingsMigration() {
//         try {
//             logger.info('Starting account settings migration...');

//             // Add username_last_changed column
//             try {
//                 await logQuery(database.execute.bind(database),
//                     `ALTER TABLE users ADD COLUMN username_last_changed TIMESTAMP NULL`,
//                     [], 'Add username_last_changed column');
//                 logger.info('Added username_last_changed column to users table');
//             } catch (error) {
//                 if (!error.message.includes('Duplicate column name')) {
//                     logger.warn('Error adding username_last_changed column', { error: error.message });
//                 }
//             }

//             // Add email_last_changed column
//             try {
//                 await logQuery(database.execute.bind(database),
//                     `ALTER TABLE users ADD COLUMN email_last_changed TIMESTAMP NULL`,
//                     [], 'Add email_last_changed column');
//                 logger.info('Added email_last_changed column to users table');
//             } catch (error) {
//                 if (!error.message.includes('Duplicate column name')) {
//                     logger.warn('Error adding email_last_changed column', { error: error.message });
//                 }
//             }

//             // Add has_password column
//             try {
//                 await logQuery(database.execute.bind(database),
//                     `ALTER TABLE users ADD COLUMN has_password BOOLEAN DEFAULT TRUE`,
//                     [], 'Add has_password column');
//                 logger.info('Added has_password column to users table');
//             } catch (error) {
//                 if (!error.message.includes('Duplicate column name')) {
//                     logger.warn('Error adding has_password column', { error: error.message });
//                 }
//             }

//             // Set has_password = FALSE for existing Google users
//             try {
//                 const [updateResult] = await logQuery(database.execute.bind(database),
//                     `UPDATE users SET has_password = FALSE WHERE google_id IS NOT NULL AND pass = 'google_auth'`,
//                     [], 'Set has_password flag for Google users');
                
//                 logger.info('Updated has_password flag for existing Google users', { 
//                     updatedUsers: updateResult.affectedRows 
//                 });
//             } catch (error) {
//                 logger.warn('Error updating has_password flag', { error: error.message });
//             }

//             logger.info('Account settings migration completed successfully');

//         } catch (error) {
//             logger.error('Account settings migration failed', {
//                 error: error.message,
//                 stack: error.stack
//             });
//             throw error;
//         }
//     }

function generateTableName(username) {
    return `user_${username}_data`.replace(/[^a-zA-Z0-9_]/g, '_');
}

async function createUserTable(tableName) {
    const sql = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            department VARCHAR(4) NOT NULL,
            classId INT NOT NULL,
            grade DECIMAL(3,2) NOT NULL,
            credits INT NOT NULL,
            semester VARCHAR(20) NOT NULL DEFAULT 'Fall 2024',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;

    await logQuery(database.execute.bind(database), sql, [], `Create user table: ${tableName}`);
    logger.info('User table created', { tableName });
}

function generateCalendarName(username) {
    return `user_${username}_calendar`.replace(/[^a-zA-Z0-9_]/g, '_');
}

async function createUserCalendar(calendarName) {
    const sql = `
        CREATE TABLE IF NOT EXISTS ${calendarName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_name VARCHAR(255) NOT NULL,
            description TEXT,
            event_type ENUM('due_date', 'exam', 'quiz', 'assignment', 'project', 'other') NOT NULL DEFAULT 'other',
            event_date DATE NOT NULL,
            event_time TIME,
            class_department VARCHAR(4),
            class_id INT,
            priority ENUM('low', 'medium', 'high') DEFAULT 'low',
            is_completed BOOLEAN DEFAULT FALSE,
            reminder_days INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_date (event_date),
            INDEX idx_type (event_type),
            INDEX idx_priority (priority),
            INDEX idx_reminder (reminder_days, event_date, is_completed)
        )
    `;

    await logQuery(database.execute.bind(database), sql, [], `Create user calendar table: ${calendarName}`);
    logger.info('User calendar table created', { calendarName });
}

//Google OAUTH Functions
function generateUsernameFromEmail(email) {
    let username = email.split('@')[0]; //get the email handle
    username = username.replace(/[^a-zA-Z0-9_]/g, '');

    if (!/^[a-zA-Z]/.test(username)) {
        username = 'user_' + username;
    }

    return username.substring(0, 20); //have username be only 20 chars at max
}

async function ensureUsernameIsUnique(baseUsername) {
    let username = baseUsername;
    let counter = 0;

    while (true) {
        const [existingUsers] = await logQuery(database.execute.bind(database), 
            `SELECT id FROM users WHERE username = ?`,
            [username], 'Check username uniqueness');
        
        if (existingUsers.length === 0) {
            return username;
        }

        username = `${baseUsername}${counter}`;
        counter++;

        if (counter > 100) {
            username = `${baseUsername}_${Date.now()}`;
            break;
        }
    }

    return username;
}

//Account Settings Helper Functions
//Helper function to check cooldown
function checkCooldown(lastChanged, cooldownDays = 15) {
    if (!lastChanged) return { canChange: true };
    
    const now = new Date();
    const lastChangedDate = new Date(lastChanged);
    const daysDiff = Math.floor((now - lastChangedDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < cooldownDays) {
        const daysRemaining = cooldownDays - daysDiff;
        return { 
            canChange: false, 
            daysRemaining,
            nextChangeDate: new Date(lastChangedDate.getTime() + cooldownDays * 24 * 60 * 60 * 1000)
        };
    }
    
    return { canChange: true };
}


//Routes

//User Settings Routes

//GET user account info
app.get('/api/user/account-info', authenticateToken, async (request, response) => {
    try {
        const { userId } = request.user;

        const [users] = await logQuery(database.execute.bind(database),
            'SELECT username, email, created_at, username_last_changed, email_last_changed, google_id, has_password FROM users WHERE id = ?',
            [userId], 'Get user account info');

        if (users.length === 0) {
            return response.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        
        // Check cooldowns
        const usernameCooldown = checkCooldown(user.username_last_changed);
        const emailCooldown = checkCooldown(user.email_last_changed);

        logger.info('User account info retrieved', {
            userId,
            username: user.username
        });

        response.json({
            username: user.username,
            email: user.email,
            created_at: user.created_at,
            isGoogleUser: !!user.google_id,
            hasPassword: Boolean(user.has_password),
            cooldowns: {
                username: usernameCooldown,
                email: emailCooldown
            }
        });

    } catch (error) {
        logger.error('Get user account info error', {
            userId: request.user?.userId,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to get account information' });
    }
})

//PUT update username
app.put('/api/user/username', authenticateToken, async (request, response) => {
    try {
        const { userId, username: currentUsername } = request.user;
        const { newUsername, confirmPassword } = request.body;

        if (!newUsername || !confirmPassword) {
            return response.status(400).json({ error: 'New username and password confirmation required' });
        }

        if (newUsername.length < 3 || newUsername.length > 50) {
            return response.status(400).json({ error: 'Username must be between 3 and 50 characters' });
        }

        //Validate username format (alphanumeric and underscores only)
        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
            return response.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
        }

        //Get user data
        const [users] = await logQuery(database.execute.bind(database),
            'SELECT * FROM users WHERE id = ?',
            [userId], 'Get user for username update');

        if (users.length === 0) {
            return response.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        //Check if user has a password
        if (!user.has_password) {
            return response.status(400).json({ 
                error: 'You must create a password before changing your username',
                requiresPasswordCreation: true 
            });
        }

        //Verify current password
        const isPasswordValid = await bcrypt.compare(confirmPassword, user.pass);
        if (!isPasswordValid) {
            logger.warn('Username update failure: invalid password', { userId, currentUsername });
            return response.status(401).json({ error: 'Invalid password' });
        }

        //Check cooldown
        const cooldown = checkCooldown(user.username_last_changed);
        if (!cooldown.canChange) {
            return response.status(429).json({ 
                error: `Username can only be changed once every 15 days. You can change it again in ${cooldown.daysRemaining} days.`,
                nextChangeDate: cooldown.nextChangeDate 
            });
        }

        //Check if new username is already taken
        const [existingUsers] = await logQuery(database.execute.bind(database),
            'SELECT id FROM users WHERE username = ? AND id != ?',
            [newUsername, userId], 'Check username availability');

        if (existingUsers.length > 0) {
            return response.status(409).json({ error: 'Username already taken' });
        }

        //Update username and timestamp
        await logQuery(database.execute.bind(database),
            'UPDATE users SET username = ?, username_last_changed = CURRENT_TIMESTAMP WHERE id = ?',
            [newUsername, userId], 'Update user username');

        logger.info('Username updated successfully', {
            userId,
            oldUsername: currentUsername,
            newUsername
        });

        response.json({
            message: 'Username updated successfully',
            newUsername,
            nextChangeDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        });

    } catch (error) {
        logger.error('Update username error', {
            userId: request.user?.userId,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to update username' });
    }
})

//PUT update email
app.put('/api/user/email', authenticateToken, async (request, response) => {
    try {
        const { userId, username } = request.user;
        const { newEmail, confirmPassword } = request.body;

        if (!newEmail || !confirmPassword) {
            return response.status(400).json({ error: 'New email and password confirmation required' });
        }

        //Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return response.status(400).json({ error: 'Invalid email format' });
        }

        //Get user data
        const [users] = await logQuery(database.execute.bind(database),
            'SELECT * FROM users WHERE id = ?',
            [userId], 'Get user for email update');

        if (users.length === 0) {
            return response.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        //Check if user has a password
        if (!user.has_password) {
            return response.status(400).json({ 
                error: 'You must create a password before changing your email',
                requiresPasswordCreation: true 
            });
        }

        //Verify current password
        const isPasswordValid = await bcrypt.compare(confirmPassword, user.pass);
        if (!isPasswordValid) {
            logger.warn('Email update failure: invalid password', { userId, username });
            return response.status(401).json({ error: 'Invalid password' });
        }

        //Check cooldown
        const cooldown = checkCooldown(user.email_last_changed);
        if (!cooldown.canChange) {
            return response.status(429).json({ 
                error: `Email can only be changed once every 15 days. You can change it again in ${cooldown.daysRemaining} days.`,
                nextChangeDate: cooldown.nextChangeDate 
            });
        }

        //Check if new email is already taken
        const [existingUsers] = await logQuery(database.execute.bind(database),
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [newEmail, userId], 'Check email availability');

        if (existingUsers.length > 0) {
            return response.status(409).json({ error: 'Email already in use' });
        }

        //Update email and timestamp
        await logQuery(database.execute.bind(database),
            'UPDATE users SET email = ?, email_last_changed = CURRENT_TIMESTAMP WHERE id = ?',
            [newEmail, userId], 'Update user email');

        //Send confirmation emails
        try {
            //Email to old address
            const oldEmailConfirmation = {
                from: `"GPA Lens" <${process.env.EMAIL}>`,
                to: user.email,
                subject: 'Email Address Changed - GPA Lens',
                html: EmailTemplates.emailChangeOldEmailTemplate(username, newEmail)
            };

            //Email to new address
            const newEmailConfirmation = {
                from: `"GPA Lens" <${process.env.EMAIL}>`,
                to: newEmail,
                subject: 'Welcome to your new email - GPA Lens',
                html: EmailTemplates.emailChangeNewEmailTemplate(username)
            };

            await emailService.sendEmail(user.email, username, oldEmailConfirmation);
            await emailService.sendEmail(newEmail, username, newEmailConfirmation);
        } catch (emailError) {
            logger.warn('Failed to send email change confirmation', {
                userId,
                username,
                oldEmail: user.email,
                newEmail,
                error: emailError.message
            });
        }

        logger.info('Email updated successfully', {
            userId,
            username,
            oldEmail: user.email,
            newEmail
        });

        response.json({
            message: 'Email updated successfully',
            newEmail,
            nextChangeDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        });

    } catch (error) {
        logger.error('Update email error', {
            userId: request.user?.userId,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to update email' });
    }
})

//PUT update password
app.put('/api/user/password', authenticateToken, async (request, response) => {
    try {
        const { userId, username } = request.user;
        const { currentPassword, newPassword } = request.body;

        if (!newPassword) {
            return response.status(400).json({ error: 'New password is required' });
        }

        if (newPassword.length < 8) {
            return response.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        //Get user data
        const [users] = await logQuery(database.execute.bind(database),
            'SELECT * FROM users WHERE id = ?',
            [userId], 'Get user for password update');

        if (users.length === 0) {
            return response.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        //If user has a password, verify current password
        if (user.has_password) {
            if (!currentPassword) {
                return response.status(400).json({ error: 'Current password is required' });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.pass);
            if (!isPasswordValid) {
                logger.warn('Password update failure: invalid current password', { userId, username });
                return response.status(401).json({ error: 'Invalid current password' });
            }
        }

        //Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        //Update password and set has_password flag
        await logQuery(database.execute.bind(database),
            'UPDATE users SET pass = ?, has_password = TRUE WHERE id = ?',
            [hashedNewPassword, userId], 'Update user password');

        //Send confirmation email
        try {
            const confirmationEmail = {
                from: `"GPA Lens" <${process.env.EMAIL}>`,
                to: user.email,
                subject: 'Password Changed - GPA Lens',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #1976d2 0%, #4caf50 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                            <h1>🔐 Password Changed</h1>
                        </div>
                        <div style="background: white; padding: 30px; border: 2px solid #e3f2fd; border-radius: 0 0 12px 12px;">
                            <p>Hi <strong>${username}</strong>,</p>
                            <p>Your GPA Lens account password has been successfully ${user.has_password ? 'changed' : 'created'}.</p>
                            <p>If you did not make this change, please contact support immediately.</p>
                            <p>For security, you'll now need to use your password to confirm future account changes.</p>
                        </div>
                    </div>
                `
            };

            await emailService.sendEmail(user.email, username, confirmationEmail);
        } catch (emailError) {
            logger.warn('Failed to send password change confirmation', {
                userId,
                username,
                error: emailError.message
            });
        }

        logger.info('Password updated successfully', {
            userId,
            username,
            wasFirstPassword: !user.has_password
        });

        response.json({
            message: user.has_password ? 'Password updated successfully' : 'Password created successfully',
            hasPassword: true
        });

    } catch (error) {
        logger.error('Update password error', {
            userId: request.user?.userId,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to update password' });
    }
});

//POST create password for Google users
app.post('/api/user/create-password', authenticateToken, async (request, response) => {
    try {
        const { userId, username } = request.user;
        const { password } = request.body;

        if (!password) {
            return response.status(400).json({ error: 'Password is required' });
        }

        if (password.length < 8) {
            return response.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        //Get user data
        const [users] = await logQuery(database.execute.bind(database),
            'SELECT * FROM users WHERE id = ?',
            [userId], 'Get user for password creation');

        if (users.length === 0) {
            return response.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        //Check if user already has a password
        if (user.has_password) {
            return response.status(400).json({ error: 'You already have a password. Use the change password feature instead.' });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Update user with new password
        await logQuery(database.execute.bind(database),
            'UPDATE users SET pass = ?, has_password = TRUE WHERE id = ?',
            [hashedPassword, userId], 'Create password for Google user');

        //Send confirmation email
        try {
            const passwordCreationEmail = {
            from: `"GPA Lens" <${process.env.EMAIL}>`,
            to: user.email,
            subject: 'Password Created - Enhanced Security! 🔐',
            html: EmailTemplates.passwordCreationEmailTemplate(username)
        };

            await emailService.sendEmail(user.email, username, passwordCreationEmail);
        } catch (emailError) {
            logger.warn('Failed to send password creation confirmation', {
                userId,
                username,
                error: emailError.message
            });
        }

        logger.info('Password created for Google user', {
            userId,
            username
        });

        response.json({
            message: 'Password created successfully',
            hasPassword: true
        });

    } catch (error) {
        logger.error('Create password error', {
            userId: request.user?.userId,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to create password' });
    }
})

//GET check username availability
app.get('/api/user/check-username/:username', authenticateToken, async (request, response) => {
    try {
        const { userId } = request.user;
        const { username } = request.params;

        if (!username || username.length < 3 || username.length > 50) {
            return response.status(400).json({ 
                available: false, 
                error: 'Username must be between 3 and 50 characters' 
            });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return response.status(400).json({ 
                available: false, 
                error: 'Username can only contain letters, numbers, and underscores' 
            });
        }

        const [existingUsers] = await logQuery(database.execute.bind(database),
            'SELECT id FROM users WHERE username = ? AND id != ?',
            [username, userId], 'Check username availability');

        response.json({
            available: existingUsers.length === 0,
            username
        });

    } catch (error) {
        logger.error('Check username availability error', {
            userId: request.user?.userId,
            username: request.params?.username,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to check username availability' });
    }
})

//GET check email availability
app.get('/api/user/check-email/:email', authenticateToken, async (request, response) => {
    try {
        const { userId } = request.user;
        const { email } = request.params;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return response.status(400).json({ 
                available: false, 
                error: 'Invalid email format' 
            });
        }

        const [existingUsers] = await logQuery(database.execute.bind(database),
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, userId], 'Check email availability');

        response.json({
            available: existingUsers.length === 0,
            email
        });

    } catch (error) {
        logger.error('Check email availability error', {
            userId: request.user?.userId,
            email: request.params?.email,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to check email availability' });
    }
})

//Routes for event emailing

app.get('/api/user/email-preferences', authenticateToken, async (request, response) => {
    try {
        const { userId } = request.user;

        const [users] = await logQuery(database.execute.bind(database), 
            'SELECT email_reminders, daily_digest FROM users WHERE id = ?',
            [userId], 'Get user email preferences');

        if (users.length === 0) {
            return response.status(404).json({ error: 'User not found' });
        }

        logger.info('Email preferences retrieved', {
            userId,

            preferences: users[0]
        });

        response.json(users[0]);
    } catch (error) {
        logger.error('Get email preferences error', {
            userId: request.user?.userId,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to get email preferences' });
    }
})

app.put('/api/user/email-preferences', authenticateToken, async (request, response) => {
    try {
        const { userId } = request.user;
        const { email_reminders, daily_digest } = request.body;

        if (typeof email_reminders !== 'boolean' || typeof daily_digest !== 'boolean') {
            return response.status(400).json({
                error: 'email_reminders and daily_digest must be boolean values'
            });
        }

        await logQuery(database.execute.bind(database), 
            'UPDATE users SET email_reminders = ?, daily_digest = ? WHERE id = ?', 
            [email_reminders, daily_digest, userId], 'Update user email preferences');

        logger.info('Email preferences updated', {
            userId,
            email_reminders,
            daily_digest
        });

        response.json({
            message: 'Email preferences updated successfully',
            email_reminders,
            daily_digest
        });
    } catch (error) {
        logger.error('Update email preferences error', {
            userId: request.user?.userId,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to update email preferences' });
    }
})


app.post('/api/test-clean-email', async (req, res) => {
    try {
        
        // Clean the password
        const cleanPassword = (process.env.EMAILAPPPASS || '').replace(/\s+/g, '');
        
        console.log('🧪 Clean Email Test:');
        console.log('Original length:', process.env.EMAILAPPPASS?.length);
        console.log('Cleaned length:', cleanPassword.length);
        
        const transporter = nodemailer.createTransporter({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: cleanPassword
            }
        });
        
        await transporter.verify();
        
        // Send test email to yourself
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: process.env.EMAIL,
            subject: '✅ GPA Lens Email Test',
            html: '<h1>Success!</h1><p>Email service is working!</p>'
        });
        
        res.json({ 
            success: true,
            message: 'Email cleaned and sent successfully!',
            cleanedLength: cleanPassword.length
        });
        
    } catch (error) {
        res.status(500).json({
            error: error.message,
            code: error.code
        });
    }
});

app.post('/api/test-reminder/:eventId', authenticateToken, async (request, response) => {
    try {
        const { calendarName, username } = request.user;
        const { eventId } = request.params;

        const [events] = await logQuery(database.execute.bind(database), 
            `SELECT * FROM ${calendarName} WHERE id = ?`,
            [eventId], 'Get event for reminder test');

        if (events.length === 0) {
            return response.status(404).json({ error: 'Event not found' });
        }

        const event = events[0];

        const [users] = await logQuery(database.execute.bind(database),
            'SELECT email FROM users WHERE id = ?', 
            [request.user.userId], 'Get user email for test reminder');

        if (users.length === 0) {
            return response.status(404).json({ error: 'User not found' });
        }

        const eventDate = new Date(event.event_date);
        const today = new Date();
        const daysUntil = Math.ceil((eventDate - today) / (1000 * 3600 * 24));

        await emailService.sendEventReminder(
            users[0].email,
            username,
            event,
            daysUntil
        );

        logger.info('Test reminder sent', {
            userId: request.user.userId,
            eventId,
            eventName: event.event_name
        });

        response.json({
            message: 'Test reminder sent successfully',
            event: event.event_name,
            daysUntil
        });
    } catch (error) {
        logger.error('Test reminder error', {
            userId: request.user?.userId,
            eventId: request.params?.eventId,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to send test reminder' });
    }
})

//routes for deleting user accounts

// DELETE account endpoint
app.delete('/api/user/account', authenticateToken, async (request, response) => {
    try {
        const { userId, username, tableName, calendarName } = request.user;
        const { confirmPassword } = request.body;

        logger.info('Account deletion request', { userId, username });

        // Validate password confirmation
        if (!confirmPassword) {
            logger.warn('Account deletion failure: no password provided', { userId, username });
            return response.status(400).json({ error: 'Password confirmation required' });
        }

        // Get user data to verify password
        const [users] = await logQuery(database.execute.bind(database),
            'SELECT * FROM users WHERE id = ?', [userId], 'Get user for deletion verification');

        if (users.length === 0) {
            logger.warn('Account deletion failure: user not found', { userId });
            return response.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(confirmPassword, user.pass);
        if (!isPasswordValid) {
            logger.warn('Account deletion failure: invalid password', { userId, username });
            return response.status(401).json({ error: 'Invalid password' });
        }

        // Store user info for email before deletion
        const userEmail = user.email;
        const userUsername = user.username;

        try {
            // Begin transaction
            await database.beginTransaction();
            logger.info('Started deletion transaction', { userId, username });

            // Drop user's class data table (check if exists first)
            try {
                await logQuery(database.execute.bind(database),
                    `DROP TABLE IF EXISTS ${tableName}`, [], `Drop user table: ${tableName}`);
                logger.info('Dropped user data table', { tableName });
            } catch (tableError) {
                logger.warn('Could not drop user table (may not exist)', { 
                    tableName, 
                    error: tableError.message 
                });
            }

            // Drop user's calendar table (check if exists first)
            try {
                await logQuery(database.execute.bind(database),
                    `DROP TABLE IF EXISTS ${calendarName}`, [], `Drop calendar table: ${calendarName}`);
                logger.info('Dropped user calendar table', { calendarName });
            } catch (tableError) {
                logger.warn('Could not drop calendar table (may not exist)', { 
                    calendarName, 
                    error: tableError.message 
                });
            }

            // Delete user from users table
            const [deleteResult] = await logQuery(database.execute.bind(database),
                'DELETE FROM users WHERE id = ?', [userId], 'Delete user from users table');

            if (deleteResult.affectedRows === 0) {
                throw new Error('User deletion from users table failed - no rows affected');
            }

            // Commit transaction
            await database.commit();
            logger.info('Committed deletion transaction', { userId, username });

            // Send farewell email (don't fail deletion if email fails)
            try {
                const farewellEmail = {
                from: `"GPA Lens" <${process.env.EMAIL}>`,
                to: userEmail,
                subject: 'Account Deleted - We\'ll miss you! 👋',
                html: EmailTemplates.accountDeletionEmailTemplate(userUsername)
            };

                await emailService.sendEmail(userEmail, userUsername, farewellEmail);
                logger.info('Farewell email sent successfully', { userEmail, userUsername });
            } catch (emailError) {
                // Don't fail the deletion if email fails
                logger.warn('Failed to send farewell email', {
                    userId,
                    username,
                    email: userEmail,
                    error: emailError.message
                });
            }

            logger.info('Account successfully deleted', {
                userId,
                username: userUsername,
                tableName,
                calendarName
            });

            response.json({ 
                message: 'Account deleted successfully',
                deletedData: {
                    username: userUsername,
                    classTable: tableName,
                    calendarTable: calendarName
                }
            });

        } catch (transactionError) {
            // Rollback transaction on error
            try {
                await database.rollback();
                logger.warn('Rolled back deletion transaction', { userId, username });
            } catch (rollbackError) {
                logger.error('Failed to rollback transaction', { 
                    userId, 
                    username,
                    rollbackError: rollbackError.message 
                });
            }
            
            logger.error('Transaction error during account deletion', {
                userId,
                username,
                error: transactionError.message
            });
            
            throw new Error(`Database transaction failed: ${transactionError.message}`);
        }

    } catch (error) {
        logger.error('Account deletion error', {
            userId: request.user?.userId,
            username: request.user?.username,
            error: error.message,
            stack: error.stack
        });
        response.status(500).json({ error: 'Failed to delete account' });
    }
})

// GET account deletion info (for showing user what will be deleted)
app.get('/api/user/account/deletion-info', authenticateToken, async (request, response) => {
    try {
        const { userId, username, tableName, calendarName } = request.user;

        // Get counts of user data
        const [classCount] = await logQuery(database.execute.bind(database),
            `SELECT COUNT(*) as count FROM ${tableName}`, [], `Count classes in ${tableName}`);

        const [eventCount] = await logQuery(database.execute.bind(database),
            `SELECT COUNT(*) as count FROM ${calendarName}`, [], `Count events in ${calendarName}`);

        const [userInfo] = await logQuery(database.execute.bind(database),
            'SELECT username, email, created_at FROM users WHERE id = ?', [userId], 'Get user info for deletion preview');

        logger.info('Account deletion info requested', { userId, username });

        response.json({
            user: userInfo[0],
            dataToDelete: {
                classes: classCount[0].count,
                events: eventCount[0].count,
                tables: [tableName, calendarName]
            }
        });

    } catch (error) {
        logger.error('Get deletion info error', {
            userId: request.user?.userId,
            username: request.user?.username,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to get account information' });
    }
})

//Data Routes

app.post('/api/register', async (request, response) => { //works
  try {
    const { username, email, pass } = request.body;
    logger.info('Registration request', { username, email });

    // Validate input
    if (!username || !email || !pass) {
        logger.warn('Registration failure: missing fields', { username, email });
        return response.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUsers] = await logQuery(database.execute.bind(database),
        `SELECT * FROM users WHERE username = ? OR email = ?`,
        [username, email], 'Check users table');

    if (existingUsers.length > 0) {
        logger.warn('Registration failure: user already exists', { username, email });
        return response.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(pass, 10);

    // Generate unique table names
    const tableName = generateTableName(username);
    const calendarName = generateCalendarName(username);

    // Create user
    await logQuery(database.execute.bind(database),
      'INSERT INTO users (username, email, pass, table_name, calendar_name, email_reminders, daily_digest) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, tableName, calendarName, true, true], 'Create new user');

    // Create user-specific tables
    await createUserTable(tableName);
    await createUserCalendar(calendarName);

    const dashURL = `${process.env.FRONTEND_URL}/dashboard`;

    const emailFormat = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Welcome to GPA Lens!',
        html: EmailTemplates.welcomeEmailTemplate(dashURL, username)
    };
    
    
    await emailService.sendEmail( //send welcome email
        username,
        email,
        emailFormat
    );

    logger.info('User registered', { username, email, tableName, calendarName });
    response.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    logger.error('Registration error', {
        username: request.body?.username,
        email: request.body?.email,
        error: error.message,
        stack: error.stack
    });
    response.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (request, response) => { //Login existing User (works)
    try {
        const { username, pass } = request.body;
        logger.info('Login request', { username });

        if (!username || !pass) {
            logger.warn('Login failure: missing credentials');
            return response.status(400).json({ error: 'Username and password are required' });
        }

        const [users] = await logQuery(database.execute.bind(database),
            'SELECT * FROM users WHERE username = ?', [username], 'User login query');

        if (users.length === 0) {
            logger.warn('Login failure: user not found', { username });
            return response.status(401).json({ error: 'Username or Password not valid' });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(pass, user.pass);
        if (!isPasswordValid) {
            logger.warn('Login failure: invalid password', { username });
            return response.status(401).json({ error: 'Username or Password not valid' });
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                tableName: user.table_name,
                calendarName: user.calendar_name
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' });
        logger.info('User logged in', {
            userId: user.id,
            username: user.username
        });

        response.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                email_reminders: user.email_reminders,
                daily_digest: user.daily_digest
            }
        });

    } catch (error) {
        logger.error('Login error', {
            username: request.body?.username,
            error: error.message,
            stack: error.stack
        });
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/data', authenticateToken, async (request, response) => { //Get user's data table (works)
    try {
        const { tableName } = request.user;

        const [rows] = await logQuery(database.execute.bind(database),
            `SELECT * FROM ${tableName} ORDER BY semester DESC, created_at DESC`,
            [], `Get data from ${tableName}`);

        logger.info('User data retrieved', {
            username: request.user.username,
            numberOfClasses: rows.length
        });

        response.json(rows);
    } catch (error) {
        logger.error('Get data error', {
            username: request.user?.username,
            tableName: request.user?.tableName,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to fetch data' });
    }
})

app.get('/api/data/by-semester', authenticateToken, async (request, response) => {
    try {
        const { tableName } = request.user;

        const [rows] = await logQuery(database.execute.bind(database),
        `SELECT * FROM ${tableName} ORDER BY semester DESC, created_at DESC`, [],
        `Get data grouped by semester from ${tableName}`);

        const groupedData = rows.reduce((acc, classItem) => {
            const semester = classItem.semester;
            if (!acc[semester]) {
                acc[semester] = [];
            }
            acc[semester].push(classItem);
            return acc;
        }, {});

        logger.info('User grouped data retrieved', {
            username: request.user.username,
            semesters: Object.keys(groupedData).length,
            totalClasses: rows.length
        });
        response.json(groupedData);
    } catch (error) {
        logger.error('Get grouped data error', {
            username: request.user?.username,
            tableName: request.user?.tableName,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to fetch grouped data' });
    }
})

app.get('/api/data/gpa', authenticateToken, async (request, response) => {
    try {
        const { tableName } = request.user;

        const [result] = await logQuery(database.execute.bind(database),
            `SELECT SUM(grade * credits) as totalPoints,
             SUM(credits) as totalCredits,
             COUNT(*) as totalClasses FROM ${tableName}`, [], `GPA Calculation: ${tableName}`);

        const results = result[0];
        const gpa = results.totalPoints / results.totalCredits;

        logger.info('GPA calculated', {
            username: request.user.username,
            gpa: parseFloat(gpa.toFixed(2)),
            totalCredits: results.totalCredits,
            totalClasses: results.totalClasses
        });

        response.json({
            gpa: parseFloat(gpa.toFixed(2)),
            totalCredits: results.totalCredits,
            totalClasses: results.totalClasses
        });

    } catch (error) {
        logger.error('GPA calculation error', {
            username: request.user?.username,
            tableName: request.user?.tableName,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to calculate GPA' });
    }
})

app.get('/api/data/gpa/:semester', authenticateToken, async (request, response) => {
    try {
        const { tableName } = request.user;
        const { semester } = request.params;

        const [result] = await logQuery(database.execute.bind(database),
        `SELECT SUM(grade * credits) as totalPoints,
        SUM(credits) as totalCredits FROM ${tableName} WHERE semester = ?`,
        [semester], `GPA Calculation for ${semester} in ${tableName}`);

        const results = result[0];
        const gpa = results.totalPoints / results.totalCredits;

        logger.info('Semester GPA calculated', {
            username: request.user.username,
            semester,
            gpa: parseFloat(gpa.toFixed(2)),
            totalCredits: results.totalCredits
        });

        response.json({
            gpa: parseFloat(gpa.toFixed(2)),
            totalCredits: results.totalCredits
        });
    } catch (error) {
        logger.error('Semester GPA calculation error', {
            username: request.user?.username,
            tableName: request.user?.tableName,
            semester: request.params?.semester,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to calculate semester GPA' });
    }
})


app.post('/api/data', authenticateToken, async (request, response) => { //add new class in user's table (works!)
    try {
        const { department, classId, grade, credits, semester } = request.body;
        const { tableName } = request.user;

        const [result] = await logQuery(database.execute.bind(database),
            `INSERT INTO ${tableName} (department, classId, grade, credits, semester) VALUES (?, ?, ?, ?, ?)`,
            [department, classId, grade, credits, semester], `Add class to ${tableName}`);

        const [newClass] = await logQuery(database.execute.bind(database),
            `SELECT * FROM ${tableName} WHERE id = ?`,
            [result.insertId], 'Get created class');

        logger.info('Class added successfully', {
            username: request.user.username,
            classId: newClass[0].id,
            department,
            classId,
            semester
        });

        response.status(201).json(newClass[0]);
    } catch (error) {
        logger.error('Add class error', {
            username: request.user?.username,
            department: request.body?.department,
            classId: request.body?.classId,
            semester: request.body?.semester,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to add class...' });
    } 
});

app.put('/api/data/:id', authenticateToken, async (request, response) => { //update a user's class' data  (works)
    try {
        const { id } = request.params;
        const { department, classId, grade, credits, semester } = request.body;
        const { tableName } = request.user;

        await logQuery(database.execute.bind(database),
            `UPDATE ${tableName} SET department = ?, classId = ?, grade = ?, credits = ?, semester = ? WHERE id = ?`,
            [department, classId, grade, credits, semester, id], `Update class in ${tableName}`);

        const [updatedClass] = await logQuery(database.execute.bind(database),
            `SELECT * FROM ${tableName} WHERE id = ?`, [id], 'Get updated class');

        logger.info('Class updated', {
            username: request.user.username,
            classId: id,
            department,
            classId,
            semester
        });
        
        response.status(201).json(updatedClass[0]);
    } catch (error) {
        logger.error('Update class error', {
            username: request.user?.username,
            classId: request.params?.id,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to update data' });
    }
});

app.delete('/api/data/:id', authenticateToken, async (request, response) => { //delete a user's class (works)
    try {
        const { id } = request.params;
        const { tableName } = request.user;

        await logQuery(database.execute.bind(database),
            `DELETE FROM ${tableName} WHERE id = ?`, [id], `Delete class in ${tableName}`);
        
        logger.info('Class deleted', {
            username: request.user.username,
            classId: id
        });
        
        response.status(201).json({ message: 'Data deleted successfully' });
    } catch (error) {
        logger.error('Delete class error', {
            username: request.user?.username,
            classId: request.params?.id,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to delete data' });
    }
})

const resetTokens = new Map(); //change to database later

app.post('/api/forgot-password', async (request, response) => { //works!
    try {
        const { email } = request.body;

        logger.info('Password reset request', { email });

        if (!email) {
            logger.warn('Password reset failure: no email');
            return response.status(400).json({ error: 'Please enter an email' });
        }

        const [users] = await logQuery(database.execute.bind(database),
            'SELECT * FROM users WHERE email = ?', [email], 'User lookup');

        if (users.length === 0) {
            logger.warn('Password reset failure: user not found', { email });
            return response.status(200).json({ message: 'If an sccount exists with that email, we sent reset instructions' });
        }

        const user = users[0];

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + 3600000;

        resetTokens.set(resetToken, {
            id: user.id,
            email: user.email,
            expiry: expiry
        });

        const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const emailFormat = {
            from: process.env.EMAIL,
            to: email,
            subject: 'GPA Lens Password Reset',
            html: EmailTemplates.forgotPasswordEmailTemplate(resetURL, user.username)
        };

        await emailService.sendEmail(user.email, user.username, emailFormat);

        logger.info('Password reset email sent', {
            email,
            tokenExpiry: new Date(expiry).toISOString()
        });

        response.status(200).json({ message: 'Password reset instructions sent to your email! '});
    } catch (error) {
        logger.error('Forgot password error', {
            email: request.body?.email,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to process reset request' });
    }
})

app.post('/api/reset-password', async (request, response) => {
    try {
        const { token, newPass } = request.body;

        if (!token || !newPass) {
            logger.warn('Password reset failure: missing token or password');
            return response.status(400).json({ error: 'Token and new password are required' });
        }

        const tokenData = resetTokens.get(token);
        if (!tokenData || tokenData.expiry < Date.now()) {
            logger.warn('Password reset failure: invalid or expired token');
            return response.status(400).json({ error: 'Invalid or expired reset token '});
        }
        
        const [users] = await logQuery(database.execute.bind(database),
            'SELECT * FROM users WHERE id = ?', [tokenData.id], 'User lookup');

        if (users.length === 0) {
            logger.warn('Password reset failure: user not found');
            return response.status(404).json({ error: 'User not found' });
        }

        const hashedNewPass = await bcrypt.hash(newPass, 10);

        await logQuery(database.execute.bind(database),
            'UPDATE users SET pass = ? WHERE id = ?', [hashedNewPass, tokenData.id], 'Update user password');

        resetTokens.delete(token);

        logger.info('Password reset', {
            userId: tokenData.id,
            email: tokenData.email
        });

        response.status(200).json({ message: 'Password has been reset!' });
    } catch (error) {
        logger.error('Password reset error', {
            error: error.message
        });
        response.status(500).json({ error: 'Failed to reset password' });
    }
})

app.get('/api/calendar', authenticateToken, async (request, response) => {
    try {
        const { calendarName, username } = request.user;

        const [events] = await logQuery(database.execute.bind(database), 
            `SELECT * FROM ${calendarName} ORDER BY event_date ASC,
            event_time ASC`, [], `Get calendar events from ${calendarName}`);

        logger.info('Calendar events retrieved', {
            username,
            calendarName,
            numberOfEvents: events.length
        });
        response.json(events);
    } catch (error) {
        logger.error('Get calendar events error', {
            username: request.user?.username,
            calendarName: request.user?.calendarName,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to fetch events' });
    }
})

app.get('/api/calendar/:year/:month', authenticateToken, async (request, response) => {
    try {
        const { calendarName, username } = request.user;
        const { year, month } = request.params;

        const yearNum = parseInt(year);
        const monthNum = parseInt(month);

        if (yearNum < 2020 || yearNum > 2030 || monthNum < 1 || monthNum > 12) {
            return response.status(400).json({ error: 'Invalid year or month' });
        }

        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const endDate = `${year}-${month.padStart(2, '0')}-31`;

        const [events] = await logQuery(database.execute.bind(database),
            `SELECT * FROM ${calendarName} WHERE event_date BETWEEN ? AND ?
            ORDER BY event_date ASC, event_time ASC`, [startDate, endDate],
            `Get monthly calendar events from ${calendarName}`);

        logger.info('Monthly calendar events retrieved', {
            username,
            calendarName,
            year,
            month,
            numberOfEvents: events.length
        });

        response.json(events);
    } catch (error) {
        logger.error('Get monthly calendar events error', {
            username: request.user?.username,
            calendarName: request.user?.calendarName,
            year: request.params?.year,
            month: request.params?.month,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to fetch monthly events' });
    }
})

app.get('/api/calendar/upcoming', authenticateToken, async (request, response) => {
    try {
        const { calendarName, username } = request.user;
        const limit = request.query.limit || 10;

        const [events] = await logQuery(database.execute.bind(database),
            `SELECT * FROM ${calendarName} WHERE event_date >= CURDATE()
            AND is_completed = FALSE ORDER BY event_date ASC, event_time ASC 
            LIMIT ?`, [parseInt(limit)], `Get upcoming events from ${calendarName}`);

        logger.info('Upcoming calendar events retrieved', {
            username,
            calendarName,
            numberOfEvents: events.length
        });

        response.json(events);
    } catch (error) {
        logger.error('Get upcoming events error', {
            username: request.user?.username,
            calendarName: request.user?.calendarName,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to fetch upcoming events' });
    }
})

app.post('/api/calendar', authenticateToken, async (request, response) => {
    try {
        const { calendarName, username } = request.user;
        const {
            title,
            description,
            event_type,
            event_date,
            event_time,
            class_department,
            class_id,
            priority,
            reminder_days
        } = request.body;

        if(!title || !event_type || !event_date) {
            return response.status(400).json({
                error: 'Event title, type, and/or date were not provided'
            });
        }

        const validTypes = ['due_date', 'exam', 'assignment', 'quiz', 'project', 'other'];
        if (!validTypes.includes(event_type)) {
            return response.status(400).json({
                error: 'Invalid event type'
            });
        }

        const validPriorities = ['low', 'medium', 'high'];
        if (priority && !validPriorities.includes(priority)) {
            return response.status(400).json({
                error: 'Invalid priority level'
            });
        }

        const [result] = await logQuery(database.execute.bind(database),
            `INSERT INTO ${calendarName} 
            (event_name, description, event_type, event_date, event_time, 
            class_department, class_id, priority, reminder_days) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [title, description || null, 
                event_type, event_date, event_time || null, class_department || null,
                class_id || null, priority || 'medium', reminder_days || 1],
            `Create calendar event in ${calendarName}`);

        const [newEvent] = await logQuery(database.execute.bind(database), 
            `SELECT * FROM ${calendarName} WHERE id = ?`,
            [result.insertId], 'Get created event');

        logger.info('Calendar event created', {
            username,
            calendarName,
            eventId: result.insertId,
            title,
            event_type,
            event_date
        });

        response.status(201).json(newEvent[0]);
    } catch (error) {
        logger.error('Create calendar event error', {
            username: request.user?.username,
            calendarName: request.user?.calendarName,
            title: request.body?.title,
            event_type: request.body?.event_type,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to create new event '});
    }
})

app.put('/api/calendar/:id', authenticateToken, async (request, response) => {
    try {
        const { calendarName, username } = request.user;
        const { id } = request.params;
        const {
            title,
            description,
            event_type,
            event_date,
            event_time,
            class_department,
            class_id,
            priority,
            is_completed,
            reminder_days
        } = request.body;

        const [existingEvent] = await logQuery(database.execute.bind(database), 
            `SELECT * FROM ${calendarName} WHERE id = ?`, [id], 
            `Check if event exists in ${calendarName}`);

        if (existingEvent.length === 0) {
            return response.status(404).json({ error: 'Calendar event not found' });
        }

        if (event_type) {
            const validTypes = ['due_date', 'exam', 'quiz', 'assignment', 'project', 'other'];
            if (!validTypes.includes(event_type)) {
                return response.status(400).json({ error: 'Invalid event type' });
            }
        }

        if (priority) {
            const validPriorities = ['low', 'medium', 'high'];
            if (!validPriorities.includes(priority)) {
                return response.status(400).json({ error: 'Invalid priority level' });
            }
        }

        await logQuery(database.execute.bind(database),
            `UPDATE ${calendarName} 
            SET event_name = ?, description = ?, event_type = ?, event_date = ?, 
            event_time = ?, class_department = ?, class_id = ?, priority = ?, 
            is_completed = ?, reminder_days = ? WHERE id = ?`, [title, description, 
                event_type, event_date, event_time, class_department, class_id, 
                priority, is_completed, reminder_days, id], `Update calendar event ${id} in ${calendarName}`);
            
        const [updatedEvent] = await logQuery(database.execute.bind(database), 
            `SELECT * FROM ${calendarName} WHERE id = ?`, [id], 
            'Get updated calendar event');

        logger.info('Calendar event updated', {
            username,
            calendarName,
            eventId: id,
            title
        });

        response.json(updatedEvent[0]);
    } catch (error) {
        logger.error('Update calendar event error', {
            username: request.user?.username,
            calendarName: request.user?.calendarName,
            eventId: request.params?.id,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to update event' });
    }
})

app.delete('/api/calendar/:id', authenticateToken, async (request, response) => {
    try {
        const { calendarName, username } = request.user;
        const { id } = request.params;

        const [existingEvent] = await logQuery(database.execute.bind(database), 
            `SELECT * FROM ${calendarName} WHERE id = ?`, [id], 
            `Check calendar event exists in ${calendarName}`);

        if (existingEvent.length === 0) {
            return response.status(404).json({ error: 'Calendar event not found' });
        }

        await logQuery(database.execute.bind(database), 
            `DELETE FROM ${calendarName} WHERE id = ?`, [id], 
            `Delete calendar event ${id} from ${calendarName}`);

        logger.info('Calendar event deleted', {
            username,
            calendarName,
            eventId: id
        });

        response.json({ message: 'Calendar event deleted successfully' });
    } catch (error) {
        logger.error('Delete calendar event error', {
            username: request.user?.username,
            calendarName: request.user?.calendarName,
            eventId: request.params?.id,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to delete calendar event' });
    }
})

app.patch('/api/calendar/:id/complete', authenticateToken, async (request, response) => {
    try {
        const { calendarName, username } = request.user;
        const { id } = request.params;

        const [existingEvent] = await logQuery(database.execute.bind(database), 
            `SELECT * FROM ${calendarName} WHERE id = ?`, [id], 
            `Check calendar event exists in ${calendarName}`);

        if (existingEvent === 0) {
            return response.status(404).json({ error: 'Calendar event not found '});
        }

        const newCompletionStatus = !existingEvent[0].is_completed;

        await logQuery(database.execute.bind(database), 
            `UPDATE ${calendarName} SET is_completed = ? WHERE id = ?`, 
            [newCompletionStatus, id], `Toggle calendar event completion ${id} in ${calendarName}`);

        const [updatedEvent] = await logQuery(database.execute.bind(database), 
            `SELECT * FROM ${calendarName} WHERE id = ?`, [id], 
            'Get updated calendar event');

        logger.info('Calendar event completion toggled', {
            username,
            calendarName,
            eventId: id,
            isCompleted: newCompletionStatus
        });

        response.json(updatedEvent[0]);
    } catch (error) {
        logger.error('Toggle calendar event completion error', {
            username: request.user?.username,
            calendarName: request.user?.calendarName,
            eventId: request.params?.id,
            error: error.message
        });
        response.status(500).json({ error: 'Failed to update event completion status' });
    }
})


app.post('/api/auth/google', async (request, response) => {
    try {
        const { credential } = request.body;

        logger.info('Google authentication attempt');

        if (!credential) {
            logger.warn('Google auth failure: no credential provided');
            return response.status(400).json({ error: 'Google credential required' });
        }

        //Verify the Google Token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId, email_verified } = payload;

        if (!email_verified) {
            logger.warn('Google auth failure: email not verified', { email });
            return response.status(400).json({ error: 'Google email not verified' });
        }

        logger.info('Google token verified', { email, name });

        //check user existence
        const [existingUsers] = await logQuery(database.execute.bind(database), 
            'SELECT * FROM users WHERE email = ? OR google_id = ?',
            [email, googleId], 'Check for existing user by email or Google ID');

        let user;

        if (existingUsers.length > 0) {
            //User exists, update Google ID if not set
            user = existingUsers[0];

            if (!user.google_id) {
                await logQuery(database.execute.bind(database), 
                    'UPDATE users SET google_id = ? WHERE id = ?',
                    [googleId, user.id], 'Update user with Google ID');
                user.google_id = googleId;
            }

            logger.info('Existing Google user logged in', {
                userId: user.id,
                username: user.username,
                email: user.email
            });
        } else {
            //Create new user
            const base = generateUsernameFromEmail(email);
            const username = await ensureUsernameIsUnique(base);
            const tableName = generateTableName(username);
            const calendarName = generateCalendarName(username);

            //Updated INSERT query with has_password = FALSE for new Google users
            const [createResult] = await logQuery(database.execute.bind(database),
                `INSERT INTO users (username, email, pass, table_name, calendar_name, 
                 google_id, email_reminders, daily_digest, has_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                [username, email, 'google_auth', tableName, calendarName, googleId, true, true, false], 
                'Create new Google user');

            await createUserTable(tableName);
            await createUserCalendar(calendarName);

            const [newUsers] = await logQuery(database.execute.bind(database), 
                'SELECT * FROM users WHERE id = ?', 
                [createResult.insertId], 'Get newly created Google user');

            user = newUsers[0];

            const dashURL = `${process.env.FRONTEND_URL}/dashboard`;
            const emailFormat = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Welcome to GPA Lens!',
                html: EmailTemplates.googleWelcomeEmailTemplate(dashURL, username)
            };

            await emailService.sendEmail(email, username, emailFormat);

            logger.info('New Google user created', {
                userId: user.id,
                username: username,
                email: user.email
            });
        }

        //generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                tableName: user.table_name,
                calendarName: user.calendar_name
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        response.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                email_reminders: user.email_reminders,
                daily_digest: user.daily_digest,
                isGoogleUser: true,
                hasPassword: Boolean(user.has_password)
            }
        });
    } catch (error) {
        logger.error('Google authentication error', {
            error: error.message,
            stack: error.stack
        });

        if (error.message.includes('Token used too late')) {
            return response.status(400).json({ error: 'Google token expired. Please try again.' });
        }

        response.status(500).json({ error: 'Google authentication failed' });
    }
})

//Testing new emails

// 🧪 EMAIL TEMPLATE TEST ENDPOINT
app.post('/api/test-all-email-templates', async (req, res) => {
    try {
        const results = [];
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAILAPPPASS
            }
        });

        // 1. Welcome Email
        try {
            const welcomeHTML = EmailTemplates.welcomeEmailTemplate(
                `${process.env.FRONTEND_URL}/dashboard`,
                'TestUser'
            );
            await transporter.sendMail({
                from: `"GPA Lens" <${process.env.EMAIL}>`,
                to: process.env.EMAIL,
                subject: '🎨 [1/6] Welcome Email Template Test',
                html: welcomeHTML
            });
            results.push({ template: 'welcome', status: 'success' });
        } catch (error) {
            results.push({ template: 'welcome', status: 'failed', error: error.message });
        }

        // 2. Google Welcome Email
        try {
            const googleWelcomeHTML = EmailTemplates.googleWelcomeEmailTemplate(
                `${process.env.FRONTEND_URL}/dashboard`,
                'GoogleTestUser'
            );
            await transporter.sendMail({
                from: `"GPA Lens" <${process.env.EMAIL}>`,
                to: process.env.EMAIL,
                subject: '🎨 [2/6] Google Welcome Email Template Test',
                html: googleWelcomeHTML
            });
            results.push({ template: 'google-welcome', status: 'success' });
        } catch (error) {
            results.push({ template: 'google-welcome', status: 'failed', error: error.message });
        }

        // 3. Forgot Password Email
        try {
            const forgotPasswordHTML = EmailTemplates.forgotPasswordEmailTemplate(
                `${process.env.FRONTEND_URL}/reset-password?token=test-token-12345`,
                'TestUser'
            );
            await transporter.sendMail({
                from: `"GPA Lens" <${process.env.EMAIL}>`,
                to: process.env.EMAIL,
                subject: '🎨 [3/6] Forgot Password Email Template Test',
                html: forgotPasswordHTML
            });
            results.push({ template: 'forgot-password', status: 'success' });
        } catch (error) {
            results.push({ template: 'forgot-password', status: 'failed', error: error.message });
        }

        const successCount = results.filter(r => r.status === 'success').length;
        const totalCount = results.length;

        res.json({
            success: true,
            message: `Email template testing completed! ${successCount}/${totalCount} templates sent successfully.`,
            sentTo: process.env.EMAIL,
            results: results,
            summary: {
                total: totalCount,
                successful: successCount,
                failed: totalCount - successCount
            }
        });

    } catch (error) {
        res.status(500).json({
            error: error.message,
            template: 'all-templates'
        });
    }
})

setInterval(() => {
    let expiredTokens = 0
    for (const [token, data] of resetTokens.entries()) {
        if (data.expiry < Date.now()) {
            resetTokens.delete(token);
            expiredTokens++;
        }
    }
    if (expiredTokens > 0) {
        logger.debug('Cleaned up expired tokens, more reset tokens still active', { count: expiredTokens });
    }
}, 60000)


const Port = process.env.PORT || 8080;

async function startServer() {
  await initDatabase();
  app.listen(Port, () => {
    console.log(`Server running on port ${Port}`);
    logger.info('Server started with email reminder system', { port: Port });
  });
}

startServer().catch(console.error);