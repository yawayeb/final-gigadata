import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface HeroCardProps {
  userName: string;
  totalEarnings: string;
  onWithdraw: () => void;
}

export const HeroCard = ({ userName, totalEarnings, onWithdraw }: HeroCardProps) => {
  return (
    <div className="gradient-hero rounded-2xl p-6 lg:p-8 text-white shadow-elevated animate-fade-in relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <h2 className="text-xl lg:text-2xl font-display font-semibold mb-1">
          Greetings, {userName}!
        </h2>
        <p className="text-white/80 text-sm mb-6">
          Available for Withdrawal
        </p>

        <div className="mb-6">
          <span className="text-4xl lg:text-5xl font-display font-bold">
            GH¢{totalEarnings}
          </span>
        </div>

        <Button
          variant="gradient"
          size="lg"
          onClick={onWithdraw}
          className="gap-2"
        >
          <Wallet className="w-5 h-5" />
          Withdraw Earnings
        </Button>
      </div>
    </div>
  );
};
