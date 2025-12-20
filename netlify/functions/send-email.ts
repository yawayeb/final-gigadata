import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'yawayaw098@gmail.com'; // Admin email based on context or common usage

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { type, email, name, amount, details } = JSON.parse(event.body || '{}');

        if (!type || !email) {
            return { statusCode: 400, body: 'Missing required fields' };
        }

        let subject = '';
        let html = '';

        switch (type) {
            case 'signup':
                subject = 'Welcome to Edu-Hub Data Connect!';
                html = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #6366f1;">Welcome, ${name}!</h1>
            <p>Thank you for joining Edu-Hub Data Connect. We are excited to have you on board.</p>
            <p>You can now start buying data bundles and earning commissions through our affiliate program.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Edu-Hub Data Connect - Your data hub in Ghana.</p>
          </div>
        `;

                // Notify Admin
                await resend.emails.send({
                    from: 'Edu-Hub <onboarding@resend.dev>',
                    to: ADMIN_EMAIL,
                    subject: 'New User Signup',
                    html: `<p>A new user has signed up: <b>${name}</b> (${email})</p>`,
                });
                break;

            case 'purchase':
                subject = 'Data Purchase Successful';
                html = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #10b981;">Order Confirmed!</h1>
            <p>Hi ${name}, your purchase of GH¢${amount} for <b>${details}</b> was successful.</p>
            <p>Thank you for choosing Edu-Hub Data Connect.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Edu-Hub Data Connect</p>
          </div>
        `;

                // Notify Admin
                await resend.emails.send({
                    from: 'Edu-Hub <onboarding@resend.dev>',
                    to: ADMIN_EMAIL,
                    subject: 'New Purchase Entry',
                    html: `<p>User <b>${name}</b> (${email}) purchased <b>${details}</b> for GH¢${amount}.</p>`,
                });
                break;

            case 'withdrawal':
                subject = 'Withdrawal Request Received';
                html = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #f59e0b;">Request Pending</h1>
            <p>Hi ${name}, we have received your request to withdraw GH¢${amount}.</p>
            <p>Our team is currently processing your request. You will receive another notification once it's completed.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Edu-Hub Data Connect</p>
          </div>
        `;

                // Notify Admin
                await resend.emails.send({
                    from: 'Edu-Hub <onboarding@resend.dev>',
                    to: ADMIN_EMAIL,
                    subject: 'New Withdrawal Request',
                    html: `<p>User <b>${name}</b> (${email}) requested a withdrawal of GH¢${amount}.</p>`,
                });
                break;

            case 'affiliate':
                subject = 'Affiliate Program Activated!';
                html = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #6366f1;">Congratulations ${name}!</h1>
            <p>You are now an official affiliate of Edu-Hub Data Connect.</p>
            <p>Start sharing your referral code to earn ₵5 commission on every join and 2% on every data purchase!</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Edu-Hub Data Connect Affiliate Program</p>
          </div>
        `;

                // Notify Admin
                await resend.emails.send({
                    from: 'Edu-Hub <onboarding@resend.dev>',
                    to: ADMIN_EMAIL,
                    subject: 'New Affiliate Joined',
                    html: `<p>User <b>${name}</b> (${email}) has paid for the affiliate program activation (GH¢50).</p>`,
                });
                break;

            default:
                return { statusCode: 400, body: 'Invalid email type' };
        }

        const { data, error } = await resend.emails.send({
            from: 'Edu-Hub <onboarding@resend.dev>',
            to: [email],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('Resend error:', error);
            return { statusCode: 500, body: JSON.stringify(error) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully', data }),
        };
    } catch (err: any) {
        console.error('Function error:', err);
        return { statusCode: 500, body: err.message };
    }
};
