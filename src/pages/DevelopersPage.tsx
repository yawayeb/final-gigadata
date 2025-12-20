import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Key, Webhook, Code, ExternalLink } from "lucide-react";

const DevelopersPage = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const apiKey = "pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx";
  const webhookUrl = "https://api.eduhub-data.com/webhooks/your-id";

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          APIs & Webhooks
        </h1>
        <p className="text-muted-foreground">
          Integrate Edu-Hub Data into your applications
        </p>
      </div>

      {/* API Key Card */}
      <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-card-foreground">
              API Key
            </h3>
            <p className="text-sm text-muted-foreground">
              Use this key to authenticate API requests
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-sm text-muted-foreground overflow-x-auto">
            {apiKey}
          </code>
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(apiKey, "API Key")}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Webhook URL Card */}
      <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Webhook className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-card-foreground">
              Webhook URL
            </h3>
            <p className="text-sm text-muted-foreground">
              Receive real-time notifications for transactions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-sm text-muted-foreground overflow-x-auto">
            {webhookUrl}
          </code>
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Code className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-card-foreground">
              API Documentation
            </h3>
            <p className="text-sm text-muted-foreground">
              Learn how to integrate with our API
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <ExternalLink className="w-4 h-4" />
          View Documentation
        </Button>
      </div>

      {/* Code Example */}
      <div className="bg-card rounded-2xl shadow-card p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
        <h3 className="font-display font-semibold text-lg mb-4 text-card-foreground">
          Quick Start Example
        </h3>
        <pre className="bg-sidebar text-sidebar-foreground rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`// Purchase data bundle
const response = await fetch('https://api.eduhub-data.com/v1/bundles/purchase', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    network: 'at-ishare',
    bundle_id: '1gb-weekly',
    phone: '0241234567'
  })
});

const data = await response.json();
console.log(data);`}</code>
        </pre>
      </div>
    </div>
  );
};

export default DevelopersPage;
