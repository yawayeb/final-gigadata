import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, LogIn, User, Mail } from "lucide-react";

const BENEFITS = [
  "Faster checkout next time",
  "Saved phone numbers",
  "Order history",
  "Access to affiliate dashboard",
];

interface GuestCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueAsGuest: (email: string, fullName: string) => Promise<void>;
  isLoading?: boolean;
}

export const GuestCheckoutModal = ({
  open,
  onOpenChange,
  onContinueAsGuest,
  isLoading = false,
}: GuestCheckoutModalProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"choice" | "guest">("choice");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = () => {
    onOpenChange(false);
    navigate("/auth?tab=login");
  };

  const handleCreateAccount = () => {
    onOpenChange(false);
    navigate("/auth?tab=signup");
  };

  const handleContinueAsGuestClick = () => {
    setStep("guest");
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) return;
    setSubmitting(true);
    try {
      await onContinueAsGuest(email.trim(), fullName.trim());
      onOpenChange(false);
      setStep("choice");
      setEmail("");
      setFullName("");
    } catch {
      // Caller handles toast
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setStep("choice");
      setEmail("");
      setFullName("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {step === "choice"
              ? "Create an account to get more from GigaData"
              : "Continue as guest"}
          </DialogTitle>
          <DialogDescription asChild>
            {step === "choice" ? (
              <p>
                Create an account to save your details, track orders, and easily
                access our affiliate program.
              </p>
            ) : (
              <p>Enter your email and name to complete this order as a guest. We’ll create a simple account so we can process your purchase.</p>
            )}
          </DialogDescription>
        </DialogHeader>

        {step === "choice" ? (
          <div className="space-y-4 pt-2">
            <ul className="text-sm text-muted-foreground space-y-1.5">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span className="text-primary">✓</span> {b}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center gap-2"
                onClick={handleSignIn}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
              <Button
                type="button"
                variant="default"
                className="w-full justify-center gap-2"
                onClick={handleCreateAccount}
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-center gap-2"
                onClick={handleContinueAsGuestClick}
              >
                <User className="w-4 h-4" />
                Continue as Guest
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGuestSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="guest-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="guest-name"
                  type="text"
                  placeholder="e.g. Kofi Mensah"
                  className="pl-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setStep("choice")}
                disabled={submitting}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting || isLoading}
              >
                {submitting ? "Creating account…" : "Proceed to payment"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
