const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const app = express();
const PORT = process.env.BACK_PORT || process.env.PORT || 3000;
const MAIL_SERVICE_URL = (process.env.MAIL_SERVICE_URL || 'http://mail-service:3025').replace(/\/$/, '');
const MAIL_SERVICE_API_KEY = process.env.MAIL_SERVICE_API_KEY || '';
const TO_EMAIL = process.env.TO_EMAIL || '';

const rateLimiterIP = new RateLimiterMemory({ points: 1, duration: 300 });
const rateLimiterEmail = new RateLimiterMemory({ points: 1, duration: 300 });
const rateLimiterCombined = new RateLimiterMemory({ points: 1, duration: 300 });
const rateLimiterDaily = new RateLimiterMemory({ points: 200, duration: 86400 });
const rateLimiterMonthly = new RateLimiterMemory({ points: 1000, duration: 1296000 });

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
}));

app.use(bodyParser.json());

function isRateLimitError(err) {
    return err && typeof err.msBeforeNext === 'number';
}

const PORTFOLIO_TAG = '[Portfolio]';
const SITE_NAME = process.env.PORTFOLIO_SITE_NAME || 'avillalba.com.ar';

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildPortfolioMail({ name, email, subject, message }) {
    const formSubject = (subject || '').trim() || 'Contacto desde el sitio';
    const mailSubject = formSubject.startsWith(PORTFOLIO_TAG)
        ? formSubject
        : `${PORTFOLIO_TAG} ${formSubject}`;

    const text = [
        `${PORTFOLIO_TAG} — Formulario de contacto (${SITE_NAME})`,
        '',
        'Recibiste este correo porque alguien envió un mensaje desde el portfolio web.',
        '',
        `De: ${name}`,
        `Email: ${email}`,
        `Asunto en el formulario: ${formSubject}`,
        '',
        '--- Mensaje del visitante ---',
        '',
        message,
        '',
        '---',
        'Para responderle al visitante, usá "Responder" en tu cliente de correo.',
    ].join('\n');

    const siteUrl = SITE_NAME.startsWith('http') ? SITE_NAME : `https://${SITE_NAME}`;
    const html = [
        `<p><strong>${PORTFOLIO_TAG}</strong> — Formulario de contacto`,
        ` (<a href="${escapeHtml(siteUrl)}">${escapeHtml(SITE_NAME)}</a>)</p>`,
        '<p>Recibiste este correo porque alguien envió un mensaje desde el <strong>portfolio web</strong>.</p>',
        '<table cellpadding="4">',
        `<tr><td><strong>De</strong></td><td>${escapeHtml(name)}</td></tr>`,
        `<tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>`,
        `<tr><td><strong>Asunto (formulario)</strong></td><td>${escapeHtml(formSubject)}</td></tr>`,
        '</table>',
        '<hr>',
        '<p><strong>Mensaje del visitante:</strong></p>',
        `<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>`,
        '<hr>',
        '<p><em>Respondé con &quot;Responder&quot; para escribirle al visitante (Reply-To).</em></p>',
    ].join('');

    return { subject: mailSubject, text, html };
}

app.post('/send-email', async (req, res) => {
    const { name, email, subject, message } = req.body;
    const combinedIdentifier = `${email}_${req.ip}`;

    try {
        await rateLimiterIP.consume(req.ip);
        await rateLimiterEmail.consume(email);
        await rateLimiterCombined.consume(combinedIdentifier);
        await rateLimiterDaily.consume(req.ip);
        await rateLimiterMonthly.consume(req.ip);

        const mail = buildPortfolioMail({ name, email, subject, message });

        const mailRes = await fetch(`${MAIL_SERVICE_URL}/v1/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': MAIL_SERVICE_API_KEY,
            },
            body: JSON.stringify({
                to: TO_EMAIL,
                replyTo: email,
                subject: mail.subject,
                text: mail.text,
                html: mail.html,
            }),
        });

        if (mailRes.ok) {
            return res.status(200).send('Email sent successfully.');
        }
        const detail = await mailRes.text();
        console.error('mail-service error:', mailRes.status, detail);
        return res.status(502).send('Failed to send email.');
    } catch (error) {
        if (isRateLimitError(error)) {
            return res.status(429).send('Email sending limit reached. Please try again later.');
        }
        console.error('Error sending email:', error);
        return res.status(500).send('Failed to send email.');
    }
});

app.listen(PORT, () => {
    console.log(`portfolio-back listening on ${PORT}`);
});
