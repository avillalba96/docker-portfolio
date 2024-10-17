const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de límites
const rateLimiterIP = new RateLimiterMemory({
    points: 1, // 1 punto permitido cada 5 minutos
    duration: 300, // 300 segundos = 5 minutos
});

const rateLimiterEmail = new RateLimiterMemory({
    points: 1, // 1 punto permitido cada 5 minutos
    duration: 300, // 300 segundos = 5 minutos
});

const rateLimiterCombined = new RateLimiterMemory({
    points: 1, // 1 punto permitido cada 5 minutos
    duration: 300, // 300 segundos = 5 minutos
});

// Límite diario y mensual por IP y correo electrónico
const rateLimiterDaily = new RateLimiterMemory({
    points: 200, // 200 correos permitidos por día
    duration: 86400, // 86400 segundos = 1 día
});

const rateLimiterMonthly = new RateLimiterMemory({
    points: 1000, // 1000 correos permitidos por mes
    duration: 1296000, // 1296000 segundos = 15 días
});

// CORS configuration from environment variable
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
    const { name, email, subject, message } = req.body;
    const combinedIdentifier = `${email}_${req.ip}`; // Identificador combinado de correo e IP

    try {
        // Verificar límites por IP, correo electrónico, y combinación de ambos
        await rateLimiterIP.consume(req.ip);
        await rateLimiterEmail.consume(email);
        await rateLimiterCombined.consume(combinedIdentifier);

        // Verificar límites diarios y mensuales
        await rateLimiterDaily.consume(req.ip);
        await rateLimiterMonthly.consume(req.ip);

        // Configuración de nodemailer para Mailtrap
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER.split(':')[0], // 'api' parte del usuario SMTP
                pass: process.env.SMTP_USER.split(':')[1]  // Clave API de Mailtrap
            }
        });

        let info = await transporter.sendMail({
            from: process.env.MAIL_FROM, // Usar no-reply como remitente
            to: process.env.TO_EMAIL,
            subject: subject,
            text: `Mensaje de ${name} (${email}): ${message}`,
        });

        if (info.rejected.length > 0) {
            res.status(400).send('Email was rejected by the SMTP server.');
        } else {
            res.status(200).send('Email sent successfully.');
        }
    } catch (error) {
        if (error instanceof RateLimiterMemory) {
            // Mensajes de error genéricos sin revelar detalles específicos
            res.status(429).send('Email sending limit reached. Please try again later.');
        } else {
            console.error('Error sending email:', error);
            res.status(500).send('Failed to send email.');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
