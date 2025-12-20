import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'datagiga0@gmail.com';
const SENDER_EMAIL = 'GigaData <noreply@gigadata.store>';

const renderEmail = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; color: #334155; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 40px 30px; line-height: 1.6; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 0; font-size: 12px; color: #64748b; }
    .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
    .table td:first-child { font-weight: 600; color: #64748b; width: 40%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${title}</h1></div>
    <div class="content">${content}</div>
    <div class="footer"><p>&copy; 2025 Edu-Hub Data Limited. All rights reserved.</p></div>
  </div>
</body>
</html>
`;

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        const { type, email, name, amount, details } = JSON.parse(event.body || '{}');
        if (!type || !email) return { statusCode: 400, body: 'Missing required fields' };

        let subject = '', emailHtml = '', adminSubject = '', adminHtml = '';

        switch (type) {
            case 'signup':
                subject = 'Welcome to GigaData!';
                emailHtml = renderEmail('Welcome Onboard!', `
                    <p>Hi ${name},</p>
                    <p>Thanks for joining Edu-Hub Data Connect! Your account is active and you can now start buying data at the best rates in Ghana.</p>
                    <a href="https://gigadata.store" class="button">Visit Dashboard</a>
                `);
                adminSubject = 'New User Alert';
                adminHtml = `<p><b>${name}</b> (${email}) just signed up.</p>`;
                break;

            case 'purchase':
                subject = 'Order Confirmation - GigaData';
                emailHtml = renderEmail('Purchase Successful', `
                    <p>Hi ${name}, your order was successful!</p>
                    <table class="table">
                        <tr><td>Item</td><td>${details}</td></tr>
                        <tr><td>Amount</td><td>GH¢${amount}</td></tr>
                        <tr><td>Status</td><td><span style="color:#10b981">Completed</span></td></tr>
                    </table>
                `);
                adminSubject = 'New Order Received';
                adminHtml = `<p><b>${name}</b> bought <b>${details}</b> for GH¢${amount}.</p>`;
                break;

            case 'withdrawal':
                subject = 'Withdrawal Request Received';
                emailHtml = renderEmail('Request Received', `
                    <p>Hi ${name}, we've received your withdrawal request.</p>
                    <table class="table">
                        <tr><td>Amount</td><td>GH¢${amount}</td></tr>
                        <tr><td>Payout Method</td><td>Mobile Money</td></tr>
                        <tr><td>Est. Time</td><td>12-24 Hours</td></tr>
                    </table>
                `);
                adminSubject = 'Withdrawal Action Required';
                adminHtml = `<p><b>${name}</b> requested GH¢${amount}.</p>`;
                break;

            case 'affiliate':
                subject = 'Affiliate Account Activated';
                emailHtml = renderEmail('Welcome Partner!', `
                    <p>Congratulations ${name}, your affiliate status is now active!</p>
                    <p>You can now earn <b>₵5</b> per referral and <b>2%</b> on their data purchases. Visit your dashboard to get your link.</p>
                    <a href="https://gigadata.store/affiliate" class="button">Go to Affiliate Dashboard</a>
                `);
                adminSubject = 'New Affiliate Partner';
                adminHtml = `<p><b>${name}</b> joined the affiliate program (GH¢50 paid).</p>`;
                break;

            default: return { statusCode: 400, body: 'Invalid type' };
        }

        // Notify Admin
        await resend.emails.send({ from: SENDER_EMAIL, to: ADMIN_EMAIL, subject: adminSubject, html: adminHtml });

        // Notify User
        const { data, error } = await resend.emails.send({ from: SENDER_EMAIL, to: [email], subject, html: emailHtml });

        if (error) return { statusCode: 500, body: JSON.stringify(error) };
        return { statusCode: 200, body: JSON.stringify({ success: true, data }) };

    } catch (err: any) {
        return { statusCode: 500, body: err.message };
    }
};
