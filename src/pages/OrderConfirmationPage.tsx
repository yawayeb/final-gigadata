import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Copy, Home, Clock, ShieldCheck, HelpCircle, ShoppingBag, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

interface Transaction {
    id: string;
    amount: number;
    description: string;
    reference: string;
    created_at: string;
    type: string;
}

function extractMsisdn(description: string): string {
    const match = description.match(/\b0[0-9]{9}\b/);
    return match ? match[0] : "—";
}

function extractValue(description: string): string {
    const bundleMatch = description.match(/Purchased (.+?) for 0/);
    if (bundleMatch) return bundleMatch[1];
    const pipeMatch = description.match(/^([^|–]+)/);
    if (pipeMatch) return pipeMatch[1].trim();
    return description;
}

const OrderConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { profile } = useProfile();

    const referenceFromState: string | undefined = (location.state as any)?.reference;

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!referenceFromState) {
            navigate("/", { replace: true });
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

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4">
                <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground text-sm font-medium">Loading your order details…</p>
            </div>
        );
    }

    if (notFound || !transaction) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <HelpCircle className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Order Not Found</h1>
                        <p className="text-muted-foreground text-sm">
                            We couldn't find this transaction. If you completed payment, please wait a moment and
                            refresh, or contact support with your Paystack reference.
                        </p>
                    </div>
                    <Button size="lg" onClick={() => navigate("/")}>
                        Go to Home
                    </Button>
                </div>
            </div>
        );
    }

    const msisdn = extractMsisdn(transaction.description);
    const value = extractValue(transaction.description);
    const orderedAt = new Date(transaction.created_at).toLocaleString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    const orderNumber = `#${transaction.id.split("-")[0].toUpperCase()}`;

    return (
        <div className="min-h-[80vh] bg-gradient-to-b from-primary/5 via-background to-background">
            <div className="max-w-lg mx-auto px-4 py-8 sm:py-12 space-y-8">
                {/* ── Page Header: Success ───────────────────────────────────────── */}
                <header className="text-center space-y-4 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 border-2 border-primary/20">
                        <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                            Payment Successful 🎉
                        </h1>
                        <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                            Your data bundle order has been received and is being processed.
                        </p>
                    </div>
                </header>

                {/* ── Order Information Card ────────────────────────────────────── */}
                <section className="bg-card rounded-2xl border border-border shadow-lg shadow-black/5 overflow-hidden animate-fade-in" style={{ animationDelay: "0.05s" }}>
                    <div className="px-5 py-4 border-b border-border bg-muted/30">
                        <h2 className="font-display font-semibold text-foreground text-lg">Order Information</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Keep this for your records</p>
                    </div>
                    <div className="p-5 sm:p-6 space-y-0">
                        <DetailRow
                            label="Order Number"
                            value={orderNumber}
                            onCopy={() => copyToClipboard(transaction.id, "Order number")}
                        />
                        <DetailRow
                            label="Paystack Transaction Reference"
                            value={transaction.reference}
                            onCopy={() => copyToClipboard(transaction.reference, "Reference")}
                            mono
                        />
                        <DetailRow
                            label="Beneficiary Phone Number"
                            value={msisdn}
                            onCopy={msisdn !== "—" ? () => copyToClipboard(msisdn, "Phone number") : undefined}
                        />
                        <DetailRow label="Bundle / Value" value={value} />
                        <DetailRow label="Amount Paid" value={`GH₵ ${Number(transaction.amount).toFixed(2)}`} />
                        <DetailRow label="Order Date & Time" value={orderedAt} />
                        <DetailRow label="User Name" value={profile?.full_name || "—"} />
                        <DetailRow
                            label="Email Address"
                            value={profile?.email || "—"}
                            onCopy={profile?.email ? () => copyToClipboard(profile.email, "Email") : undefined}
                        />
                    </div>
                </section>

                {/* ── Reference ID Note ─────────────────────────────────────────── */}
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                    <div className="flex gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <h3 className="font-semibold text-foreground mb-1">Important</h3>
                            <p className="text-muted-foreground">
                                Your Paystack Reference ID is in the confirmation email. Use it for support or if you need to reorder.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Processing Time ──────────────────────────────────────────── */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
                    <div className="flex gap-3">
                        <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <h3 className="font-semibold text-foreground mb-1">Processing time</h3>
                            <p className="text-muted-foreground">
                                Data bundles may take up to <span className="font-medium text-foreground">30 minutes</span> to reflect. Check your balance before contacting support.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Guest Navigation Buttons ──────────────────────────────────── */}
                <div className="space-y-3 pt-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                    <p className="text-center text-sm text-muted-foreground mb-4">What would you like to do next?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button
                            variant="default"
                            size="lg"
                            className="w-full gap-2 h-12 font-medium"
                            onClick={() => navigate("/")}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Buy Another Bundle
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full gap-2 h-12 font-medium"
                            onClick={() => navigate("/")}
                        >
                            <Home className="w-5 h-5" />
                            Go to Home
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full gap-2 h-12 font-medium"
                            onClick={() => navigate("/reorder")}
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reorder Page
                        </Button>
                    </div>
                </div>

                {/* ── Thank you ──────────────────────────────────────────────────── */}
                <p className="text-center text-sm text-muted-foreground pt-4">
                    Thank you for choosing <span className="font-semibold text-foreground">GigaData</span>. We appreciate your trust.
                </p>
            </div>
        </div>
    );
};

interface DetailRowProps {
    label: string;
    value: string;
    onCopy?: () => void;
    mono?: boolean;
}

const DetailRow = ({ label, value, onCopy, mono }: DetailRowProps) => (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-b-0">
        <span className="text-sm text-muted-foreground font-medium min-w-[140px] sm:min-w-[160px]">{label}</span>
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
            <span className={`text-sm font-semibold text-foreground text-right break-all ${mono ? "font-mono" : ""}`}>
                {value}
            </span>
            {onCopy && (
                <button
                    type="button"
                    onClick={onCopy}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-muted transition-colors"
                    title={`Copy ${label}`}
                >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
            )}
        </div>
    </div>
);

export default OrderConfirmationPage;
