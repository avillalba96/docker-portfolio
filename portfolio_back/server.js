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

function visitorDisplayName(name) {
    return (name || '').trim() || 'Visitante';
}

/** Nombre visible en bandeja Outlook (De:) — parece un mail del visitante */
function inboxFromDisplay(name, email) {
    const displayName = visitorDisplayName(name);
    const addr = (email || '').trim();
    if (!addr) {
        return displayName;
    }
    return `${displayName} <${addr}>`;
}

function buildPortfolioMail({ name, email, subject, message }) {
    const displayName = visitorDisplayName(name);
    const visitorEmail = (email || '').trim();
    const formSubject = (subject || '').trim() || 'Contacto desde el sitio';
    const mailSubject = formSubject.startsWith(PORTFOLIO_TAG)
        ? formSubject
        : `${PORTFOLIO_TAG} ${formSubject}`;

    const siteUrl = SITE_NAME.startsWith('http') ? SITE_NAME : `https://${SITE_NAME}`;
    const deLine = inboxFromDisplay(name, email);
    const bodyMessage = message || '';

    const text = [
        '════════════════════════════════════════════════════',
        `  ${PORTFOLIO_TAG}  Contacto web · ${SITE_NAME}`,
        `  ${siteUrl}`,
        '════════════════════════════════════════════════════',
        '',
        `De:      ${deLine}`,
        `Asunto:  ${formSubject}`,
        '',
        '────────────────────────────────────────────────────',
        'Mensaje del visitante',
        '────────────────────────────────────────────────────',
        '',
        bodyMessage,
        '',
        '────────────────────────────────────────────────────',
        'Respondé a este correo para escribirle directamente al visitante.',
        `(Reply-To: ${visitorEmail || 'no indicado'})`,
    ].join('\n');

    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f4f4f5;font-family:Consolas,'Courier New',monospace;font-size:14px;line-height:1.55;color:#18181b;">
<pre style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #d4d4d8;border-radius:8px;padding:20px 24px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(text)}</pre>
</body></html>`;

    return {
        subject: mailSubject,
        text,
        html,
        /** Outlook muestra esto en la columna De (el SMTP sigue siendo no-reply@) */
        fromName: deLine,
        replyTo: {
            name: displayName,
            email: visitorEmail,
        },
    };
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
                fromName: mail.fromName,
                replyTo: mail.replyTo,
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
