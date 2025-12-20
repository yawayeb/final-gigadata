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

interface DataBundle {
  id: string;
  name: string;
  size: string;
  price: string;
  validity: string;
}

const serviceBundles: Record<string, DataBundle[]> = {
  "at-ishare": [
    { id: "1", name: "1GB Bundle", size: "1GB", price: "4.00", validity: "7 Days" },
    { id: "2", name: "2GB Bundle", size: "2GB", price: "7.00", validity: "14 Days" },
    { id: "3", name: "5GB Bundle", size: "5GB", price: "15.00", validity: "30 Days" },
    { id: "4", name: "10GB Bundle", size: "10GB", price: "28.00", validity: "30 Days" },
  ],
  "mtn-up2u": [
    { id: "1", name: "1GB UP2U", size: "1GB", price: "5.00", validity: "7 Days" },
    { id: "2", name: "3GB UP2U", size: "3GB", price: "12.00", validity: "14 Days" },
    { id: "3", name: "6GB UP2U", size: "6GB", price: "22.00", validity: "30 Days" },
    { id: "4", name: "12GB UP2U", size: "12GB", price: "40.00", validity: "30 Days" },
  ],
  "at-bigtime": [
    { id: "1", name: "2GB Big Time", size: "2GB", price: "8.00", validity: "14 Days" },
    { id: "2", name: "5GB Big Time", size: "5GB", price: "18.00", validity: "30 Days" },
    { id: "3", name: "10GB Big Time", size: "10GB", price: "32.00", validity: "30 Days" },
  ],
  "telecel": [
    { id: "1", name: "1GB Telecel", size: "1GB", price: "4.50", validity: "7 Days" },
    { id: "2", name: "3GB Telecel", size: "3GB", price: "11.00", validity: "14 Days" },
    { id: "3", name: "7GB Telecel", size: "7GB", price: "24.00", validity: "30 Days" },
  ],
};

const serviceNames: Record<string, string> = {
  "at-ishare": "AT iShare Business",
  "mtn-up2u": "MTN UP2U Business",
  "at-bigtime": "AT Big Time Business",
  "telecel": "Telecel Business",
};

const ServicesPage = () => {
  const { service } = useParams();
  const { toast } = useToast();
  const [selectedBundle, setSelectedBundle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const bundles = service ? serviceBundles[service] || [] : [];
  const serviceName = service ? serviceNames[service] || "Data Services" : "Data Services";

  const handlePurchase = () => {
    if (!selectedBundle || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please select a bundle and enter a phone number.",
        variant: "destructive",
      });
      return;
    }

    const bundle = bundles.find((b) => b.id === selectedBundle);
    toast({
      title: "Order Placed!",
      description: `${bundle?.size} data bundle for ${phoneNumber} is being processed.`,
    });
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
                <SelectValue placeholder="Choose a data bundle" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {bundles.map((bundle) => (
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
                const bundle = bundles.find((b) => b.id === selectedBundle);
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
          >
            Purchase Bundle
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
