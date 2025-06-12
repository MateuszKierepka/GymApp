const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass
    }
});

const sendVerificationCode = async (email, code) => {
    try {
        await transporter.sendMail({
            from: emailConfig.from,
            to: email,
            subject: 'Kod weryfikacyjny do zresetowania hasła - GymApp',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Reset hasła</h2>
            <p style="color: #666;">Otrzymaliśmy prośbę o zresetowanie hasła dla Twojego konta w GymApp.</p>
            <p style="color: #666;">Twój kod weryfikacyjny to:</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
            <strong>${code}</strong>
            </div>
            <p style="color: #666;">Kod jest ważny przez 1 minutę.</p>
            <p style="color: #666;">Jeśli nie prosiłeś o resetowanie hasła, zignoruj ten email.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">Ten email został wysłany automatycznie, prosimy na niego nie odpowiadać.</p>
            </div>
            `
        });
        return true;
    } catch (error) {
        console.error('Błąd wysyłania emaila:', error);
        return false;
    }
};

module.exports = sendVerificationCode; 