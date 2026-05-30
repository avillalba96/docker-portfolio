const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.MAIL_SERVICE_PORT || 3025;
const API_KEY = process.env.MAIL_SERVICE_API_KEY || '';
const MAILTRAP_API_TOKEN = process.env.MAILTRAP_API_TOKEN || '';
const MAILTRAP_API_URL = process.env.MAILTRAP_API_URL || 'https://send.api.mailtrap.io/api/send';

const useMailtrapApi = Boolean(MAILTRAP_API_TOKEN);

const transporter = useMailtrapApi
    ? null
    : nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

app.use(express.json({ limit: '64kb' }));

function requireApiKey(req, res, next) {
    if (!API_KEY) {
        return res.status(503).send('Mail service API key not configured.');
    }
    if ((req.get('X-API-Key') || '') !== API_KEY) {
        return res.status(401).send('Unauthorized');
    }
    next();
}

function parseReplyTo(replyTo) {
    if (!replyTo) {
        return null;
    }
    if (typeof replyTo === 'object' && replyTo.email) {
        return {
            email: String(replyTo.email).trim(),
            name: (replyTo.name || '').trim() || undefined,
        };
    }
    const raw = String(replyTo).trim();
    const match = raw.match(/^(.+?)\s*<([^>]+)>$/);
    if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
    }
    return { email: raw };
}

async function sendViaMailtrapApi({ to, subject, text, html, replyTo, fromName }) {
    const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.MAIL_FROM;
    const defaultFromName = process.env.MAIL_FROM_NAME || '[Portfolio] avillalba.com.ar';

    const payload = {
        from: { email: fromEmail, name: fromName || defaultFromName },
        to: [{ email: to }],
        subject,
        text: text || undefined,
        html: html || undefined,
        category: process.env.MAILTRAP_CATEGORY || 'portfolio',
    };

    const parsedReply = parseReplyTo(replyTo);
    if (parsedReply?.email) {
        payload.reply_to = {
            email: parsedReply.email,
            ...(parsedReply.name ? { name: parsedReply.name } : {}),
        };
    }

    const res = await fetch(MAILTRAP_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${MAILTRAP_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const body = await res.text();
    if (!res.ok) {
        throw new Error(`Mailtrap API ${res.status}: ${body}`);
    }
    return body;
}

async function sendViaSmtp({ to, subject, text, html, replyTo, fromName }) {
    const parsedReply = parseReplyTo(replyTo);
    const replyHeader = parsedReply?.email
        ? (parsedReply.name ? `${parsedReply.name} <${parsedReply.email}>` : parsedReply.email)
        : undefined;
    const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.MAIL_FROM;
    const smtpFrom = fromName && fromEmail
        ? `${fromName} <${fromEmail}>`
        : process.env.MAIL_FROM;

    const info = await transporter.sendMail({
        from: smtpFrom,
        to,
        replyTo: replyHeader,
        subject,
        text,
        html,
    });
    if (info.rejected?.length > 0) {
        throw new Error(`SMTP rejected: ${info.rejected.join(',')}`);
    }
    return info.messageId;
}

app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        provider: useMailtrapApi ? 'mailtrap-api' : 'smtp',
    });
});

app.post('/v1/send', requireApiKey, async (req, res) => {
    const { to, subject, text, html, replyTo, fromName } = req.body || {};
    const recipient = to || process.env.DEFAULT_TO_EMAIL;

    if (!recipient || !subject || (!text && !html)) {
        return res.status(400).send('Missing to/subject and text or html.');
    }

    try {
        if (useMailtrapApi) {
            await sendViaMailtrapApi({ to: recipient, subject, text, html, replyTo, fromName });
        } else {
            await sendViaSmtp({ to: recipient, subject, text, html, replyTo, fromName });
        }
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Send failed:', err.message);
        return res.status(502).send('Failed to send email.');
    }
});

app.listen(PORT, () => {
    console.log(`mail-service listening on ${PORT} (${useMailtrapApi ? 'mailtrap-api' : 'smtp'})`);
});
