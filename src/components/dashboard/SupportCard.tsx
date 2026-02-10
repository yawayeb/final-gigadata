
import { Phone, Mail, HelpCircle } from "lucide-react";

export const SupportCard = () => {
    return (
        <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
            <h3 className="font-display font-semibold text-lg mb-4 text-card-foreground">
                Need help or have an issue with your order?
            </h3>

            <div className="space-y-4">
                {/* Contact Item */}
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Call or WhatsApp</p>
                        <p className="font-medium text-card-foreground">0530463170</p>
                    </div>
                </div>

                {/* Email Item */}
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-card-foreground">datagiga0@gmail.com</p>
                    </div>
                </div>

                {/* Note Item */}
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Important</p>
                        <p className="font-medium text-card-foreground text-sm">
                            Kindly include your Paystack reference when contacting support for faster assistance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
