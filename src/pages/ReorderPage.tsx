import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Phone, Hash, AlertCircle, LogIn } from "lucide-react";
import { SystemNoticeBanner } from "@/components/SystemNoticeBanner";
import { PublicNav } from "@/components/layout/PublicNav";

const HELPER_TEXT =
  "If you completed payment but did not see your confirmation page due to network issues, enter your Paystack reference and phone number to retrieve your order.";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return digits;
  if (digits.length === 9) return "0" + digits;
  return phone.trim();
}

const ReorderPage = () => {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFindOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const refTrim = reference.trim();
    const phoneNorm = normalizePhone(phone);

    if (!refTrim || !phoneNorm) {
      toast({
        title: "Missing information",
        description: "Please enter both Paystack reference and phone number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Sign in required",
          description:
            "Please log in with the account you used for the purchase to retrieve your order.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: rows, error } = await supabase
        .from("transactions")
        .select("id, reference, description, status")
        .eq("user_id", user.id)
        .eq("reference", refTrim)
        .eq("status", "success");

      if (error) throw error;

      const match =
        rows &&
        rows.find((r) => {
          const desc = (r.description || "").toLowerCase();
          const phoneDigits = phoneNorm.replace(/\D/g, "");
          return (
            desc.includes(phoneNorm) ||
            (phoneDigits.length >= 9 && desc.includes(phoneDigits))
          );
        });

      if (match) {
        navigate("/order-confirmation", {
          state: { reference: match.reference },
          replace: true,
        });
        return;
      }

      toast({
        title: "Order not found",
        description:
          "No matching order for this reference and phone number. Please check the details or contact support.",
        variant: "destructive",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SystemNoticeBanner />
      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-lg">
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Reorder
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Retrieve your order using your Paystack reference
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-8 space-y-6">
            <div className="rounded-xl bg-muted/50 border border-border p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {HELPER_TEXT}
              </p>
            </div>

            <form onSubmit={handleFindOrder} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reference">Paystack Transaction Reference</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="reference"
                    type="text"
                    placeholder="e.g. bundle_1234567890"
                    className="pl-10 h-12 bg-background/50 border-border"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number Used for Order</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 0241234567"
                    className="pl-10 h-12 bg-background/50 border-border"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full font-semibold h-12"
                disabled={loading}
              >
                {loading ? "Finding…" : "Find Order"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to="/auth?tab=login"
                className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
              >
                <LogIn className="w-4 h-4" />
                Log in
              </Link>{" "}
              with the email you used at checkout to retrieve your order.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReorderPage;
