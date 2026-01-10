require('dotenv').config();
const nodemailer = require('nodemailer');

async function debugEmail() {
    console.log('🔍 Starting Email Debugger (Universal)...');

    // 1. Check Env Vars
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = process.env.EMAIL_PORT || 587;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    console.log(`\n📧 Checking Credentials:`);
    console.log(`Host: ${host}`);
    console.log(`Port: ${port}`);
    console.log(`User: ${user ? user : '❌ MISSING'}`);
    console.log(`Pass: ${pass ? '********' : '❌ MISSING'}`);

    if (!user || !pass) {
        console.error('❌ Critical Error: Missing EMAIL_USER or EMAIL_PASS in .env file');
        return;
    }

    // 2. Create Transporter
    const transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(port),
        secure: false,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
    });

    // 3. Verify Connection
    console.log('\n🔌 Verifying SMTP Connection...');
    try {
        await transporter.verify();
        console.log('✅ Connection Verification Successful!');
    } catch (error) {
        console.error('❌ Connection Verification Failed:');
        console.error(error.message);
        return;
    }

    // 4. Send Test Email
    console.log('\n📨 Sending Test Email to self...');
    const sender = process.env.EMAIL_FROM || 'recipeportal.mailer@gmail.com';
    try {
        const info = await transporter.sendMail({
            from: sender,
            to: user, // Send to self
            subject: 'Test Email from Recipe Portal (Brevo)',
            text: 'If you are reading this, your Brevo configuration is working perfectly!'
        });
        console.log('✅ Test Email Sent Successfully!');
        console.log(`Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Failed to send email:');
        console.error(error);
    }
}

debugEmail();
