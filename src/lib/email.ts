/**
 * Utility to trigger Netlify Functions for sending emails via Resend.
 */
export const triggerEmail = async (params: {
    type: 'signup' | 'purchase' | 'withdrawal' | 'affiliate';
    email: string;
    name: string;
    amount?: number | string;
    details?: string;
}) => {
    try {
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to trigger email:', errorText);
            return { success: false, error: errorText };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (err: any) {
        console.error('Error triggering email:', err);
        return { success: false, error: err.message };
    }
};
