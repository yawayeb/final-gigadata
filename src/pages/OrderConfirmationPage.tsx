import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Copy, Home, Clock, ShieldCheck, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
    id: string;
    amount: number;
    description: string;
    reference: string;
    created_at: string;
    type: string;
}

// Pull phone / MSISDN from the free-text description
function extractMsisdn(description: string): string {
    // Matches "for 0241234567" or "| 0241234567 |" patterns
    const match = description.match(/\b0[0-9]{9}\b/);
    return match ? match[0] : "—";
}

// Derive a friendly "value" label from the description
function extractValue(description: string): string {
    // For data bundles: "Purchased 5GB Bundle (5GB) for 0241234567"
    const bundleMatch = description.match(/Purchased (.+?) for 0/);
    if (bundleMatch) return bundleMatch[1];
    // For AFA and other services use everything before the first "|" or "-"
    const pipeMatch = description.match(/^([^|–]+)/);
    if (pipeMatch) return pipeMatch[1].trim();
    return description;
}

const OrderConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Reference passed via router state from ServicesPage / AffiliatePage
    const referenceFromState: string | undefined = (location.state as any)?.reference;

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        // Guard: if no reference, user navigated here directly — redirect away
        if (!referenceFromState) {
            navigate("/services", { replace: true });
            return;
        }

        const fetchTransaction = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("transactions")
                .select("id, amount, description, reference, created_at, type")
                .eq("reference", referenceFromState)
                .eq("status", "success")
                .single();

            if (error || !data) {
                setNotFound(true);
            } else {
                setTransaction(data);
            }
            setLoading(false);
        };

        fetchTransaction();
    }, [referenceFromState, navigate]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: `${label} copied!`, description: text });
    };

    // ── Loading State ────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground text-sm">Loading your order details…</p>
            </div>
        );
    }

    // ── Not Found ────────────────────────────────────────────────────────────────
    if (notFound || !transaction) {
        return (
            <div className="max-w-md mx-auto text-center space-y-4 mt-12">
                <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto" />
                <h1 className="text-2xl font-display font-bold text-foreground">
                    Order Not Found
                </h1>
                <p className="text-muted-foreground text-sm">
                    We couldn't find this transaction. If you completed payment, please wait a moment and
                    refresh, or contact support with your Paystack reference.
                </p>
                <Button variant="gradient" onClick={() => navigate("/services")}>
                    Back to Services
                </Button>
            </div>
        );
    }

    const msisdn = extractMsisdn(transaction.description);
    const value = extractValue(transaction.description);
    const orderedAt = new Date(transaction.created_at).toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    // ── Confirmation View ────────────────────────────────────────────────────────
    return (
        <div className="max-w-xl mx-auto space-y-6 pb-12">

            {/* Success Banner */}
            <div className="gradient-hero rounded-3xl p-8 text-white text-center shadow-elevated animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold mb-1">
                    Order Successfully Made ✅
                </h1>
                <p className="text-white/80 text-sm">
                    Thank you for your purchase. Your order has been received and is being processed.
                </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in space-y-1" style={{ animationDelay: "100ms" }}>
                <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    📦 Order Details
                </h2>

                <DetailRow
                    label="Order ID"
                    value={`#${transaction.id.split("-")[0].toUpperCase()}`}
                    onCopy={() => copyToClipboard(transaction.id, "Order ID")}
                />
                <DetailRow
                    label="MSISDN (Phone)"
                    value={msisdn}
                    onCopy={msisdn !== "—" ? () => copyToClipboard(msisdn, "Phone number") : undefined}
                />
                <DetailRow
                    label="Value"
                    value={value}
                />
                <DetailRow
                    label="Amount Paid"
                    value={`GH₵ ${Number(transaction.amount).toFixed(2)}`}
                />
                <DetailRow
                    label="Date & Time"
                    value={orderedAt}
                />
                <div className="pt-2">
                    <div className="flex items-start justify-between gap-3 py-3 border-t border-border">
                        <span className="text-sm text-muted-foreground min-w-[110px]">Reference ID</span>
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-sm font-semibold text-primary break-all text-right">
                                {transaction.reference}
                            </span>
                            <button
                                onClick={() => copyToClipboard(transaction.reference, "Reference ID")}
                                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
                                title="Copy Reference ID"
                            >
                                <Copy className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reference ID Note */}
            <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-foreground text-sm mb-1">🔎 Important Information</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                            The <span className="font-semibold text-foreground">Reference ID</span> above is also included in the
                            email sent to you by Paystack (listed as "Reference" or "Transaction ID").
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mb-1">You will need this Reference ID to:</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5 pl-2">
                            <li>• Make a complaint</li>
                            <li>• Request support</li>
                            <li>• Reprocess an order if there is a payment issue</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Processing Time Notice */}
            <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: "300ms" }}>
                <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-foreground text-sm mb-1">⏳ Processing Time</h3>
                        <p className="text-xs text-muted-foreground mb-1">
                            All data bundle purchases may take up to <span className="font-semibold text-foreground">30 minutes</span> to process.
                            You will be notified once processing is completed.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            If you do not receive a notification within 30 minutes, please kindly check your data balance
                            before contacting support.
                        </p>
                    </div>
                </div>
            </div>

            {/* Closing Message */}
            <div className="text-center py-2 animate-fade-in" style={{ animationDelay: "400ms" }}>
                <p className="text-sm text-muted-foreground">
                    🤝 Thank you for choosing <span className="font-semibold text-foreground">Giga Data</span>.
                    We appreciate your trust and support.
                </p>
            </div>

            {/* Back to Home */}
            <div className="flex justify-center animate-fade-in" style={{ animationDelay: "450ms" }}>
                <Button
                    variant="gradient"
                    size="xl"
                    className="px-10"
                    onClick={() => navigate("/dashboard")}
                >
                    <Home className="w-5 h-5 mr-2" />
                    Back to Home
                </Button>
            </div>
        </div>
    );
};

// ── Helper sub-component ─────────────────────────────────────────────────────
interface DetailRowProps {
    label: string;
    value: string;
    onCopy?: () => void;
}

const DetailRow = ({ label, value, onCopy }: DetailRowProps) => (
    <div className="flex items-start justify-between gap-3 py-3 border-t border-border first:border-t-0">
        <span className="text-sm text-muted-foreground min-w-[110px]">{label}</span>
        <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-foreground text-right break-all">
                {value}
            </span>
            {onCopy && (
                <button
                    onClick={onCopy}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
                    title={`Copy ${label}`}
                >
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
            )}
        </div>
    </div>
);

export default OrderConfirmationPage;
