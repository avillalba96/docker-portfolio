const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

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

    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
    });

    try {
        let info = await transporter.sendMail({
            from: email, 
            to: process.env.TO_EMAIL,
            subject: subject,
            text: `Mensaje de ${name}: ${message}`,
        });

        if (info.rejected.length > 0) {
            res.status(400).send('Email was rejected by the SMTP server.');
        } else {
            res.status(200).send('Email sent successfully.');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send email.');
    }
});


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
