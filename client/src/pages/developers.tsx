import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Code2,
  Key,
  Lock,
  Zap,
  Coffee,
  FileJson,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Database,
  Shield,
  Sparkles,
  BookOpen,
  Webhook,
  Clock,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const API_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/clients",
    description: "Retrieve all clients for a user",
    params: "userId (query)",
    response: "Array of client objects",
  },
  {
    method: "POST",
    path: "/api/clients",
    description: "Create a new client",
    params: "userId, name, contactName, contactEmail, industry, etc.",
    response: "Created client object",
  },
  {
    method: "GET",
    path: "/api/notes",
    description: "Retrieve portfolio notes",
    params: "userId (query)",
    response: "Array of CRM note objects",
  },
  {
    method: "POST",
    path: "/api/notes",
    description: "Create a new portfolio note",
    params: "userId, title, content, templateType, clientId, etc.",
    response: "Created note object",
  },
  {
    method: "GET",
    path: "/api/scheduled-orders",
    description: "Retrieve scheduled orders",
    params: "userId (query)",
    response: "Array of scheduled order objects",
  },
  {
    method: "POST",
    path: "/api/scheduled-orders",
    description: "Create a new order (2hr lead time required)",
    params: "userId, vendorId, deliveryDate, deliveryTime, etc.",
    response: "Created order with events",
  },
  {
    method: "GET",
    path: "/api/documents",
    description: "Retrieve scanned documents",
    params: "userId, search, category (query)",
    response: "Array of document objects",
  },
  {
    method: "POST",
    path: "/api/documents",
    description: "Upload scanned document with OCR text",
    params: "userId, title, category, extractedText, imageData, etc.",
    response: "Created document object",
  },
];

const CODE_EXAMPLES = {
  javascript: `// Fetch clients using the Coffee Talk API
const response = await fetch('/api/clients?userId=your-user-id', {
  headers: {
    'Content-Type': 'application/json',
  }
});
const clients = await response.json();

// Create a new order
const order = await fetch('/api/scheduled-orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'your-user-id',
    vendorId: 'vendor-123',
    deliveryDate: '2024-12-15',
    deliveryTime: '09:00',
    deliveryAddress: '123 Business St, Nashville TN',
    items: [
      { name: 'Latte', quantity: 5, price: 4.50 }
    ],
    totalAmount: 22.50
  })
});`,
  python: `import requests

# Fetch clients
response = requests.get(
    'https://your-app.replit.app/api/clients',
    params={'userId': 'your-user-id'}
)
clients = response.json()

# Create a new order
order_data = {
    'userId': 'your-user-id',
    'vendorId': 'vendor-123',
    'deliveryDate': '2024-12-15',
    'deliveryTime': '09:00',
    'deliveryAddress': '123 Business St, Nashville TN',
    'items': [{'name': 'Latte', 'quantity': 5, 'price': 4.50}],
    'totalAmount': 22.50
}
response = requests.post(
    'https://your-app.replit.app/api/scheduled-orders',
    json=order_data
)`,
  curl: `# Fetch clients
curl -X GET "https://your-app.replit.app/api/clients?userId=your-user-id"

# Create a new order
curl -X POST "https://your-app.replit.app/api/scheduled-orders" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "your-user-id",
    "vendorId": "vendor-123",
    "deliveryDate": "2024-12-15",
    "deliveryTime": "09:00",
    "deliveryAddress": "123 Business St, Nashville TN",
    "items": [{"name": "Latte", "quantity": 5, "price": 4.50}],
    "totalAmount": 22.50
  }'`,
};

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    POST: "bg-blue-500/10 text-blue-700 border-blue-200",
    PUT: "bg-amber-500/10 text-amber-700 border-amber-200",
    DELETE: "bg-red-500/10 text-red-700 border-red-200",
  };
  return (
    <Badge variant="outline" className={`font-mono text-xs ${colors[method] || ""}`}>
      {method}
    </Badge>
  );
}

export default function DevelopersPage() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("javascript");
  const [email, setEmail] = useState("");

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(key);
    toast({ title: "Code copied!", description: "Paste it in your project." });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleEarlyAccess = () => {
    if (!email.includes("@")) {
      toast({ title: "Invalid email", variant: "destructive" });
      return;
    }
    toast({ 
      title: "You're on the list! ☕", 
      description: "We'll notify you when API keys are available." 
    });
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 luxury-pattern grain-overlay relative">
      <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-10">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover-3d" data-testid="button-back">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-4xl font-bold flex items-center gap-3"
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shine-effect">
                  <Code2 className="h-8 w-8" />
                </div>
                <span className="gradient-text">Developer Hub</span>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Sparkles className="h-6 w-6 text-amber-500" />
                </motion.div>
              </motion.h1>
              <p className="text-muted-foreground mt-1">Build amazing integrations with Coffee Talk</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2 hover-3d" data-testid="button-home">
              <Home className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="premium-card overflow-hidden border-0">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent" />
            <CardContent className="p-8 relative">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-amber-500/10 text-amber-700 border-amber-200">
                    <Zap className="h-3 w-3 mr-1" /> Coming Soon
                  </Badge>
                  <h2 className="font-serif text-3xl font-bold mb-4 gradient-text">
                    API Early Access
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Be the first to integrate Coffee Talk into your business systems. 
                    Get notified when API keys become available.
                  </p>
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-premium max-w-xs"
                      data-testid="input-early-access-email"
                    />
                    <Button 
                      onClick={handleEarlyAccess}
                      className="btn-premium text-white"
                      data-testid="button-early-access"
                    >
                      Join Waitlist
                    </Button>
                  </div>
                </div>
                <div className="hidden md:flex justify-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="relative"
                  >
                    <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl glow-pulse">
                      <Coffee className="h-24 w-24 text-white" />
                    </div>
                    <motion.div
                      className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Key className="h-6 w-6 text-white" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Shield, title: "Secure", desc: "PIN-based auth", color: "from-emerald-500 to-teal-600" },
            { icon: Clock, title: "2hr Lead Time", desc: "Order validation", color: "from-blue-500 to-indigo-600" },
            { icon: Database, title: "PostgreSQL", desc: "Reliable storage", color: "from-purple-500 to-pink-600" },
            { icon: Webhook, title: "Webhooks", desc: "Coming soon", color: "from-amber-500 to-orange-600" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Card className="premium-card hover-3d cursor-pointer group border-0">
                <CardContent className="p-6 text-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                  >
                    <item.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <Terminal className="h-6 w-6 text-amber-600" />
                API Reference
              </CardTitle>
              <CardDescription>
                Complete list of available endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {API_ENDPOINTS.map((endpoint, i) => (
                  <motion.div
                    key={`${endpoint.method}-${endpoint.path}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all group"
                    data-testid={`endpoint-${endpoint.method.toLowerCase()}-${endpoint.path.replace(/\//g, '-')}`}
                  >
                    <div className="flex items-start gap-4">
                      <MethodBadge method={endpoint.method} />
                      <div className="flex-1">
                        <code className="font-mono text-sm font-semibold text-gray-800 group-hover:text-amber-700 transition-colors">
                          {endpoint.path}
                        </code>
                        <p className="text-sm text-muted-foreground mt-1">
                          {endpoint.description}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs">
                          <span className="text-gray-500">
                            <strong>Params:</strong> {endpoint.params}
                          </span>
                          <span className="text-gray-500">
                            <strong>Returns:</strong> {endpoint.response}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <FileJson className="h-6 w-6 text-amber-600" />
                Code Examples
              </CardTitle>
              <CardDescription>
                Quick start with your favorite language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 bg-white/50">
                  <TabsTrigger value="javascript" className="gap-2">
                    JavaScript
                  </TabsTrigger>
                  <TabsTrigger value="python" className="gap-2">
                    Python
                  </TabsTrigger>
                  <TabsTrigger value="curl" className="gap-2">
                    cURL
                  </TabsTrigger>
                </TabsList>

                {Object.entries(CODE_EXAMPLES).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang}>
                    <div className="relative group">
                      <pre className="p-6 rounded-xl bg-gray-900 text-gray-100 overflow-x-auto text-sm font-mono">
                        <code>{code}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCode(code, lang)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10"
                        data-testid={`button-copy-${lang}`}
                      >
                        {copiedCode === lang ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
            <BookOpen className="h-5 w-5 text-amber-600" />
            <span className="text-amber-800 font-medium">
              Full documentation coming soon
            </span>
            <ExternalLink className="h-4 w-4 text-amber-600" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
