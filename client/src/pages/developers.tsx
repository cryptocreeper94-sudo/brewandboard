import { useState, useEffect } from "react";
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
  Truck,
  CheckCircle2,
  Circle,
  AlertCircle,
  AlertTriangle,
  Bike,
  Car,
  CreditCard,
  Calendar,
  MessageSquare,
  MapPin,
  Activity,
  Server,
  Wifi,
  WifiOff,
  Bitcoin,
  RefreshCw,
  Wallet,
  Hash,
  FileCheck,
  Search,
  Eye,
  QrCode,
  Download,
  Percent,
  DollarSign,
  TrendingUp,
  Target,
  Users,
  Building2,
  Rocket,
  Award,
  BarChart3,
  Star,
  Globe,
  MousePointer,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  Tags,
  Plus,
  Trash2,
  Save,
  Settings2,
  FileText,
  ShoppingCart,
  Bell,
  BellOff,
  Edit3,
  EyeOff,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { BusinessCardPreview } from "@/components/BusinessCard";
import { DocumentExportPanel } from "@/components/DocumentExport";
import { AppEcosystemHub } from "@/components/AppEcosystemHub";
import { SnippetBrowser } from "@/components/SnippetBrowser";
import { ServiceAreaConfig } from "@/components/ServiceAreaConfig";
import { FranchiseAdminPanel } from "@/components/FranchiseAdminPanel";

interface HallmarkStats {
  totalCompanyHallmarks: number;
  totalUserHallmarks: number;
  totalVerifications: number;
  activeProfiles: number;
  blockchain: {
    configured: boolean;
    network: string;
    currentSlot: number;
    walletBalance: number;
    walletAddress: string;
    rpcEndpoint: string;
  };
}

interface CompanyHallmark {
  id: number;
  serialNumber: string;
  assetType: string;
  assetName?: string;
  contentHash: string;
  status: string;
  solanaTxSignature?: string;
  verificationCount: number;
  issuedAt: string;
}

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
  javascript: `// Fetch clients using the Brew & Board API
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

type HealthStatus = 'healthy' | 'degraded' | 'offline' | 'checking';

interface SystemHealth {
  api: HealthStatus;
  database: HealthStatus;
  stripe: HealthStatus;
  coinbase: HealthStatus;
  lastChecked: Date | null;
}

function StatusLight({ status, size = 'md' }: { status: HealthStatus; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };
  
  const statusColors = {
    healthy: 'bg-emerald-500 shadow-emerald-500/50',
    degraded: 'bg-amber-500 shadow-amber-500/50',
    offline: 'bg-red-500 shadow-red-500/50',
    checking: 'bg-gray-400 animate-pulse'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full ${statusColors[status]} shadow-lg`} />
  );
}

function StatusBadge({ status }: { status: HealthStatus }) {
  const statusText = {
    healthy: 'Operational',
    degraded: 'Degraded',
    offline: 'Offline',
    checking: 'Checking...'
  };
  
  const statusColors = {
    healthy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    degraded: 'bg-amber-100 text-amber-700 border-amber-200',
    offline: 'bg-red-100 text-red-700 border-red-200',
    checking: 'bg-gray-100 text-gray-700 border-gray-200'
  };
  
  return (
    <Badge variant="outline" className={statusColors[status]}>
      {statusText[status]}
    </Badge>
  );
}

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

interface Payee1099 {
  id: string;
  displayName: string;
  legalName?: string;
  type: string;
  taxIdLast4?: string;
  taxIdType?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  w9DocumentUrl?: string;
  w9UploadedAt?: string;
  status: string;
  createdAt: string;
}

interface Payment1099Record {
  id: string;
  payeeId: string;
  amount: string;
  category: string;
  description?: string;
  paymentDate: string;
  referenceNumber?: string;
  isTaxable: boolean;
  taxYear: number;
}

interface Filing1099Record {
  id: string;
  payeeId: string;
  taxYear: number;
  totalTaxablePaid: string;
  thresholdMet: boolean;
  filingStatus: string;
}

interface Summary1099 {
  totalPayees: number;
  totalTaxablePaid: string;
  payeesOverThreshold: number;
  payeesUnderThreshold: number;
  taxYear: number;
  threshold: number;
}

function Compliance1099Portal() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [payees, setPayees] = useState<Payee1099[]>([]);
  const [payments, setPayments] = useState<Payment1099Record[]>([]);
  const [summary, setSummary] = useState<Summary1099 | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPayee, setShowAddPayee] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedPayee, setSelectedPayee] = useState<string | null>(null);
  
  const [newPayee, setNewPayee] = useState({
    displayName: '',
    legalName: '',
    type: 'contractor',
    taxIdLast4: '',
    taxIdType: 'SSN',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: 'TN',
    zipCode: ''
  });
  
  const [newPayment, setNewPayment] = useState({
    payeeId: '',
    amount: '',
    category: 'referral_commission',
    description: '',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    isTaxable: true
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [payeesRes, paymentsRes, summaryRes] = await Promise.all([
        fetch('/api/1099/payees'),
        fetch(`/api/1099/payments?taxYear=${selectedYear}`),
        fetch(`/api/1099/summary/${selectedYear}`)
      ]);
      
      if (payeesRes.ok) setPayees(await payeesRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (summaryRes.ok) setSummary(await summaryRes.json());
    } catch (error) {
      console.error('Failed to fetch 1099 data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const handleAddPayee = async () => {
    if (!newPayee.displayName || !newPayee.taxIdLast4) {
      toast({ title: "Name and Tax ID (last 4) required", variant: "destructive" });
      return;
    }
    
    // Validate tax ID is exactly 4 digits
    if (!/^\d{4}$/.test(newPayee.taxIdLast4)) {
      toast({ title: "Tax ID must be exactly 4 digits", variant: "destructive" });
      return;
    }
    
    try {
      const res = await fetch('/api/1099/payees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPayee,
          status: 'pending_w9'
        })
      });
      
      if (res.ok) {
        toast({ title: "Payee added successfully" });
        setShowAddPayee(false);
        setNewPayee({ displayName: '', legalName: '', type: 'contractor', taxIdLast4: '', taxIdType: 'SSN', email: '', phone: '', addressLine1: '', city: '', state: 'TN', zipCode: '' });
        fetchData();
      } else {
        const error = await res.json();
        toast({ title: error.error || "Failed to add payee", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to add payee", variant: "destructive" });
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.payeeId || !newPayment.amount) {
      toast({ title: "Payee and amount required", variant: "destructive" });
      return;
    }
    
    try {
      const res = await fetch('/api/1099/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPayment,
          taxYear: selectedYear
        })
      });
      
      if (res.ok) {
        toast({ title: "Payment recorded successfully" });
        setShowAddPayment(false);
        setNewPayment({ payeeId: '', amount: '', category: 'referral_commission', description: '', paymentDate: new Date().toISOString().split('T')[0], referenceNumber: '', isTaxable: true });
        fetchData();
      } else {
        const error = await res.json();
        toast({ title: error.error || "Failed to record payment", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to record payment", variant: "destructive" });
    }
  };

  const getPayeeName = (payeeId: string) => {
    const payee = payees.find(p => p.id === payeeId);
    return payee?.displayName || 'Unknown';
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
  };

  const categoryLabels: Record<string, string> = {
    referral_commission: 'Referral Commission',
    delivery_commission: 'Delivery Commission',
    franchise_royalty: 'Franchise Royalty',
    contractor_payment: 'Contractor Payment',
    bonus: 'Bonus',
    other: 'Other'
  };

  return (
    <Card className="premium-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-2xl">
          <FileCheck className="h-6 w-6 text-rose-600" />
          1099 Compliance Portal
        </CardTitle>
        <CardDescription>
          Track payments, commissions, referrals, and issue 1099-NEC forms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Year Selector & Summary */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tax Year:</span>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm bg-white"
              data-testid="select-tax-year"
            >
              {[currentYear, currentYear - 1, currentYear - 2].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {summary && (
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-xs text-emerald-600">Total Taxable Paid</p>
                <p className="font-bold text-emerald-700">{formatCurrency(summary.totalTaxablePaid)}</p>
              </div>
              <div className="px-4 py-2 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-xs text-rose-600">Over $600 Threshold</p>
                <p className="font-bold text-rose-700">{summary.payeesOverThreshold} payees</p>
              </div>
              <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-600">Under Threshold</p>
                <p className="font-bold text-amber-700">{summary.payeesUnderThreshold} payees</p>
              </div>
            </div>
          )}
        </div>

        <Accordion type="multiple" className="space-y-4">
          {/* Payee Directory */}
          <AccordionItem value="payees" className="border rounded-xl bg-white/50 backdrop-blur px-4">
            <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-1099-payees">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Payee Directory</span>
                    <Badge className="bg-rose-100 text-rose-700 border-rose-200">{payees.length} payees</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Manage contractors, partners, and referral sources</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <Button 
                  onClick={() => setShowAddPayee(!showAddPayee)}
                  variant="outline"
                  className="w-full border-dashed"
                  data-testid="button-add-payee"
                >
                  {showAddPayee ? 'Cancel' : '+ Add New Payee'}
                </Button>
                
                {showAddPayee && (
                  <div className="p-4 border rounded-lg bg-white space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Display Name *</label>
                        <Input 
                          value={newPayee.displayName}
                          onChange={(e) => setNewPayee({...newPayee, displayName: e.target.value})}
                          placeholder="Full name or business name"
                          data-testid="input-payee-name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Type</label>
                        <select
                          value={newPayee.type}
                          onChange={(e) => setNewPayee({...newPayee, type: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          data-testid="select-payee-type"
                        >
                          <option value="contractor">Contractor</option>
                          <option value="referral_partner">Referral Partner</option>
                          <option value="franchise_owner">Franchise Owner</option>
                          <option value="delivery_driver">Delivery Driver</option>
                          <option value="vendor">Vendor</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Tax ID Type</label>
                        <select
                          value={newPayee.taxIdType}
                          onChange={(e) => setNewPayee({...newPayee, taxIdType: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          data-testid="select-payee-taxid-type"
                        >
                          <option value="SSN">SSN (Individual)</option>
                          <option value="EIN">EIN (Business)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Tax ID (last 4 digits only) *</label>
                        <Input 
                          value={newPayee.taxIdLast4}
                          onChange={(e) => setNewPayee({...newPayee, taxIdLast4: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                          placeholder="1234"
                          maxLength={4}
                          data-testid="input-payee-taxid"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Security: Only last 4 digits stored</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Email</label>
                        <Input 
                          value={newPayee.email}
                          onChange={(e) => setNewPayee({...newPayee, email: e.target.value})}
                          placeholder="email@example.com"
                          type="email"
                          data-testid="input-payee-email"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Phone</label>
                        <Input 
                          value={newPayee.phone}
                          onChange={(e) => setNewPayee({...newPayee, phone: e.target.value})}
                          placeholder="(615) 555-0123"
                          data-testid="input-payee-phone"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Address</label>
                        <Input 
                          value={newPayee.addressLine1}
                          onChange={(e) => setNewPayee({...newPayee, addressLine1: e.target.value})}
                          placeholder="123 Main St"
                          data-testid="input-payee-address"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">City</label>
                        <Input 
                          value={newPayee.city}
                          onChange={(e) => setNewPayee({...newPayee, city: e.target.value})}
                          placeholder="Nashville"
                          data-testid="input-payee-city"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-500">State</label>
                          <Input 
                            value={newPayee.state}
                            onChange={(e) => setNewPayee({...newPayee, state: e.target.value.toUpperCase().slice(0, 2)})}
                            placeholder="TN"
                            maxLength={2}
                            data-testid="input-payee-state"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">ZIP</label>
                          <Input 
                            value={newPayee.zipCode}
                            onChange={(e) => setNewPayee({...newPayee, zipCode: e.target.value})}
                            placeholder="37201"
                            data-testid="input-payee-zip"
                          />
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleAddPayee} className="w-full bg-rose-600 hover:bg-rose-700" data-testid="button-save-payee">
                      Save Payee
                    </Button>
                  </div>
                )}
                
                {payees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No payees yet. Add your first contractor or referral partner.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {payees.map(payee => (
                      <div 
                        key={payee.id} 
                        className="p-3 border rounded-lg bg-white hover:border-rose-300 transition-colors"
                        data-testid={`payee-row-${payee.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{payee.displayName}</p>
                            <p className="text-sm text-muted-foreground">
                              {payee.type.replace('_', ' ')} • {payee.taxIdType || 'SSN'}: ***-**-{payee.taxIdLast4 || '????'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {payee.w9UploadedAt ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">W-9 On File</Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-200">W-9 Needed</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Payment Ledger */}
          <AccordionItem value="payments" className="border rounded-xl bg-white/50 backdrop-blur px-4">
            <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-1099-payments">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Payment Ledger</span>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{payments.length} payments</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Record commissions, referrals, and contractor payments</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <Button 
                  onClick={() => setShowAddPayment(!showAddPayment)}
                  variant="outline"
                  className="w-full border-dashed"
                  disabled={payees.length === 0}
                  data-testid="button-add-payment"
                >
                  {showAddPayment ? 'Cancel' : '+ Record Payment'}
                </Button>
                
                {payees.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">Add a payee first to record payments</p>
                )}
                
                {showAddPayment && (
                  <div className="p-4 border rounded-lg bg-white space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Payee *</label>
                        <select
                          value={newPayment.payeeId}
                          onChange={(e) => setNewPayment({...newPayment, payeeId: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          data-testid="select-payment-payee"
                        >
                          <option value="">Select payee...</option>
                          {payees.map(p => (
                            <option key={p.id} value={p.id}>{p.displayName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Amount *</label>
                        <Input 
                          value={newPayment.amount}
                          onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          data-testid="input-payment-amount"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Category</label>
                        <select
                          value={newPayment.category}
                          onChange={(e) => setNewPayment({...newPayment, category: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          data-testid="select-payment-category"
                        >
                          <option value="referral_commission">Referral Commission</option>
                          <option value="delivery_commission">Delivery Commission</option>
                          <option value="franchise_royalty">Franchise Royalty</option>
                          <option value="contractor_payment">Contractor Payment</option>
                          <option value="bonus">Bonus</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Payment Date</label>
                        <Input 
                          value={newPayment.paymentDate}
                          onChange={(e) => setNewPayment({...newPayment, paymentDate: e.target.value})}
                          type="date"
                          data-testid="input-payment-date"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500">Description</label>
                        <Input 
                          value={newPayment.description}
                          onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                          placeholder="Description of payment"
                          data-testid="input-payment-description"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Reference #</label>
                        <Input 
                          value={newPayment.referenceNumber}
                          onChange={(e) => setNewPayment({...newPayment, referenceNumber: e.target.value})}
                          placeholder="Check # or transaction ID"
                          data-testid="input-payment-reference"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newPayment.isTaxable}
                          onChange={(e) => setNewPayment({...newPayment, isTaxable: e.target.checked})}
                          id="is-taxable"
                          data-testid="checkbox-payment-taxable"
                        />
                        <label htmlFor="is-taxable" className="text-sm">Taxable (report on 1099)</label>
                      </div>
                    </div>
                    <Button onClick={handleAddPayment} className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="button-save-payment">
                      Record Payment
                    </Button>
                  </div>
                )}
                
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No payments recorded for {selectedYear}.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {payments.map(payment => (
                      <div 
                        key={payment.id} 
                        className="p-3 border rounded-lg bg-white hover:border-emerald-300 transition-colors"
                        data-testid={`payment-row-${payment.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{getPayeeName(payment.payeeId)}</p>
                            <p className="text-sm text-muted-foreground">
                              {categoryLabels[payment.category] || payment.category} • {new Date(payment.paymentDate).toLocaleDateString()}
                            </p>
                            {payment.description && (
                              <p className="text-xs text-muted-foreground mt-1">{payment.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatCurrency(payment.amount)}</p>
                            {payment.isTaxable ? (
                              <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-xs">Taxable</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs">Non-Taxable</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Year-End Filing */}
          <AccordionItem value="filing" className="border rounded-xl bg-white/50 backdrop-blur px-4">
            <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-1099-filing">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Year-End Filing</span>
                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                      {summary?.payeesOverThreshold || 0} to file
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Generate 1099-NEC forms for payees over $600</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-indigo-600" />
                    1099-NEC Filing Requirements
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Issue 1099-NEC to payees who received $600+ in non-employee compensation</li>
                    <li>• Deadline: January 31st (to recipients and IRS)</li>
                    <li>• Must have W-9 on file before issuing 1099</li>
                    <li>• Keep records for at least 4 years</li>
                  </ul>
                </div>
                
                {summary && summary.payeesOverThreshold > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Payees Requiring 1099-NEC ({selectedYear})</h4>
                    <p className="text-xs text-muted-foreground">
                      These payees have received over ${summary.threshold} in taxable payments
                    </p>
                    {payees.filter(p => {
                      const payeePayments = payments.filter(pay => pay.payeeId === p.id && pay.isTaxable);
                      const total = payeePayments.reduce((sum, pay) => sum + Number(pay.amount), 0);
                      return total >= (summary?.threshold || 600);
                    }).map(payee => {
                      const payeePayments = payments.filter(pay => pay.payeeId === payee.id && pay.isTaxable);
                      const total = payeePayments.reduce((sum, pay) => sum + Number(pay.amount), 0);
                      return (
                        <div key={payee.id} className="p-3 border rounded-lg bg-white flex items-center justify-between">
                          <div>
                            <p className="font-medium">{payee.displayName}</p>
                            <p className="text-sm text-muted-foreground">{payee.taxIdType || 'SSN'}: ***-**-{payee.taxIdLast4 || '????'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-rose-600">{formatCurrency(total)}</p>
                            {payee.w9UploadedAt ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Ready to File</Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">W-9 Required</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    <Button variant="outline" className="w-full mt-4" disabled data-testid="button-generate-1099s">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Generate 1099-NEC Forms (Coming Soon)
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No payees have reached the $600 threshold for {selectedYear}.</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

interface VersionTrackingData {
  version: string;
  buildNumber: number;
  lastPublished: string | null;
  hallmarks: Array<{
    version: string;
    hash: string;
    timestamp: string;
    buildNumber: number;
  }>;
}

function VersionTrackingPanel() {
  const { toast } = useToast();
  const [versionData, setVersionData] = useState<VersionTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    fetchVersionData();
  }, []);

  const fetchVersionData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/version/tracking');
      if (res.ok) {
        const data = await res.json();
        setVersionData(data);
      } else {
        toast({ title: "Failed to load version data", variant: "destructive" });
        setVersionData(null);
      }
    } catch (error) {
      console.error('Failed to fetch version data:', error);
      toast({ title: "Error loading version data", variant: "destructive" });
      setVersionData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast({ title: "Hash copied to clipboard" });
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="premium-card border-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5" />
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-serif text-2xl">
              <Hash className="h-6 w-6 text-cyan-600" />
              Version Tracking
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              Build history and deployment hallmarks
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVersionData}
            disabled={isLoading}
            className="gap-2"
            data-testid="button-refresh-versions"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : versionData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200" data-testid="version-current">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-2">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">Current Version</p>
                <p className="font-bold text-2xl text-cyan-700">{versionData.version.startsWith('v') ? versionData.version : `v${versionData.version}`}</p>
              </div>
              
              <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200" data-testid="version-build">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-2">
                  <Hash className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">Build Number</p>
                <p className="font-bold text-2xl text-purple-700">#{versionData.buildNumber}</p>
              </div>
              
              <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200" data-testid="version-published">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">Last Published</p>
                <p className="font-semibold text-sm text-emerald-700">
                  {versionData.lastPublished ? formatDate(versionData.lastPublished) : 'Never'}
                </p>
              </div>
            </div>
            
            <div className="rounded-xl border bg-white/50 backdrop-blur overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-slate-100 to-gray-100 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-amber-600" />
                  Hallmark History ({versionData.hallmarks.length} records)
                </h3>
              </div>
              
              {versionData.hallmarks.length > 0 ? (
                <ScrollArea className="max-h-64">
                  <div className="divide-y">
                    {versionData.hallmarks.slice().reverse().map((hallmark, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 hover:bg-amber-50/50 transition-colors"
                        data-testid={`hallmark-${hallmark.buildNumber}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                              <Award className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{hallmark.version.startsWith('v') ? hallmark.version : `v${hallmark.version}`}</span>
                                <Badge variant="outline" className="text-xs">
                                  Build #{hallmark.buildNumber}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(hallmark.timestamp)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">
                              {hallmark.hash}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyHash(hallmark.hash)}
                              className="h-8 w-8 p-0"
                              data-testid={`copy-hash-${hallmark.buildNumber}`}
                            >
                              {copiedHash === hallmark.hash ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Hash className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hallmarks recorded yet.</p>
                  <p className="text-sm">Run the version bump script with --hallmark flag to create records.</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-2">
                <Terminal className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Bump Version Before Publishing</p>
                  <code className="text-xs bg-blue-100 px-2 py-0.5 rounded mt-1 inline-block">
                    npx tsx scripts/bump-version.ts patch --hallmark
                  </code>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Failed to load version data.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * ============================================
 * RELEASE MANAGER
 * ============================================
 * Category: DevOps and Release Management
 * Tags: release-manager, version-control, solana-blockchain, drizzle, express, react, devops
 * 
 * FEATURES:
 * - Database-backed release management
 * - Automated version numbering and semver strings
 * - Solana blockchain verification on publish
 * - Dynamic footer version badge with blockchain verification link
 * - Full CRUD API for releases
 * 
 * HOW IT WORKS:
 * When user clicks "Publish" in Replit, the build process (script/build.ts) automatically:
 * 1. Bumps version (patch increment: 1.2.7 → 1.2.8)
 * 2. Generates unique build hash (SHA-256, 16 chars)
 * 3. Submits transaction to Solana mainnet via Memo program
 * 4. Updates version.json with new version, hash, tx signature, slot
 * 5. Updates login.tsx and replit.md with new version
 * 6. Builds and deploys the app
 * 
 * FILES INVOLVED:
 * - script/build.ts: Contains autoRelease() function that runs on publish
 * - scripts/bump-version.ts: CLI tool for manual version bumping
 * - version.json: Stores version history and hallmark records
 * - server/routes.ts: POST /api/version/release endpoint
 * - client/src/components/Footer.tsx: Dynamic version badge from API
 * - server/solanaService.ts: Blockchain anchoring functions
 * - server/hallmarkService.ts: Hallmark issuance and tracking
 * 
 * SOLANA INTEGRATION:
 * - Uses Memo Program (MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr)
 * - Transaction format: "BB-VERSION:{version}:{hash}"
 * - Requires SOLANA_WALLET_PRIVATE_KEY secret (Base58 or JSON array format)
 * - Optional HELIUS_API_KEY for premium RPC, falls back to public RPC
 * 
 * MANUAL CLI USAGE:
 * npx tsx scripts/bump-version.ts patch --hallmark  (patch bump + Solana stamp)
 * npx tsx scripts/bump-version.ts minor --hallmark  (minor bump + Solana stamp)
 * npx tsx scripts/bump-version.ts major --hallmark  (major bump + Solana stamp)
 * 
 * API ENDPOINTS:
 * GET  /api/version/tracking - Returns current version, build number, hallmark history
 * POST /api/version/release  - Creates new release with Solana stamp
 *   Body: { bumpType: 'patch'|'minor'|'major', changelog?: string, releaseNotes?: string }
 *   Returns: { version, buildNumber, buildHash, hallmarkSerial, solanaTx, solanaSlot }
 * 
 * VERSION.JSON STRUCTURE:
 * {
 *   "version": "1.2.8",
 *   "buildNumber": 6,
 *   "lastPublished": "2025-12-07T...",
 *   "hallmarks": [
 *     { "version": "1.2.8", "hash": "abc123...", "solanaTx": "sig...", "solanaSlot": 123456 }
 *   ]
 * }
 */
function ReleaseManagerPanel() {
  const { toast } = useToast();
  const [versionData, setVersionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReleasing, setIsReleasing] = useState(false);

  useEffect(() => {
    fetchVersionData();
  }, []);

  const fetchVersionData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/version/tracking');
      if (res.ok) setVersionData(await res.json());
    } catch (error) {
      console.error('Failed to fetch version:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createRelease = async (bumpType: 'patch' | 'minor' | 'major') => {
    setIsReleasing(true);
    try {
      const res = await fetch('/api/version/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bumpType })
      });
      if (res.ok) {
        const data = await res.json();
        toast({ 
          title: `Released v${data.version}`, 
          description: data.solanaTx ? `Stamped on Solana: ${data.solanaTx.slice(0, 20)}...` : 'Local hallmark created'
        });
        fetchVersionData();
      } else {
        const err = await res.json();
        toast({ title: 'Release failed', description: err.error, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Release failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsReleasing(false);
    }
  };

  const latestHallmark = versionData?.hallmarks?.slice(-1)[0];

  return (
    <Card className="premium-card border-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5" />
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-serif text-2xl">
              <Rocket className="h-6 w-6 text-violet-600" />
              Release Manager
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              Automated version control with Solana blockchain verification
            </CardDescription>
          </div>
          <Badge className="bg-violet-100 text-violet-700 border-violet-200">
            DevOps
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative pt-0 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Current Version */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Version</p>
                  <p className="font-bold text-3xl text-violet-700">v{versionData?.version || '1.0.0'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Build #{versionData?.buildNumber || 0}</p>
                </div>
                {latestHallmark?.solanaTx && (
                  <a 
                    href={`https://solscan.io/tx/${latestHallmark.solanaTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-xs hover:bg-emerald-200 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Verified on Solana
                  </a>
                )}
              </div>
            </div>

            {/* Quick Release Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 border-violet-200 hover:bg-violet-50"
                onClick={() => createRelease('patch')}
                disabled={isReleasing}
                data-testid="button-release-patch"
              >
                <span className="font-semibold">Patch</span>
                <span className="text-xs text-muted-foreground">Bug fixes</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 border-purple-200 hover:bg-purple-50"
                onClick={() => createRelease('minor')}
                disabled={isReleasing}
                data-testid="button-release-minor"
              >
                <span className="font-semibold">Minor</span>
                <span className="text-xs text-muted-foreground">New features</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 border-fuchsia-200 hover:bg-fuchsia-50"
                onClick={() => createRelease('major')}
                disabled={isReleasing}
                data-testid="button-release-major"
              >
                <span className="font-semibold">Major</span>
                <span className="text-xs text-muted-foreground">Breaking changes</span>
              </Button>
            </div>

            {/* Auto-Release Info */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Automatic on Publish</p>
                  <p className="text-xs mt-1">
                    When you click Publish, the build process automatically bumps version, 
                    stamps to Solana mainnet, and updates all version references.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Reference */}
            <Accordion type="single" collapsible>
              <AccordionItem value="technical" className="border-violet-200">
                <AccordionTrigger className="text-sm font-medium text-violet-700">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Technical Reference
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs space-y-3">
                  <div className="p-2 rounded bg-slate-100 font-mono">
                    <p className="font-semibold mb-1">Files:</p>
                    <p>script/build.ts - autoRelease() on publish</p>
                    <p>scripts/bump-version.ts - CLI tool</p>
                    <p>version.json - Version history</p>
                    <p>server/routes.ts - POST /api/version/release</p>
                    <p>Footer.tsx - Dynamic version badge</p>
                  </div>
                  <div className="p-2 rounded bg-slate-100 font-mono">
                    <p className="font-semibold mb-1">CLI:</p>
                    <p>npx tsx scripts/bump-version.ts patch --hallmark</p>
                  </div>
                  <div className="p-2 rounded bg-slate-100 font-mono">
                    <p className="font-semibold mb-1">Secrets Required:</p>
                    <p>SOLANA_WALLET_PRIVATE_KEY (Base58 or JSON)</p>
                    <p>HELIUS_API_KEY (optional, for premium RPC)</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Darkwave Dev Hub Browser - Search/Browse available snippets in the ecosystem
function DarkwaveHubBrowser() {
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<Array<{
    id: string;
    name: string;
    description?: string;
    category: string;
    language?: string;
    code: string;
    version?: string;
    usageCount?: number;
    createdAt?: string;
  }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all snippets on mount
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/ecosystem/snippets")
      .then(r => r.json())
      .then(data => {
        setSnippets(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => {
        setSnippets([]);
        setIsLoading(false);
      });
  }, []);

  // Search by name
  const searchByName = async () => {
    if (!searchQuery.trim()) {
      // Reset to all snippets
      const res = await fetch("/api/ecosystem/snippets");
      const data = await res.json();
      setSnippets(Array.isArray(data) ? data : []);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ecosystem/snippets?name=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSnippets(Array.isArray(data) ? data : []);
    } catch (e) {
      toast({ title: "Search failed", variant: "destructive" });
    }
    setIsLoading(false);
  };

  // Get unique categories
  const categories = Array.from(new Set(snippets.map(s => s.category))).filter(Boolean);

  // Filter snippets
  const filteredSnippets = snippets.filter(s => {
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    return true;
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <Card className="premium-card border-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-blue-500/5" />
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center gap-2 font-serif text-2xl">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
            <Database className="h-5 w-5 text-white" />
          </div>
          Darkwave Dev Hub Browser
        </CardTitle>
        <CardDescription>
          Search and browse code snippets shared across the ecosystem
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name (e.g., analytics.md)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchByName()}
              className="pl-10"
              data-testid="input-hub-search"
            />
          </div>
          <Button onClick={searchByName} className="bg-gradient-to-r from-purple-500 to-indigo-600" data-testid="button-hub-search">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2">
            <Label className="text-sm">Category:</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48" data-testid="select-hub-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredSnippets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No snippets found in the Dev Hub</p>
            <p className="text-sm">Push snippets to share code across the ecosystem</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3 pr-4">
              {filteredSnippets.map(snippet => (
                <div 
                  key={snippet.id} 
                  className="p-4 rounded-xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedSnippet(selectedSnippet === snippet.id ? null : snippet.id)}
                  data-testid={`snippet-${snippet.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-purple-800">{snippet.name}</span>
                        {snippet.version && (
                          <Badge variant="outline" className="text-xs">{snippet.version}</Badge>
                        )}
                      </div>
                      {snippet.description && (
                        <p className="text-sm text-muted-foreground mt-1">{snippet.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Tags className="h-3 w-3" />
                          {snippet.category}
                        </span>
                        {snippet.language && (
                          <span className="flex items-center gap-1">
                            <Code2 className="h-3 w-3" />
                            {snippet.language}
                          </span>
                        )}
                        {snippet.usageCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {snippet.usageCount} uses
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={e => { e.stopPropagation(); copyToClipboard(snippet.code); }}
                      data-testid={`button-copy-snippet-${snippet.id}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {selectedSnippet === snippet.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Code Preview:</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={e => { e.stopPropagation(); copyToClipboard(snippet.code); }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy All
                        </Button>
                      </div>
                      <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs overflow-x-auto max-h-64">
                        <code>{snippet.code.slice(0, 2000)}{snippet.code.length > 2000 ? "\n\n... (truncated)" : ""}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Agent Retrieval Instructions */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
          <p className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Agent Retrieval Instructions
          </p>
          <div className="text-sm text-indigo-700 space-y-2 font-mono">
            <p># Search by name:</p>
            <code className="block p-2 rounded bg-white/50">GET /api/ecosystem/snippets?name=analytics.md</code>
            <p># Get exact match:</p>
            <code className="block p-2 rounded bg-white/50">GET /api/ecosystem/snippets/by-name/analytics.md</code>
            <p># Browse by category:</p>
            <code className="block p-2 rounded bg-white/50">GET /api/ecosystem/snippets?category=documentation</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Analytics Panel Component
function AnalyticsPanel() {
  const { toast } = useToast();
  const [seoTagType, setSeoTagType] = useState("og");
  const [seoTags, setSeoTags] = useState<Array<{ id: string; type: string; name: string; content: string }>>([]);
  const [newTag, setNewTag] = useState({ name: "", content: "" });
  const [timeRange, setTimeRange] = useState("7days");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [regions, setRegions] = useState<Array<{ id: string; name: string }>>([]);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagContent, setEditTagContent] = useState("");
  const [alerts, setAlerts] = useState<Array<{ id: string; metric: string; operator: string; threshold: number; enabled: boolean; name: string }>>([]);
  const [newAlert, setNewAlert] = useState({ metric: "bounceRate", operator: "gt", threshold: 50, name: "" });
  const [businessMetrics, setBusinessMetrics] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch SEO tags, regions, alerts, and business metrics on mount
  useEffect(() => {
    fetch("/api/seo/tags").then(r => r.json()).then(setSeoTags).catch(() => {});
    fetch("/api/analytics/regions").then(r => r.json()).then(setRegions).catch(() => {});
    fetch("/api/analytics/alerts").then(r => r.json()).then(setAlerts).catch(() => {});
  }, []);

  // Fetch business metrics when range or region changes
  useEffect(() => {
    const params = new URLSearchParams({ range: timeRange });
    if (selectedRegion !== "all") params.append("regionId", selectedRegion);
    fetch(`/api/analytics/business?${params}`).then(r => r.json()).then(setBusinessMetrics).catch(() => {});
  }, [timeRange, selectedRegion]);

  // Traffic demo data (would come from analytics provider)
  const weeklyData = [
    { name: "Mon", visitors: 245, pageViews: 892, bounceRate: 42 },
    { name: "Tue", visitors: 312, pageViews: 1045, bounceRate: 38 },
    { name: "Wed", visitors: 278, pageViews: 956, bounceRate: 45 },
    { name: "Thu", visitors: 389, pageViews: 1234, bounceRate: 35 },
    { name: "Fri", visitors: 425, pageViews: 1456, bounceRate: 32 },
    { name: "Sat", visitors: 198, pageViews: 567, bounceRate: 48 },
    { name: "Sun", visitors: 156, pageViews: 423, bounceRate: 52 },
  ];

  const monthlyData = [
    { name: "Week 1", visitors: 1890, pageViews: 6234, bounceRate: 40 },
    { name: "Week 2", visitors: 2156, pageViews: 7845, bounceRate: 38 },
    { name: "Week 3", visitors: 2478, pageViews: 8956, bounceRate: 35 },
    { name: "Week 4", visitors: 2834, pageViews: 10234, bounceRate: 33 },
  ];

  const topPages = [
    { page: "/", views: 4523, avgTime: "2:34" },
    { page: "/vendors", views: 2891, avgTime: "3:12" },
    { page: "/order", views: 2156, avgTime: "4:45" },
    { page: "/portfolio", views: 1834, avgTime: "2:56" },
    { page: "/developers", views: 945, avgTime: "5:23" },
  ];

  const referrers = [
    { source: "Google", visits: 3245, percentage: 45 },
    { source: "Direct", visits: 2156, percentage: 30 },
    { source: "Twitter", visits: 892, percentage: 12 },
    { source: "LinkedIn", visits: 534, percentage: 7 },
    { source: "Other", visits: 423, percentage: 6 },
  ];

  const currentData = timeRange === "7days" ? weeklyData : monthlyData;
  const totalVisitors = currentData.reduce((sum, d) => sum + d.visitors, 0);
  const totalPageViews = currentData.reduce((sum, d) => sum + d.pageViews, 0);
  const avgBounceRate = Math.round(currentData.reduce((sum, d) => sum + d.bounceRate, 0) / currentData.length);

  const addSeoTag = async () => {
    if (!newTag.name || !newTag.content) {
      toast({ title: "Missing fields", description: "Please enter both tag name and content", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/seo/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: seoTagType, name: newTag.name, content: newTag.content })
      });
      const tag = await res.json();
      setSeoTags(prev => [...prev, tag]);
      setNewTag({ name: "", content: "" });
      toast({ title: "Tag added", description: `Added ${newTag.name}` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to add tag", variant: "destructive" });
    }
  };

  const updateSeoTag = async (id: string) => {
    try {
      await fetch(`/api/seo/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editTagContent })
      });
      setSeoTags(prev => prev.map(t => t.id === id ? { ...t, content: editTagContent } : t));
      setEditingTag(null);
      toast({ title: "Tag updated" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update tag", variant: "destructive" });
    }
  };

  const removeSeoTag = async (id: string) => {
    try {
      await fetch(`/api/seo/tags/${id}`, { method: "DELETE" });
      setSeoTags(prev => prev.filter(t => t.id !== id));
      toast({ title: "Tag removed" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to remove tag", variant: "destructive" });
    }
  };

  const addAlert = async () => {
    if (!newAlert.name) {
      toast({ title: "Missing name", description: "Please enter an alert name", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/analytics/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert)
      });
      const alert = await res.json();
      setAlerts(prev => [...prev, alert]);
      setNewAlert({ metric: "bounceRate", operator: "gt", threshold: 50, name: "" });
      toast({ title: "Alert created" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create alert", variant: "destructive" });
    }
  };

  const toggleAlert = async (id: string, enabled: boolean) => {
    try {
      await fetch(`/api/analytics/alerts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled })
      });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !enabled } : a));
    } catch (e) {
      toast({ title: "Error", description: "Failed to toggle alert", variant: "destructive" });
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await fetch(`/api/analytics/alerts/${id}`, { method: "DELETE" });
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast({ title: "Alert deleted" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete alert", variant: "destructive" });
    }
  };

  const exportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/analytics/export/csv?range=${timeRange}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${timeRange}-${Date.now()}.csv`;
      a.click();
      toast({ title: "Exported", description: "CSV downloaded successfully" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to export CSV", variant: "destructive" });
    }
    setIsExporting(false);
  };

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Brew & Board Analytics Report", 20, 20);
      doc.setFontSize(12);
      doc.text(`Date Range: ${timeRange}`, 20, 35);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);
      
      doc.setFontSize(14);
      doc.text("Traffic Metrics", 20, 60);
      doc.setFontSize(11);
      doc.text(`Total Visitors: ${totalVisitors.toLocaleString()}`, 25, 70);
      doc.text(`Total Page Views: ${totalPageViews.toLocaleString()}`, 25, 78);
      doc.text(`Avg Bounce Rate: ${avgBounceRate}%`, 25, 86);
      
      if (businessMetrics) {
        doc.setFontSize(14);
        doc.text("Business Metrics", 20, 100);
        doc.setFontSize(11);
        doc.text(`Total Orders: ${businessMetrics.totalOrders}`, 25, 110);
        doc.text(`Total Revenue: $${businessMetrics.totalRevenue}`, 25, 118);
        doc.text(`Conversion Rate: ${businessMetrics.conversionRate}%`, 25, 126);
        doc.text(`Avg Order Value: $${businessMetrics.avgOrderValue}`, 25, 134);
      }
      
      doc.save(`analytics-report-${timeRange}-${Date.now()}.pdf`);
      toast({ title: "Exported", description: "PDF downloaded successfully" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to export PDF", variant: "destructive" });
    }
    setIsExporting(false);
  };

  const filteredTags = seoTags.filter(t => t.type === seoTagType);

  return (
    <Card className="premium-card border-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5" />
      <CardHeader className="relative pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 font-serif text-2xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Track visitors, page views, SEO performance, and business metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportCSV} 
              disabled={isExporting}
              data-testid="button-export-csv"
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportPDF} 
              disabled={isExporting}
              data-testid="button-export-pdf"
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Badge className="bg-cyan-500/10 text-cyan-700 border-cyan-200">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>
        
        {/* Filters Row */}
        <div className="flex items-center gap-4 flex-wrap mt-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">Date Range:</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36" data-testid="select-date-range-header">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {regions.length > 0 && (
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">Region:</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-40" data-testid="select-region-filter">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Business Metrics from Real Data */}
        {businessMetrics && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200" data-testid="business-metrics-section">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-800">Business Metrics (Real Data)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center" data-testid="metric-total-orders">
                <p className="text-2xl font-bold text-amber-800">{businessMetrics.totalOrders}</p>
                <p className="text-xs text-amber-600">Total Orders</p>
              </div>
              <div className="text-center" data-testid="metric-total-revenue">
                <p className="text-2xl font-bold text-emerald-700">${businessMetrics.totalRevenue}</p>
                <p className="text-xs text-emerald-600">Revenue</p>
              </div>
              <div className="text-center" data-testid="metric-conversion-rate">
                <p className="text-2xl font-bold text-blue-700">{businessMetrics.conversionRate}%</p>
                <p className="text-xs text-blue-600">Conversion</p>
              </div>
              <div className="text-center" data-testid="metric-avg-order">
                <p className="text-2xl font-bold text-violet-700">${businessMetrics.avgOrderValue}</p>
                <p className="text-xs text-violet-600">Avg Order</p>
              </div>
            </div>
            {businessMetrics.topVendors?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-amber-200">
                <p className="text-sm font-medium text-amber-700 mb-2">Top Vendors by Revenue:</p>
                <div className="flex flex-wrap gap-2">
                  {businessMetrics.topVendors.map((v: any, i: number) => (
                    <Badge key={i} variant="outline" className="bg-white/50" data-testid={`top-vendor-${i}`}>
                      {v.name}: ${v.revenue.toFixed(0)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Traffic Metrics Overview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="analytics-metrics-grid">
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200" data-testid="metric-unique-visitors">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-cyan-600" />
              <span className="text-xs text-cyan-700 font-medium">Unique Visitors</span>
            </div>
            <p className="text-2xl font-bold text-cyan-800" data-testid="value-unique-visitors">{totalVisitors.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600">+12.5%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200" data-testid="metric-page-views">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-indigo-600" />
              <span className="text-xs text-indigo-700 font-medium">Page Views</span>
            </div>
            <p className="text-2xl font-bold text-indigo-800" data-testid="value-page-views">{totalPageViews.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600">+8.3%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200" data-testid="metric-bounce-rate">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="h-4 w-4 text-amber-600" />
              <span className="text-xs text-amber-700 font-medium">Bounce Rate</span>
            </div>
            <p className="text-2xl font-bold text-amber-800" data-testid="value-bounce-rate">{avgBounceRate}%</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600">-5.2%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200" data-testid="metric-avg-session">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium">Avg. Session</span>
            </div>
            <p className="text-2xl font-bold text-emerald-800" data-testid="value-avg-session">3:24</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600">+18s</span>
            </div>
          </div>
        </div>

        {/* Accordion Sections */}
        <Accordion type="multiple" defaultValue={["traffic", "seo"]} className="space-y-3">
          {/* Traffic Visualization */}
          <AccordionItem value="traffic" className="border rounded-xl bg-white/50 backdrop-blur overflow-hidden" data-testid="accordion-traffic">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/30" data-testid="accordion-trigger-traffic">
              <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Traffic Trends</span>
                <Badge variant="outline" className="ml-2 text-xs">Visual</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <Label className="text-sm">Time Range:</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-36" data-testid="select-time-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Visitors Chart */}
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentData}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="#06b6d4" 
                      fillOpacity={1} 
                      fill="url(#colorVisitors)" 
                      strokeWidth={2}
                      name="Visitors"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pageViews" 
                      stroke="#8b5cf6" 
                      fillOpacity={1} 
                      fill="url(#colorPageViews)" 
                      strokeWidth={2}
                      name="Page Views"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart for Bounce Rate */}
              <div className="mt-6">
                <p className="text-sm font-medium text-muted-foreground mb-3">Bounce Rate by Day</p>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.95)', 
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb'
                        }} 
                      />
                      <Bar dataKey="bounceRate" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Bounce %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SEO Tag Management */}
          <AccordionItem value="seo" className="border rounded-xl bg-white/50 backdrop-blur overflow-hidden" data-testid="accordion-seo">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/30" data-testid="accordion-trigger-seo">
              <div className="flex items-center gap-2">
                <Tags className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold">SEO Tag Management</span>
                <Badge className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">{seoTags.length} tags</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {/* Tag Type Selector */}
              <div className="flex items-center gap-4 mb-4">
                <Label className="text-sm font-medium">Tag Type:</Label>
                <Select value={seoTagType} onValueChange={setSeoTagType}>
                  <SelectTrigger className="w-48" data-testid="select-seo-tag-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="og">Open Graph (og:)</SelectItem>
                    <SelectItem value="twitter">Twitter Card</SelectItem>
                    <SelectItem value="meta">Meta Tags</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Tags */}
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-muted-foreground">Current {seoTagType === "og" ? "Open Graph" : seoTagType === "twitter" ? "Twitter Card" : "Meta"} Tags:</p>
                <ScrollArea className="h-48">
                  <div className="space-y-2 pr-4">
                    {filteredTags.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No tags of this type</p>
                    ) : (
                      filteredTags.map(tag => (
                        <div key={tag.id} className="p-2 rounded-lg bg-white border border-gray-100 group" data-testid={`seo-tag-${tag.id}`}>
                          <div className="flex items-center justify-between">
                            <code className="text-xs font-mono text-emerald-700">{tag.name}</code>
                            <div className="flex items-center gap-1">
                              {editingTag === tag.id ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => updateSeoTag(tag.id)}
                                  className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                                  data-testid={`button-save-tag-${tag.id}`}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => { setEditingTag(tag.id); setEditTagContent(tag.content); }}
                                  className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                  data-testid={`button-edit-tag-${tag.id}`}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeSeoTag(tag.id)}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                                data-testid={`button-remove-tag-${tag.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {editingTag === tag.id ? (
                            <Input 
                              value={editTagContent}
                              onChange={e => setEditTagContent(e.target.value)}
                              className="mt-1 text-sm"
                              data-testid={`input-edit-tag-${tag.id}`}
                            />
                          ) : (
                            <p className="text-sm truncate text-muted-foreground mt-1">{tag.content}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Add New Tag */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                <p className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Tag
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Tag Name</Label>
                    <Input 
                      placeholder={seoTagType === "og" ? "og:site_name" : seoTagType === "twitter" ? "twitter:creator" : "robots"}
                      value={newTag.name}
                      onChange={e => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                      data-testid="input-new-tag-name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Content</Label>
                    <Input 
                      placeholder="Tag content value"
                      value={newTag.content}
                      onChange={e => setNewTag(prev => ({ ...prev, content: e.target.value }))}
                      className="mt-1"
                      data-testid="input-new-tag-content"
                    />
                  </div>
                </div>
                <Button 
                  onClick={addSeoTag} 
                  className="mt-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  data-testid="button-add-seo-tag"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Top Pages */}
          <AccordionItem value="pages" className="border rounded-xl bg-white/50 backdrop-blur overflow-hidden" data-testid="accordion-pages">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/30" data-testid="accordion-trigger-pages">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-violet-600" />
                <span className="font-semibold">Top Pages</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {topPages.map((page, i) => (
                  <div key={page.page} className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100" data-testid={`top-page-${i}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {i + 1}
                      </span>
                      <code className="text-sm font-mono text-violet-700">{page.page}</code>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{page.views.toLocaleString()} views</span>
                      <span className="text-muted-foreground">Avg: {page.avgTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Traffic Sources */}
          <AccordionItem value="referrers" className="border rounded-xl bg-white/50 backdrop-blur overflow-hidden" data-testid="accordion-referrers">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/30" data-testid="accordion-trigger-referrers">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-pink-600" />
                <span className="font-semibold">Traffic Sources</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {referrers.map(ref => (
                  <div key={ref.source} className="space-y-1" data-testid={`referrer-${ref.source.toLowerCase()}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{ref.source}</span>
                      <span className="text-muted-foreground">{ref.visits.toLocaleString()} ({ref.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${ref.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Metric Alerts */}
          <AccordionItem value="alerts" className="border rounded-xl bg-white/50 backdrop-blur overflow-hidden" data-testid="accordion-alerts">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/30" data-testid="accordion-trigger-alerts">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-600" />
                <span className="font-semibold">Metric Alerts</span>
                <Badge className="ml-2 bg-red-100 text-red-700 border-red-200 text-xs">{alerts.filter(a => a.enabled).length} active</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {/* Current Alerts */}
              <div className="space-y-2 mb-4">
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No alerts configured</p>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100" data-testid={`alert-${alert.id}`}>
                      <div className="flex items-center gap-3">
                        {alert.enabled ? (
                          <Bell className="h-4 w-4 text-red-500" />
                        ) : (
                          <BellOff className="h-4 w-4 text-gray-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{alert.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.metric} {alert.operator === "gt" ? ">" : "<"} {alert.threshold}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleAlert(alert.id, alert.enabled)}
                          className={alert.enabled ? "text-red-500" : "text-gray-400"}
                          data-testid={`button-toggle-alert-${alert.id}`}
                        >
                          {alert.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteAlert(alert.id)}
                          className="text-red-500 hover:bg-red-50"
                          data-testid={`button-delete-alert-${alert.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Alert */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
                <p className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Alert
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Alert Name</Label>
                    <Input 
                      placeholder="High Bounce Rate"
                      value={newAlert.name}
                      onChange={e => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                      data-testid="input-new-alert-name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Metric</Label>
                    <Select value={newAlert.metric} onValueChange={v => setNewAlert(prev => ({ ...prev, metric: v }))}>
                      <SelectTrigger className="mt-1" data-testid="select-alert-metric">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bounceRate">Bounce Rate</SelectItem>
                        <SelectItem value="conversionRate">Conversion Rate</SelectItem>
                        <SelectItem value="totalOrders">Total Orders</SelectItem>
                        <SelectItem value="avgOrderValue">Avg Order Value</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Condition</Label>
                    <Select value={newAlert.operator} onValueChange={v => setNewAlert(prev => ({ ...prev, operator: v }))}>
                      <SelectTrigger className="mt-1" data-testid="select-alert-operator">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gt">Greater than</SelectItem>
                        <SelectItem value="lt">Less than</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Threshold</Label>
                    <Input 
                      type="number"
                      value={newAlert.threshold}
                      onChange={e => setNewAlert(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                      className="mt-1"
                      data-testid="input-new-alert-threshold"
                    />
                  </div>
                </div>
                <Button 
                  onClick={addAlert} 
                  className="mt-3 bg-gradient-to-r from-red-500 to-orange-600 text-white"
                  data-testid="button-create-alert"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Integration Notice */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Settings2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800">Analytics Integration</p>
              <p className="text-sm text-blue-600 mt-1">
                Connect Google Analytics, Plausible, or Umami for real-time tracking. 
                Traffic data is simulated; business metrics come from real order data.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Partner API Portal Component
function PartnerApiPortal() {
  const { toast } = useToast();
  const [franchises, setFranchises] = useState<Array<{
    id: string;
    franchiseId: string;
    territoryName: string;
    status: string;
    franchiseTier: string;
  }>>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Array<{
    id: string;
    name: string;
    apiKey: string;
    environment: string;
    scopes: string[];
    isActive: boolean;
    requestCount: number;
    lastUsedAt: string | null;
    createdAt: string;
  }>>([]);
  const [apiLogs, setApiLogs] = useState<Array<{
    id: string;
    method: string;
    endpoint: string;
    statusCode: number;
    responseTimeMs: number;
    createdAt: string;
  }>>([]);
  const [locations, setLocations] = useState<Array<{
    id: string;
    name: string;
    locationCode: string;
    city: string;
    state: string;
    isActive: boolean;
  }>>([]);
  const [showNewCredForm, setShowNewCredForm] = useState(false);
  const [newCredName, setNewCredName] = useState("");
  const [newCredEnv, setNewCredEnv] = useState("production");
  const [newCredScopes, setNewCredScopes] = useState<string[]>(["orders:read"]);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const allScopes = [
    "orders:read", "orders:write",
    "menus:read", "menus:write",
    "locations:read", "locations:write",
    "billing:read", "analytics:read",
    "customers:read", "customers:write",
    "drivers:read", "drivers:write"
  ];

  useEffect(() => {
    fetch("/api/franchises?status=active")
      .then(r => r.json())
      .then(data => {
        setFranchises(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedFranchise) return;
    
    Promise.all([
      fetch(`/api/franchises/${selectedFranchise}/credentials`).then(r => r.json()),
      fetch(`/api/franchises/${selectedFranchise}/api-logs?limit=50`).then(r => r.json()),
      fetch(`/api/franchises/${selectedFranchise}/locations`).then(r => r.json()),
    ]).then(([creds, logs, locs]) => {
      setCredentials(Array.isArray(creds) ? creds : []);
      setApiLogs(Array.isArray(logs) ? logs : []);
      setLocations(Array.isArray(locs) ? locs : []);
    }).catch(() => {});
  }, [selectedFranchise]);

  const createCredential = async () => {
    if (!newCredName || !selectedFranchise) return;
    try {
      const res = await fetch(`/api/franchises/${selectedFranchise}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCredName,
          environment: newCredEnv,
          scopes: newCredScopes,
        }),
      });
      const data = await res.json();
      if (data.apiSecret) {
        setNewSecret(data.apiSecret);
        setCredentials(prev => [...prev, { ...data, apiSecret: "••••••••" }]);
        setNewCredName("");
        setShowNewCredForm(false);
        toast({ title: "API Key Created", description: "Save the secret - it won't be shown again!" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to create credential", variant: "destructive" });
    }
  };

  const toggleCredential = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/franchises/${selectedFranchise}/credentials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setCredentials(prev => prev.map(c => c.id === id ? { ...c, isActive: !isActive } : c));
    } catch (e) {
      toast({ title: "Error", description: "Failed to update credential", variant: "destructive" });
    }
  };

  const deleteCredential = async (id: string) => {
    try {
      await fetch(`/api/franchises/${selectedFranchise}/credentials/${id}`, { method: "DELETE" });
      setCredentials(prev => prev.filter(c => c.id !== id));
      toast({ title: "Deleted", description: "API key has been revoked" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete credential", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard` });
  };

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "text-emerald-600 bg-emerald-50";
    if (code >= 400 && code < 500) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Card className="premium-card border-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-blue-500/10" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 10, scale: 1.05 }}
              >
                <Key className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <CardTitle className="font-serif text-2xl gradient-text">Partner API Portal</CardTitle>
                <CardDescription>Franchise integration & API key management</CardDescription>
              </div>
            </div>
          </div>
          <Badge className="bg-purple-500/10 text-purple-700 border-purple-200">
            <Shield className="h-3 w-3 mr-1" /> Secure API
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Franchise Selector */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 border">
          <Label className="text-sm font-medium mb-2 block">Select Franchise</Label>
          <Select value={selectedFranchise || ""} onValueChange={setSelectedFranchise}>
            <SelectTrigger className="w-full" data-testid="select-franchise">
              <SelectValue placeholder="Choose a franchise to manage..." />
            </SelectTrigger>
            <SelectContent>
              {franchises.map(f => (
                <SelectItem key={f.id} value={f.id}>
                  {f.territoryName} ({f.franchiseId}) - {f.franchiseTier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {franchises.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground mt-2">No active franchises found. Create one in the Franchise section.</p>
          )}
        </div>

        {!selectedFranchise && franchises.length > 0 && (
          <div className="p-8 text-center rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 border border-dashed">
            <Key className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Select a Franchise to Manage</h3>
            <p className="text-sm text-muted-foreground">Choose a franchise from the dropdown above to view API keys, manage credentials, and access analytics.</p>
          </div>
        )}

        {selectedFranchise && (
          <>
            {/* Bento Grid - API Stats */}
            <div className="grid grid-cols-4 gap-4">
              <motion.div
                className="col-span-1 p-4 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 hover-3d"
                whileHover={{ scale: 1.02 }}
              >
                <Key className="h-5 w-5 text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-purple-800">{credentials.length}</p>
                <p className="text-xs text-purple-600">API Keys</p>
              </motion.div>
              <motion.div
                className="col-span-1 p-4 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-200 hover-3d"
                whileHover={{ scale: 1.02 }}
              >
                <Activity className="h-5 w-5 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-800">
                  {credentials.reduce((sum, c) => sum + (c.requestCount || 0), 0)}
                </p>
                <p className="text-xs text-blue-600">Total Requests</p>
              </motion.div>
              <motion.div
                className="col-span-1 p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 hover-3d"
                whileHover={{ scale: 1.02 }}
              >
                <MapPin className="h-5 w-5 text-emerald-600 mb-2" />
                <p className="text-2xl font-bold text-emerald-800">{locations.length}</p>
                <p className="text-xs text-emerald-600">Locations</p>
              </motion.div>
              <motion.div
                className="col-span-1 p-4 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 hover-3d"
                whileHover={{ scale: 1.02 }}
              >
                <BarChart3 className="h-5 w-5 text-amber-600 mb-2" />
                <p className="text-2xl font-bold text-amber-800">{apiLogs.length}</p>
                <p className="text-xs text-amber-600">Recent Logs</p>
              </motion.div>
            </div>

            {/* Secret Display Modal */}
            {newSecret && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800">Save Your API Secret Now!</p>
                    <p className="text-sm text-amber-700 mb-2">This secret will not be shown again.</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 rounded bg-white font-mono text-sm break-all" data-testid="text-new-secret">{newSecret}</code>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(newSecret, "API Secret")} data-testid="button-copy-secret">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => setNewSecret(null)}
                      data-testid="button-dismiss-secret"
                    >
                      I've saved it
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <Accordion type="multiple" defaultValue={["credentials", "endpoints"]}>
              {/* API Credentials */}
              <AccordionItem value="credentials">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">API Credentials</span>
                    <Badge variant="outline">{credentials.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {credentials.map(cred => (
                      <div key={cred.id} className="p-4 rounded-xl bg-white border shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{cred.name}</span>
                              <Badge variant={cred.isActive ? "default" : "secondary"} className={cred.isActive ? "bg-emerald-500" : ""}>
                                {cred.isActive ? "Active" : "Disabled"}
                              </Badge>
                              <Badge variant="outline">{cred.environment}</Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <code className="text-xs bg-slate-100 p-1 rounded" data-testid={`text-apikey-${cred.id}`}>{cred.apiKey}</code>
                              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(cred.apiKey, "API Key")} data-testid={`button-copy-apikey-${cred.id}`}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(cred.scopes || []).map(scope => (
                                <Badge key={scope} variant="outline" className="text-xs">{scope}</Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {cred.requestCount} requests | Last used: {cred.lastUsedAt ? new Date(cred.lastUsedAt).toLocaleDateString() : "Never"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleCredential(cred.id, cred.isActive)}
                              data-testid={`toggle-cred-${cred.id}`}
                            >
                              {cred.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteCredential(cred.id)}
                              data-testid={`delete-cred-${cred.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {showNewCredForm ? (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
                        <div className="space-y-3">
                          <div>
                            <Label>Key Name</Label>
                            <Input
                              placeholder="e.g., Production Key"
                              value={newCredName}
                              onChange={e => setNewCredName(e.target.value)}
                              data-testid="input-cred-name"
                            />
                          </div>
                          <div>
                            <Label>Environment</Label>
                            <Select value={newCredEnv} onValueChange={setNewCredEnv}>
                              <SelectTrigger data-testid="select-cred-env">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="production">Production</SelectItem>
                                <SelectItem value="sandbox">Sandbox</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Permissions</Label>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              {allScopes.map(scope => (
                                <label key={scope} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={newCredScopes.includes(scope)}
                                    onChange={e => {
                                      if (e.target.checked) {
                                        setNewCredScopes(prev => [...prev, scope]);
                                      } else {
                                        setNewCredScopes(prev => prev.filter(s => s !== scope));
                                      }
                                    }}
                                  />
                                  {scope}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={createCredential} className="bg-purple-600" data-testid="button-create-cred">
                              <Key className="h-4 w-4 mr-2" /> Create Key
                            </Button>
                            <Button variant="outline" onClick={() => setShowNewCredForm(false)}>Cancel</Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={() => setShowNewCredForm(true)}
                        data-testid="button-new-credential"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Create New API Key
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* API Endpoints Reference */}
              <AccordionItem value="endpoints">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">API Endpoints</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {[
                      { method: "GET", path: "/api/partner/v1/me", desc: "Get current franchise info", scope: "-" },
                      { method: "GET", path: "/api/partner/v1/orders", desc: "List orders", scope: "orders:read" },
                      { method: "POST", path: "/api/partner/v1/orders", desc: "Create order", scope: "orders:write" },
                      { method: "GET", path: "/api/partner/v1/locations", desc: "List locations", scope: "locations:read" },
                      { method: "GET", path: "/api/partner/v1/analytics", desc: "Get analytics", scope: "analytics:read" },
                      { method: "GET", path: "/api/partner/v1/billing", desc: "Get billing info", scope: "billing:read" },
                    ].map((ep, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white border">
                        <Badge className={ep.method === "GET" ? "bg-emerald-500" : "bg-blue-500"}>{ep.method}</Badge>
                        <code className="flex-1 text-sm">{ep.path}</code>
                        <span className="text-sm text-muted-foreground">{ep.desc}</span>
                        <Badge variant="outline" className="text-xs">{ep.scope}</Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100">
                    <p className="text-sm text-slate-400 mb-2">Example Request:</p>
                    <pre className="text-xs overflow-x-auto">
{`curl -X GET "https://yourapp.replit.app/api/partner/v1/orders" \\
  -H "X-API-Key: bb_live_your_api_key_here" \\
  -H "Content-Type: application/json"`}
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Request Logs */}
              <AccordionItem value="logs">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold">Request Logs</span>
                    <Badge variant="outline">{apiLogs.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {apiLogs.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No API requests yet</p>
                      ) : (
                        apiLogs.map(log => (
                          <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-white border text-sm">
                            <Badge className={log.method === "GET" ? "bg-emerald-500" : "bg-blue-500"} variant="secondary">
                              {log.method}
                            </Badge>
                            <code className="flex-1 truncate">{log.endpoint}</code>
                            <Badge className={getStatusColor(log.statusCode)}>{log.statusCode}</Badge>
                            <span className="text-muted-foreground">{log.responseTimeMs}ms</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}

        {/* Quick Start Guide */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-800">Quick Start</p>
              <ol className="text-sm text-indigo-700 mt-2 space-y-1 list-decimal list-inside">
                <li>Select your franchise from the dropdown above</li>
                <li>Create an API key with the scopes you need</li>
                <li>Save your API secret immediately (it's only shown once!)</li>
                <li>Use the X-API-Key header in all API requests</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DevelopersPage() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("javascript");
  const [email, setEmail] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('bb_dev_tasks');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleTask = (taskId: string) => {
    setCheckedTasks(prev => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      localStorage.setItem('bb_dev_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const TaskCheckbox = ({ id, label, isPreChecked = false }: { id: string; label: string; isPreChecked?: boolean }) => {
    const isChecked = isPreChecked || checkedTasks[id];
    return (
      <div 
        className={`flex items-center gap-3 text-sm cursor-pointer group ${isPreChecked ? 'opacity-75' : ''}`}
        onClick={() => !isPreChecked && toggleTask(id)}
        data-testid={`task-${id}`}
      >
        {isChecked ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-gray-400 group-hover:text-amber-500 flex-shrink-0 transition-colors" />
        )}
        <span className={isChecked ? "text-emerald-700 line-through" : "group-hover:text-amber-700 transition-colors"}>
          {label}
        </span>
      </div>
    );
  };
  const [health, setHealth] = useState<SystemHealth>({
    api: 'checking',
    database: 'checking',
    stripe: 'checking',
    coinbase: 'checking',
    lastChecked: null
  });
  const [hallmarkStats, setHallmarkStats] = useState<HallmarkStats | null>(null);
  const [companyHallmarks, setCompanyHallmarks] = useState<CompanyHallmark[]>([]);
  const [hallmarkSearch, setHallmarkSearch] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);
  
  useEffect(() => {
    const devAuth = localStorage.getItem("coffee_dev_auth");
    if (devAuth === "true") {
      setIsAuthenticated(true);
    } else {
      window.location.href = "/";
    }
  }, []);
  
  const fetchHallmarkData = async () => {
    try {
      const [statsRes, hallmarksRes] = await Promise.all([
        fetch('/api/hallmark/stats'),
        fetch('/api/hallmark/company'),
      ]);
      
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setHallmarkStats(stats);
      }
      
      if (hallmarksRes.ok) {
        const hallmarks = await hallmarksRes.json();
        setCompanyHallmarks(hallmarks);
      }
    } catch (error) {
      console.error('Failed to fetch hallmark data:', error);
    }
  };
  
  const seedInitialHallmarks = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/hallmark/seed', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Hallmarks Seeded",
          description: `App: ${data.app?.hallmark?.serialNumber}, Dev: ${data.developer?.hallmark?.serialNumber}`
        });
        fetchHallmarkData();
      }
    } catch (error) {
      toast({ title: "Seeding Failed", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchHallmarkData();
    }
  }, [isAuthenticated]);

  const checkHealth = async () => {
    setIsRefreshing(true);
    const newHealth: SystemHealth = {
      api: 'checking',
      database: 'checking',
      stripe: 'checking',
      coinbase: 'checking',
      lastChecked: new Date()
    };

    try {
      const healthResponse = await fetch('/api/health', { 
        signal: AbortSignal.timeout(5000) 
      });
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        newHealth.api = 'healthy';
        newHealth.database = healthData.database === 'healthy' ? 'healthy' : 'offline';
      } else {
        newHealth.api = 'degraded';
        newHealth.database = 'degraded';
      }
    } catch {
      newHealth.api = 'offline';
      newHealth.database = 'offline';
    }

    try {
      const stripeResponse = await fetch('/api/config/stripe', { 
        signal: AbortSignal.timeout(5000) 
      });
      const stripeData = await stripeResponse.json();
      newHealth.stripe = stripeData.isConfigured ? 'healthy' : 'offline';
    } catch {
      newHealth.stripe = 'offline';
    }

    try {
      const coinbaseResponse = await fetch('/api/config/coinbase', { 
        signal: AbortSignal.timeout(5000) 
      });
      const coinbaseData = await coinbaseResponse.json();
      newHealth.coinbase = coinbaseData.isConfigured ? 'healthy' : 'offline';
    } catch {
      newHealth.coinbase = 'offline';
    }

    setHealth(newHealth);
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const getOverallStatus = (): { status: HealthStatus; message: string } => {
    const allServices = [health.api, health.database, health.stripe, health.coinbase];
    const coreServices = [health.api, health.database];
    const paymentServices = [health.stripe, health.coinbase];
    
    if (allServices.every(s => s === 'checking')) {
      return { status: 'checking', message: 'Checking system status...' };
    }
    
    if (coreServices.some(s => s === 'offline')) {
      return { status: 'offline', message: 'Core services are offline' };
    }
    
    if (coreServices.some(s => s === 'degraded')) {
      return { status: 'degraded', message: 'Core services are degraded' };
    }
    
    if (paymentServices.every(s => s === 'offline')) {
      return { status: 'degraded', message: 'Payment services not configured' };
    }
    
    if (paymentServices.some(s => s === 'offline')) {
      return { status: 'degraded', message: 'Some payment services not configured' };
    }
    
    if (allServices.every(s => s === 'healthy')) {
      return { status: 'healthy', message: 'All systems operational' };
    }
    
    return { status: 'degraded', message: 'Some services need attention' };
  };

  const overallStatus = getOverallStatus();

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
  
  const handleLogout = () => {
    localStorage.removeItem("coffee_dev_auth");
    window.location.href = "/";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Verifying developer access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 luxury-pattern grain-overlay relative mobile-safe-scroll">
      <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-10 mobile-contain mobile-p-safe">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover-3d flex-shrink-0" data-testid="button-back">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-2xl md:text-4xl font-bold flex items-center gap-2 md:gap-3 flex-wrap"
              >
                <div className="p-1.5 md:p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shine-effect flex-shrink-0">
                  <Code2 className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <span className="gradient-text">Developer Hub</span>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="hidden md:block"
                >
                  <Sparkles className="h-6 w-6 text-amber-500" />
                </motion.div>
              </motion.h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">Build amazing integrations with Brew & Board</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Link href="/dashboard">
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg text-sm" data-testid="button-to-main-app">
                <Home className="h-4 w-4" /> <span className="hidden sm:inline">To Main</span> App
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground hover:text-destructive"
              data-testid="button-dev-logout"
            >
              <Lock className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* System Health Dashboard - First Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <Card className="premium-card border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-amber-500/5 to-red-500/5" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                    <Activity className="h-6 w-6 text-amber-600" />
                    System Health
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    Real-time status of all services
                    {health.lastChecked && (
                      <span className="text-xs text-muted-foreground">
                        • Last checked: {health.lastChecked.toLocaleTimeString()}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkHealth}
                  disabled={isRefreshing}
                  className="gap-2"
                  data-testid="button-refresh-health-top"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* API Server */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100" data-testid="health-api-top">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-2">
                    <Wifi className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-sm">API Server</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusLight status={health.api} size="sm" />
                    <StatusBadge status={health.api} />
                  </div>
                </div>
                
                {/* Database */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100" data-testid="health-db-top">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-2">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-sm">Database</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusLight status={health.database} size="sm" />
                    <StatusBadge status={health.database} />
                  </div>
                </div>
                
                {/* Stripe */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100" data-testid="health-stripe-top">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-2">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-sm">Stripe</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusLight status={health.stripe} size="sm" />
                    <StatusBadge status={health.stripe} />
                  </div>
                </div>
                
                {/* Coinbase */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100" data-testid="health-coinbase-top">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-2">
                    <Bitcoin className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-sm">Coinbase</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusLight status={health.coinbase} size="sm" />
                    <StatusBadge status={health.coinbase} />
                  </div>
                </div>
              </div>
              
              {/* Overall Status Summary */}
              <div className={`mt-4 p-3 rounded-xl border ${
                overallStatus.status === 'healthy' 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
                  : overallStatus.status === 'degraded'
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
                    : overallStatus.status === 'offline'
                      ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
              }`}>
                <div className="flex items-center justify-center gap-3">
                  <StatusLight status={overallStatus.status} size="lg" />
                  <span className={`text-sm font-semibold ${
                    overallStatus.status === 'healthy' ? 'text-emerald-700' :
                    overallStatus.status === 'degraded' ? 'text-amber-700' :
                    overallStatus.status === 'offline' ? 'text-red-700' : 'text-gray-700'
                  }`}>
                    {overallStatus.message}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Partner Control Panel - Admin Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-8"
        >
          <Card className="premium-card border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-purple-500/5 to-indigo-500/5" />
            <CardHeader className="relative pb-3">
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <Shield className="h-6 w-6 text-rose-600" />
                Partner Control Panel
              </CardTitle>
              <CardDescription>
                Manage partner access and system live status
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Emergency Kill Switch */}
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-rose-600" />
                      <span className="font-semibold text-rose-800">Emergency Kill Switch</span>
                    </div>
                  </div>
                  <p className="text-sm text-rose-600 mb-3">
                    Instantly disable all partner access. Partners will see "Access Disabled" when trying to log in.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={async () => {
                      try {
                        const currentSetting = await fetch('/api/system/settings/partner_access_enabled').then(r => r.json());
                        const newValue = currentSetting?.value === 'false' ? 'true' : 'false';
                        await fetch('/api/system/settings/partner_access_enabled', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ value: newValue, updatedBy: 'Developer Admin' })
                        });
                        toast({
                          title: newValue === 'true' ? 'Partner Access Enabled' : 'Partner Access DISABLED',
                          description: newValue === 'true' 
                            ? 'Partners can now log in.' 
                            : 'All partners are now locked out.',
                        });
                      } catch (e) {
                        toast({ title: 'Error', description: 'Failed to toggle partner access', variant: 'destructive' });
                      }
                    }}
                    data-testid="button-kill-switch"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Toggle Partner Access
                  </Button>
                </div>
                
                {/* System Live Mode */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-800">System Live Status</span>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-600 mb-3">
                    When OFF, partners browse in Preview Mode (data not saved). Turn ON to enable full functionality.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-emerald-500 text-emerald-700 hover:bg-emerald-100"
                    onClick={async () => {
                      try {
                        const currentSetting = await fetch('/api/system/settings/system_live').then(r => r.json());
                        const newValue = currentSetting?.value === 'true' ? 'false' : 'true';
                        await fetch('/api/system/settings/system_live', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ value: newValue, updatedBy: 'Developer Admin' })
                        });
                        toast({
                          title: newValue === 'true' ? 'System is NOW LIVE' : 'System set to Preview Mode',
                          description: newValue === 'true' 
                            ? 'Partners can now save data and place real orders.' 
                            : 'Partners are in browse-only preview mode.',
                        });
                      } catch (e) {
                        toast({ title: 'Error', description: 'Failed to toggle system status', variant: 'destructive' });
                      }
                    }}
                    data-testid="button-system-live"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Toggle Live Mode
                  </Button>
                </div>
              </div>
              
              {/* Partner Accounts */}
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold text-amber-800">Partner Accounts</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-white rounded-lg border border-amber-200">
                    <p className="font-medium">Sarah</p>
                    <p className="text-muted-foreground text-xs">Initial PIN: 5555</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-amber-200">
                    <p className="font-medium">Sid</p>
                    <p className="text-muted-foreground text-xs">Initial PIN: 444</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/partners/seed', { method: 'POST' });
                      const data = await res.json();
                      toast({
                        title: 'Partner Accounts Ready',
                        description: data.message,
                      });
                    } catch (e) {
                      toast({ title: 'Error', description: 'Failed to seed partners', variant: 'destructive' });
                    }
                  }}
                  data-testid="button-seed-partners"
                >
                  Initialize Partner Accounts
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Access Credentials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-8"
        >
          <Card className="premium-card border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <CardTitle className="flex items-center gap-2 font-serif text-xl">
                <Key className="h-5 w-5 text-amber-400" />
                System Access Credentials
                <Badge className="bg-red-500/20 text-red-300 border-red-400/30 ml-2">Admin Only</Badge>
              </CardTitle>
              <CardDescription className="text-slate-300">
                Initial login PINs for onboarding team members
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Code2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-800">Developer</p>
                      <p className="text-xs text-purple-600">Full system access</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white/70 rounded-lg p-3 border border-purple-100">
                    <span className="text-sm text-muted-foreground">Initial PIN:</span>
                    <code className="font-mono text-lg font-bold text-purple-700 tracking-widest">0424</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Access: Developer Hub, Admin Portal</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-800">Partner (Sid)</p>
                      <p className="text-xs text-amber-600">Full read access + team view</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white/70 rounded-lg p-3 border border-amber-100">
                    <span className="text-sm text-muted-foreground">Initial PIN:</span>
                    <code className="font-mono text-lg font-bold text-amber-700 tracking-widest">444</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Access: Partner Hub (/partner)</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-pink-800">Partner (Sarah)</p>
                      <p className="text-xs text-pink-600">Full read access + team view</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white/70 rounded-lg p-3 border border-pink-100">
                    <span className="text-sm text-muted-foreground">Initial PIN:</span>
                    <code className="font-mono text-lg font-bold text-pink-700 tracking-widest">5555</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Access: Partner Hub (/partner)</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800">Regional Manager</p>
                      <p className="text-xs text-blue-600">Territory view only</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white/70 rounded-lg p-3 border border-blue-100">
                    <span className="text-sm text-muted-foreground">Initial PIN:</span>
                    <code className="font-mono text-lg font-bold text-blue-700 tracking-widest">7777</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Access: Regional Portal (/regional)</p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Security Note</p>
                    <p className="text-amber-700">Users are required to change their PIN on first login. Initial PINs are for onboarding only.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Version Tracking Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
          className="mb-8"
        >
          <VersionTrackingPanel />
        </motion.div>

        {/* Release Manager - DevOps and Release Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.095 }}
          className="mb-8"
        >
          <ReleaseManagerPanel />
        </motion.div>

        {/* Analytics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.097 }}
          className="mb-8"
        >
          <AnalyticsPanel />
        </motion.div>

        {/* Partner API Portal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.098 }}
          className="mb-8"
        >
          <PartnerApiPortal />
        </motion.div>

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
                    Be the first to integrate Brew & Board into your business systems. 
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

        <div className="bento-grid mb-12">
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
              className="bento-span-3"
            >
              <Card className="premium-card hover-3d cursor-pointer group border-0 h-full gold-shimmer">
                <CardContent className="p-6 text-center">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
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

        {/* Blockchain Hallmark Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mb-12"
        >
          <Card className="premium-card border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-purple-500/5" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    Blockchain Hallmarks
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    Solana-verified document authenticity system
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
                      {hallmarkStats?.blockchain?.configured ? 'Connected' : 'Configuring'}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchHallmarkData}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  {companyHallmarks.length === 0 && (
                    <Button
                      size="sm"
                      onClick={seedInitialHallmarks}
                      disabled={isSeeding}
                      className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      {isSeeding ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Seed Initial Hallmarks
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              {/* Blockchain Stats Grid */}
              <div className="bento-grid mb-6">
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bento-span-3 p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <Coffee className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Company</span>
                  </div>
                  <p className="text-2xl font-bold">{hallmarkStats?.totalCompanyHallmarks || 0}</p>
                  <p className="text-xs text-muted-foreground">Official hallmarks</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bento-span-3 p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                      <Hash className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Subscriber</span>
                  </div>
                  <p className="text-2xl font-bold">{hallmarkStats?.totalUserHallmarks || 0}</p>
                  <p className="text-xs text-muted-foreground">User hallmarks</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bento-span-3 p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Verifications</span>
                  </div>
                  <p className="text-2xl font-bold">{hallmarkStats?.totalVerifications || 0}</p>
                  <p className="text-xs text-muted-foreground">Total lookups</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bento-span-3 p-4 rounded-xl bg-white/50 backdrop-blur border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <FileCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Profiles</span>
                  </div>
                  <p className="text-2xl font-bold">{hallmarkStats?.activeProfiles || 0}</p>
                  <p className="text-xs text-muted-foreground">Minted prefixes</p>
                </motion.div>
              </div>

              {/* Solana Network Info */}
              {hallmarkStats?.blockchain && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 mb-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <StatusLight status={hallmarkStats.blockchain.configured ? "healthy" : "offline"} size="lg" />
                      <div>
                        <p className="font-semibold text-emerald-700">Solana {hallmarkStats.blockchain.network}</p>
                        <p className="text-xs text-emerald-600">
                          Slot: {hallmarkStats.blockchain.currentSlot?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs">
                      <div className="text-right">
                        <p className="text-muted-foreground">Wallet Balance</p>
                        <p className="font-mono font-semibold">{hallmarkStats.blockchain.walletBalance?.toFixed(4) || '0'} SOL</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Cost per Hallmark</p>
                        <p className="font-mono font-semibold">~$0.00025</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Company Hallmarks List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Company Hallmarks (BB-000...)
                  </h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search hallmarks..."
                      value={hallmarkSearch}
                      onChange={(e) => setHallmarkSearch(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
                
                {companyHallmarks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No company hallmarks issued yet</p>
                    <p className="text-xs">Click "Seed Initial Hallmarks" to create BB-0000000001 and BB-0000000002</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {companyHallmarks
                        .filter(h => 
                          h.serialNumber.toLowerCase().includes(hallmarkSearch.toLowerCase()) ||
                          h.assetName?.toLowerCase().includes(hallmarkSearch.toLowerCase())
                        )
                        .map((hallmark) => (
                          <div
                            key={hallmark.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-gray-100 hover:border-emerald-200 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <Shield className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <code className="font-mono text-sm font-semibold text-emerald-700">
                                  {hallmark.serialNumber}
                                </code>
                                <p className="text-xs text-muted-foreground">{hallmark.assetName || 'Untitled'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-xs">
                                <p className="text-muted-foreground">{hallmark.verificationCount} views</p>
                                <p className="text-muted-foreground">{new Date(hallmark.issuedAt).toLocaleDateString()}</p>
                              </div>
                              {hallmark.solanaTxSignature && (
                                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  On-Chain
                                </Badge>
                              )}
                              <Link href={`/verify/${hallmark.serialNumber}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <QrCode className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                <Link href="/my-hallmarks">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Hash className="h-4 w-4" />
                    My Hallmarks
                  </Button>
                </Link>
                <Link href="/verify">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Search className="h-4 w-4" />
                    Verify Hallmark
                  </Button>
                </Link>
                <Link href="/blockchain-tutorial">
                  <Button variant="outline" size="sm" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Tutorial
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Digital Business Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.29 }}
          className="mb-12"
        >
          <Card className="premium-card border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 via-amber-500/5 to-orange-500/5" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900">
                  <Coffee className="h-5 w-5 text-amber-500" />
                </div>
                Digital Business Card
              </CardTitle>
              <CardDescription>
                Your blockchain-verified business identity. Export as PDF or share digitally.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <BusinessCardPreview />
                <div className="flex-1 space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                    <h4 className="font-semibold text-emerald-700 flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      Blockchain Verified
                    </h4>
                    <p className="text-sm text-emerald-600">
                      Your business card includes a verifiable hallmark that links to your on-chain identity. 
                      Recipients can scan the QR code to verify your credentials.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-white/50 border border-gray-100">
                      <p className="font-medium">PDF Export</p>
                      <p className="text-xs text-muted-foreground">Standard 3.5" x 2" format</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/50 border border-gray-100">
                      <p className="font-medium">Digital Share</p>
                      <p className="text-xs text-muted-foreground">Native sharing or clipboard</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Professional Document Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.295 }}
          className="mb-12"
        >
          <DocumentExportPanel 
            hallmarkCode={companyHallmarks.length > 0 ? companyHallmarks[0]?.serialNumber : undefined} 
          />
        </motion.div>

        {/* App Ecosystem Hub */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.297 }}
          className="mb-12"
        >
          <AppEcosystemHub />
        </motion.div>

        {/* Snippet Library Browser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2975 }}
          className="mb-12"
        >
          <SnippetBrowser />
        </motion.div>

        {/* Darkwave Dev Hub Browser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.298 }}
          className="mb-12"
        >
          <DarkwaveHubBrowser />
        </motion.div>

        {/* Service Area Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.299 }}
          className="mb-12"
        >
          <ServiceAreaConfig />
        </motion.div>

        {/* Franchise Administration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2995 }}
          className="mb-12"
        >
          <FranchiseAdminPanel />
        </motion.div>

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
          transition={{ delay: 0.45 }}
          className="mb-12"
        >
          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <Truck className="h-6 w-6 text-amber-600" />
                Integration Roadmap
              </CardTitle>
              <CardDescription>
                Upcoming third-party API integrations for automated fulfillment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-4">
                <AccordionItem value="doordash" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-doordash">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                        <Truck className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">DoorDash Drive API</span>
                          <Badge className="bg-red-100 text-red-700 border-red-200">Next Up</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Automated delivery dispatch for orders - Priority #1</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <TaskCheckbox id="doordash-register" label="Register for DoorDash Drive developer account" />
                      <TaskCheckbox id="doordash-credentials" label="Obtain API credentials (sandbox + production)" />
                      <TaskCheckbox id="doordash-quote" label="Implement delivery quote endpoint" />
                      <TaskCheckbox id="doordash-dispatch" label="Create delivery dispatch on order confirmation" />
                      <TaskCheckbox id="doordash-webhook" label="Webhook integration for real-time tracking" />
                      <TaskCheckbox id="doordash-eta" label="Driver ETA and status updates to customer" />
                      <a href="https://developer.doordash.com/en-US/docs/drive/reference/drive-api" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm mt-2">
                        View Documentation <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ubereats" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-ubereats">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <Car className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Uber Direct API</span>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">Priority #2</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">White-label delivery service - Backup to DoorDash</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <TaskCheckbox id="uber-apply" label="Apply for Uber Direct API access" />
                      <TaskCheckbox id="uber-oauth" label="Set up OAuth2 authentication flow" />
                      <TaskCheckbox id="uber-quote" label="Implement delivery quote and creation" />
                      <TaskCheckbox id="uber-tracking" label="Real-time delivery tracking integration" />
                      <TaskCheckbox id="uber-proof" label="Proof of delivery handling" />
                      <a href="https://developer.uber.com/docs/deliveries/overview" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm mt-2">
                        View Documentation <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="stripe" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-stripe">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Stripe Payments</span>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Live</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Secure payment processing & subscriptions - Fully Implemented</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-700">Stripe account connected</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-700">Checkout session for orders</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-700">Subscription management for tiers (Starter, Pro, Enterprise)</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-700">Webhook endpoints implemented</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Invoice generation for business clients</span>
                      </div>
                      <a href="https://stripe.com/docs/api" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm mt-2">
                        View Documentation <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="stripe-tax" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-stripe-tax">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Percent className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Stripe Tax</span>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">Code Ready</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Automatic sales tax calculation - Requires dashboard setup</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 mb-4">
                        <strong>Code is ready!</strong> The app has <code className="bg-amber-100 px-1 rounded">automatic_tax: {'{'}enabled: true{'}'}</code> on all checkout sessions. Complete the steps below in your Stripe Dashboard to activate.
                      </div>
                      <TaskCheckbox id="stripe-tax-enable" label="Go to Stripe Dashboard → Settings → Tax → Enable Stripe Tax" />
                      <TaskCheckbox id="stripe-tax-origin" label="Add your business origin address (Nashville, TN)" />
                      <TaskCheckbox id="stripe-tax-register" label="Register with Tennessee Dept of Revenue for sales tax collection" />
                      <TaskCheckbox id="stripe-tax-add-reg" label="Add TN tax registration to Stripe (Dashboard → Tax → Registrations)" />
                      <TaskCheckbox id="stripe-tax-test" label="Test checkout in sandbox to verify tax is calculated" />
                      <TaskCheckbox id="stripe-tax-live" label="Switch to production and verify live transactions" />
                      <div className="flex flex-wrap gap-2 mt-4">
                        <a href="https://dashboard.stripe.com/settings/tax" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm">
                          Stripe Tax Settings <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="text-gray-300">|</span>
                        <a href="https://docs.stripe.com/tax/set-up" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm">
                          Setup Guide <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="text-gray-300">|</span>
                        <a href="https://docs.stripe.com/tax/registering" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm">
                          Tax Registration Guide <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Pricing: ~0.5% per transaction after adding first registration. Stripe handles rate updates automatically.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="google-calendar" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-google-calendar">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Google Calendar</span>
                          <Badge className="bg-green-100 text-green-700 border-green-200">Available</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Sync orders with meeting schedules</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Enable Google Calendar integration via Replit</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>OAuth consent for calendar access</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Create calendar events for scheduled orders</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Smart suggestions based on meeting times</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Automatic reminders for coffee orders</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="twilio" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-twilio">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Twilio SMS</span>
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Waiting on EIN</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">SMS notifications for order updates - Pending business registration</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Set up Twilio account and phone number</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Order confirmation SMS to customers</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Delivery status text updates</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>"Coffee is on the way" notifications</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="maps" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-maps">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Google Maps</span>
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200">Future</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Address autocomplete & delivery tracking</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Enable Places API for address autocomplete</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Distance matrix for delivery estimates</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Live map tracking for deliveries</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Vendor location display on map</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mobile-app" className="border rounded-xl bg-white/50 backdrop-blur px-4">
                  <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-mobile-app">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">Mobile App (iOS/Android)</span>
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">Coming Soon</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Native mobile experience for on-the-go ordering</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>React Native or Flutter framework selection</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Push notifications for order updates</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Biometric authentication (Face ID/Touch ID)</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Offline mode with sync</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>Apple Pay / Google Pay integration</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span>App Store & Play Store submission</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* 1099 Compliance Portal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46 }}
          className="mb-12"
        >
          <Compliance1099Portal />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
                Business Intelligence
              </CardTitle>
              <CardDescription>
                Valuation tracking, milestones, and growth metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">Current Stage</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700">MVP</p>
                  <p className="text-sm text-emerald-600">Pre-Revenue</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Est. Valuation</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">$500K - $2M</p>
                  <p className="text-sm text-blue-600">MVP Stage</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">Market Size</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">$60B</p>
                  <p className="text-sm text-purple-600">Corporate Catering</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-amber-800">Growth Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-700">50%</p>
                  <p className="text-sm text-amber-600">Faster than industry</p>
                </div>
              </div>

              <div className="border rounded-xl bg-white/50 backdrop-blur p-4">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-indigo-600" />
                  Valuation Scenarios
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-semibold">Stage</th>
                        <th className="text-left py-2 px-3 font-semibold">ARR Target</th>
                        <th className="text-left py-2 px-3 font-semibold">Multiple</th>
                        <th className="text-left py-2 px-3 font-semibold">Valuation</th>
                        <th className="text-left py-2 px-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-emerald-50/50">
                        <td className="py-2 px-3 font-medium">MVP (Current)</td>
                        <td className="py-2 px-3">Pre-Revenue</td>
                        <td className="py-2 px-3">-</td>
                        <td className="py-2 px-3 font-semibold text-emerald-700">$500K - $2M</td>
                        <td className="py-2 px-3"><Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 font-medium">Seed</td>
                        <td className="py-2 px-3">$100K</td>
                        <td className="py-2 px-3">4-6x</td>
                        <td className="py-2 px-3 font-semibold">$1.5M - $3M</td>
                        <td className="py-2 px-3"><Badge variant="outline">Target</Badge></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 font-medium">Series A</td>
                        <td className="py-2 px-3">$500K</td>
                        <td className="py-2 px-3">5-7x</td>
                        <td className="py-2 px-3 font-semibold">$5M - $10M</td>
                        <td className="py-2 px-3"><Badge variant="outline">Milestone</Badge></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 font-medium">Growth</td>
                        <td className="py-2 px-3">$3M</td>
                        <td className="py-2 px-3">6-10x</td>
                        <td className="py-2 px-3 font-semibold">$18M - $30M</td>
                        <td className="py-2 px-3"><Badge variant="outline">Vision</Badge></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Scale (ezCater)</td>
                        <td className="py-2 px-3">$50M+</td>
                        <td className="py-2 px-3">10x+</td>
                        <td className="py-2 px-3 font-semibold">$500M+</td>
                        <td className="py-2 px-3"><Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Aspirational</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border rounded-xl bg-white/50 backdrop-blur p-4">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  Premium Value Drivers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium">Blockchain Verification</p>
                      <p className="text-xs text-muted-foreground">+10-15% valuation premium</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium">B2B Focus (Less Competition)</p>
                      <p className="text-xs text-muted-foreground">+15-20% vs consumer delivery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium">Virtual Host Multi-Location</p>
                      <p className="text-xs text-muted-foreground">+10% unique capability</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium">Hybrid Revenue Model</p>
                      <p className="text-xs text-muted-foreground">Subscriptions + transactions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium">White-Label Franchise Model</p>
                      <p className="text-xs text-muted-foreground">Scalability multiplier</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium">Nashville Geo-Focus</p>
                      <p className="text-xs text-muted-foreground">Proven unit economics path</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl bg-white/50 backdrop-blur p-4">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Revenue Model (Subscription Tiers)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-semibold">Tier</th>
                        <th className="text-left py-2 px-3 font-semibold">Price</th>
                        <th className="text-left py-2 px-3 font-semibold">100 Subs</th>
                        <th className="text-left py-2 px-3 font-semibold">500 Subs</th>
                        <th className="text-left py-2 px-3 font-semibold">1000 Subs</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-3 font-medium">Starter</td>
                        <td className="py-2 px-3">$29/mo</td>
                        <td className="py-2 px-3">$34.8K/yr</td>
                        <td className="py-2 px-3">$174K/yr</td>
                        <td className="py-2 px-3 font-semibold text-emerald-600">$348K/yr</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 font-medium">Professional</td>
                        <td className="py-2 px-3">$79/mo</td>
                        <td className="py-2 px-3">$94.8K/yr</td>
                        <td className="py-2 px-3">$474K/yr</td>
                        <td className="py-2 px-3 font-semibold text-emerald-600">$948K/yr</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Enterprise</td>
                        <td className="py-2 px-3">$199/mo</td>
                        <td className="py-2 px-3">$238.8K/yr</td>
                        <td className="py-2 px-3">$1.19M/yr</td>
                        <td className="py-2 px-3 font-semibold text-emerald-600">$2.39M/yr</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Plus: 15% service fees on one-off orders, hallmark minting fees ($4.99), franchise licensing fees</p>
              </div>

              <div className="border rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Key Metrics to Track
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Monthly Active Users</p>
                    <p className="text-xl font-bold text-indigo-700">--</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">MRR</p>
                    <p className="text-xl font-bold text-indigo-700">$0</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Orders/Month</p>
                    <p className="text-xl font-bold text-indigo-700">--</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Churn Rate</p>
                    <p className="text-xl font-bold text-indigo-700">--</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">Target: NRR &gt;110%, Churn &lt;6%, Rule of 40 (Growth % + Profit % &ge; 40)</p>
              </div>

              <div className="border rounded-xl bg-white/50 backdrop-blur p-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Comparable: ezCater (Market Leader)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Valuation</p>
                    <p className="font-bold text-lg">$1.6B</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Funding</p>
                    <p className="font-bold text-lg">$425M+</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Restaurant Network</p>
                    <p className="font-bold text-lg">82,000+</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Founded</p>
                    <p className="font-bold text-lg">2007</p>
                  </div>
                </div>
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
