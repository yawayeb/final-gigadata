import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDataPackages } from "@/hooks/useDataPackages";

import { usePaystackPayment } from "react-paystack";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";

const serviceNames: Record<string, string> = {
  "at-ishare": "AT iShare Business",
  "mtn-up2u": "MTN UP2U Business",
  "at-bigtime": "AT Big Time Business",
  "telecel": "Telecel Business",
};

const ServicesPage = () => {
  const { service } = useParams();
  const { toast } = useToast();
  const { profile } = useProfile();
  const [selectedBundle, setSelectedBundle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const { packages, loading } = useDataPackages(service);
  const serviceName = service ? serviceNames[service] || "Data Services" : "Data Services";

  const bundle = packages.find((b) => b.id === selectedBundle);

  const config = {
    reference: `bundle_${new Date().getTime()}`,
    email: profile?.email || "",
    amount: (bundle?.price || 0) * 100, // Paystack amount is in pesewas
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    currency: "GHS",
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    try {
      if (!profile || !bundle) return;

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.id,
          amount: bundle.price,
          type: 'purchase',
          status: 'success',
          description: `Purchased ${bundle.name} (${bundle.size}) for ${phoneNumber}`,
          reference: reference.reference
        });

      if (error) throw error;

      toast({
        title: "Payment Successful!",
        description: `${bundle.size} data bundle for ${phoneNumber} has been ordered.`,
      });

      setSelectedBundle("");
      setPhoneNumber("");
    } catch (error: any) {
      toast({
        title: "Transaction Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onClose = () => {
    toast({
      title: "Payment Cancelled",
      description: "The transaction was not completed.",
      variant: "destructive",
    });
  };

  const handlePurchase = () => {
    if (!profile?.email) {
      toast({
        title: "Profile Loading",
        description: "Please wait for your profile to load.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBundle || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please select a bundle and enter a phone number.",
        variant: "destructive",
      });
      return;
    }

    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
      toast({
        title: "Configuration Error",
        description: "Paystack Public Key is missing in .env file.",
        variant: "destructive",
      });
      return;
    }

    initializePayment({ onSuccess, onClose });
  };

  if (!service) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Data Services
          </h1>
          <p className="text-muted-foreground">
            Select a network provider to view available bundles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(serviceNames).map(([key, name], index) => (
            <a
              key={key}
              href={`/services/${key}`}
              className="bg-card rounded-2xl shadow-card p-6 text-center hover:shadow-elevated transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 rounded-2xl gradient-purple mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {name.charAt(0)}
                </span>
              </div>
              <h3 className="font-display font-semibold text-card-foreground">
                {name}
              </h3>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          {serviceName}
        </h1>
        <p className="text-muted-foreground">
          Select a bundle and enter recipient's phone number
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
        <div className="space-y-6">
          <div>
            <Label htmlFor="bundle">Select Bundle</Label>
            <Select value={selectedBundle} onValueChange={setSelectedBundle}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={loading ? "Loading packages..." : "Choose a data bundle"} />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {packages.map((bundle) => (
                  <SelectItem key={bundle.id} value={bundle.id}>
                    <div className="flex justify-between items-center w-full gap-4">
                      <span>{bundle.name}</span>
                      <span className="text-primary font-semibold">
                        GH¢{bundle.price}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBundle && (
            <div className="bg-muted rounded-xl p-4 animate-fade-in">
              {(() => {
                const bundle = packages.find((b) => b.id === selectedBundle);
                return bundle ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground">{bundle.size}</p>
                      <p className="text-sm text-muted-foreground">
                        Valid for {bundle.validity}
                      </p>
                    </div>
                    <p className="text-2xl font-display font-bold text-primary">
                      GH¢{bundle.price}
                    </p>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div>
            <Label htmlFor="phone">Recipient Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., 0241234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <Button
            variant="gradient"
            size="xl"
            className="w-full"
            onClick={handlePurchase}
            disabled={loading}
          >
            {loading ? "Loading..." : "Purchase Bundle"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
