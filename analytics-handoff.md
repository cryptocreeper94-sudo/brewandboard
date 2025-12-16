# ANALYTICS DASHBOARD - COMPLETE AGENT HANDOFF

## OVERVIEW
This document contains everything needed to implement a full Analytics Dashboard with:
- Real-time business metrics from order database
- SEO tag management (CRUD with file persistence)
- Metric alerts with thresholds
- Date range presets (7 days, 30 days, quarter, year)
- Region filtering
- CSV/PDF export functionality
- Darkwave Dev Hub Browser UI for searching shared snippets

**To retrieve this document programmatically:**
```
GET /api/ecosystem/snippets/by-name/analytics.md
GET /api/ecosystem/snippets?name=analytics
```

---

## SECTION 1: API ROUTES (server/routes.ts)

Add these routes to your Express server:

```typescript
// ========================
// ANALYTICS ROUTES
// ========================

// Get business analytics from real order data
app.get("/api/analytics/business", async (req, res) => {
  try {
    const { range = "week", regionId, subscriptionTier } = req.query;
    
    // Get real order data from database
    const allOrders = await storage.getAllScheduledOrders();
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Filter orders by date range and optional region
    const filteredOrders = allOrders.filter(order => {
      const orderDate = new Date(order.scheduledDate);
      const inRange = orderDate >= startDate && orderDate <= now;
      const matchesRegion = !regionId || order.regionId === regionId;
      return inRange && matchesRegion;
    });
    
    // Calculate metrics
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
    const completedOrders = filteredOrders.filter(o => o.status === "delivered").length;
    const conversionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Group by vendor
    const byVendor = filteredOrders.reduce((acc, o) => {
      const vendor = o.vendorName || "Unknown";
      if (!acc[vendor]) acc[vendor] = { orders: 0, revenue: 0 };
      acc[vendor].orders++;
      acc[vendor].revenue += parseFloat(o.total || "0");
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);
    
    const topVendors = Object.entries(byVendor)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    res.json({
      range,
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      completedOrders,
      conversionRate,
      avgOrderValue: avgOrderValue.toFixed(2),
      topVendors,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get regions for filtering
app.get("/api/analytics/regions", async (req, res) => {
  try {
    const regions = await storage.getRegions();
    res.json(regions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SEO Tags CRUD
app.get("/api/seo/tags", async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const seoPath = path.resolve(process.cwd(), 'seo-tags.json');
    
    if (fs.existsSync(seoPath)) {
      const tags = JSON.parse(fs.readFileSync(seoPath, 'utf-8'));
      return res.json(tags);
    }
    
    // Default tags - customize for your app
    res.json([
      { id: "1", type: "og", name: "og:title", content: "Your App Title" },
      { id: "2", type: "og", name: "og:description", content: "Your app description" },
      { id: "3", type: "twitter", name: "twitter:card", content: "summary_large_image" },
      { id: "4", type: "meta", name: "description", content: "Your meta description" },
    ]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/seo/tags", async (req, res) => {
  try {
    const { type, name, content } = req.body;
    if (!type || !name || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const fs = await import('fs');
    const path = await import('path');
    const seoPath = path.resolve(process.cwd(), 'seo-tags.json');
    
    let tags = [];
    if (fs.existsSync(seoPath)) {
      tags = JSON.parse(fs.readFileSync(seoPath, 'utf-8'));
    }
    
    const newTag = { id: String(Date.now()), type, name, content };
    tags.push(newTag);
    
    fs.writeFileSync(seoPath, JSON.stringify(tags, null, 2));
    res.json(newTag);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/seo/tags/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content } = req.body;
    
    const fs = await import('fs');
    const path = await import('path');
    const seoPath = path.resolve(process.cwd(), 'seo-tags.json');
    
    if (!fs.existsSync(seoPath)) {
      return res.status(404).json({ error: "No tags found" });
    }
    
    const tags = JSON.parse(fs.readFileSync(seoPath, 'utf-8'));
    const tagIndex = tags.findIndex((t: any) => t.id === id);
    
    if (tagIndex === -1) {
      return res.status(404).json({ error: "Tag not found" });
    }
    
    if (name) tags[tagIndex].name = name;
    if (content) tags[tagIndex].content = content;
    
    fs.writeFileSync(seoPath, JSON.stringify(tags, null, 2));
    res.json(tags[tagIndex]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/seo/tags/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const fs = await import('fs');
    const path = await import('path');
    const seoPath = path.resolve(process.cwd(), 'seo-tags.json');
    
    if (!fs.existsSync(seoPath)) {
      return res.status(404).json({ error: "No tags found" });
    }
    
    let tags = JSON.parse(fs.readFileSync(seoPath, 'utf-8'));
    tags = tags.filter((t: any) => t.id !== id);
    
    fs.writeFileSync(seoPath, JSON.stringify(tags, null, 2));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics Alerts CRUD
app.get("/api/analytics/alerts", async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const alertsPath = path.resolve(process.cwd(), 'analytics-alerts.json');
    
    if (fs.existsSync(alertsPath)) {
      const alerts = JSON.parse(fs.readFileSync(alertsPath, 'utf-8'));
      return res.json(alerts);
    }
    
    res.json([]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/analytics/alerts", async (req, res) => {
  try {
    const { metric, operator, threshold, enabled, name } = req.body;
    
    const fs = await import('fs');
    const path = await import('path');
    const alertsPath = path.resolve(process.cwd(), 'analytics-alerts.json');
    
    let alerts = [];
    if (fs.existsSync(alertsPath)) {
      alerts = JSON.parse(fs.readFileSync(alertsPath, 'utf-8'));
    }
    
    const newAlert = { id: String(Date.now()), metric, operator, threshold, enabled: enabled ?? true, name };
    alerts.push(newAlert);
    
    fs.writeFileSync(alertsPath, JSON.stringify(alerts, null, 2));
    res.json(newAlert);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/analytics/alerts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fs = await import('fs');
    const path = await import('path');
    const alertsPath = path.resolve(process.cwd(), 'analytics-alerts.json');
    
    if (!fs.existsSync(alertsPath)) {
      return res.status(404).json({ error: "No alerts found" });
    }
    
    const alerts = JSON.parse(fs.readFileSync(alertsPath, 'utf-8'));
    const alertIndex = alerts.findIndex((a: any) => a.id === id);
    
    if (alertIndex === -1) {
      return res.status(404).json({ error: "Alert not found" });
    }
    
    alerts[alertIndex] = { ...alerts[alertIndex], ...updates };
    
    fs.writeFileSync(alertsPath, JSON.stringify(alerts, null, 2));
    res.json(alerts[alertIndex]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/analytics/alerts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const fs = await import('fs');
    const path = await import('path');
    const alertsPath = path.resolve(process.cwd(), 'analytics-alerts.json');
    
    if (!fs.existsSync(alertsPath)) {
      return res.status(404).json({ error: "No alerts found" });
    }
    
    let alerts = JSON.parse(fs.readFileSync(alertsPath, 'utf-8'));
    alerts = alerts.filter((a: any) => a.id !== id);
    
    fs.writeFileSync(alertsPath, JSON.stringify(alerts, null, 2));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export analytics as CSV
app.get("/api/analytics/export/csv", async (req, res) => {
  try {
    const { range = "week" } = req.query;
    const allOrders = await storage.getAllScheduledOrders();
    
    const headers = ["Order ID", "Vendor", "Total", "Status", "Date", "Region"];
    const rows = allOrders.map(o => [
      o.id,
      o.vendorName || "Unknown",
      o.total,
      o.status,
      o.scheduledDate,
      o.regionId || "N/A"
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=analytics-${range}-${Date.now()}.csv`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## SECTION 2: FRONTEND COMPONENT (React + TypeScript)

Required imports:
```typescript
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, Activity, Download, FileText, Users, Eye, MousePointer, Clock,
  LineChart, Tags, Globe, PieChart, Bell, BellOff, Plus, Trash2, Save, Edit3,
  ArrowUpRight, ArrowDownRight, ShoppingCart
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
```

Complete AnalyticsPanel Component:
```typescript
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

  // Fetch data on mount
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

  // Demo traffic data (replace with your analytics provider)
  const weeklyData = [
    { name: "Mon", visitors: 245, pageViews: 892, bounceRate: 42 },
    { name: "Tue", visitors: 312, pageViews: 1045, bounceRate: 38 },
    { name: "Wed", visitors: 278, pageViews: 956, bounceRate: 45 },
    { name: "Thu", visitors: 389, pageViews: 1234, bounceRate: 35 },
    { name: "Fri", visitors: 425, pageViews: 1456, bounceRate: 32 },
    { name: "Sat", visitors: 198, pageViews: 567, bounceRate: 48 },
    { name: "Sun", visitors: 156, pageViews: 423, bounceRate: 52 },
  ];

  const currentData = weeklyData;
  const totalVisitors = currentData.reduce((sum, d) => sum + d.visitors, 0);
  const totalPageViews = currentData.reduce((sum, d) => sum + d.pageViews, 0);
  const avgBounceRate = Math.round(currentData.reduce((sum, d) => sum + d.bounceRate, 0) / currentData.length);

  // CRUD functions
  const addSeoTag = async () => {
    if (!newTag.name || !newTag.content) return;
    const res = await fetch("/api/seo/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: seoTagType, name: newTag.name, content: newTag.content })
    });
    const tag = await res.json();
    setSeoTags(prev => [...prev, tag]);
    setNewTag({ name: "", content: "" });
  };

  const updateSeoTag = async (id: string) => {
    await fetch(`/api/seo/tags/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editTagContent })
    });
    setSeoTags(prev => prev.map(t => t.id === id ? { ...t, content: editTagContent } : t));
    setEditingTag(null);
  };

  const removeSeoTag = async (id: string) => {
    await fetch(`/api/seo/tags/${id}`, { method: "DELETE" });
    setSeoTags(prev => prev.filter(t => t.id !== id));
  };

  const addAlert = async () => {
    if (!newAlert.name) return;
    const res = await fetch("/api/analytics/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAlert)
    });
    const alert = await res.json();
    setAlerts(prev => [...prev, alert]);
    setNewAlert({ metric: "bounceRate", operator: "gt", threshold: 50, name: "" });
  };

  const toggleAlert = async (id: string, enabled: boolean) => {
    await fetch(`/api/analytics/alerts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled })
    });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !enabled } : a));
  };

  const deleteAlert = async (id: string) => {
    await fetch(`/api/analytics/alerts/${id}`, { method: "DELETE" });
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const exportCSV = async () => {
    setIsExporting(true);
    const response = await fetch(`/api/analytics/export/csv?range=${timeRange}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${timeRange}-${Date.now()}.csv`;
    a.click();
    setIsExporting(false);
  };

  const exportPDF = async () => {
    setIsExporting(true);
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Analytics Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Date Range: ${timeRange}`, 20, 35);
    doc.text(`Total Visitors: ${totalVisitors}`, 20, 50);
    doc.text(`Total Page Views: ${totalPageViews}`, 20, 60);
    if (businessMetrics) {
      doc.text(`Total Orders: ${businessMetrics.totalOrders}`, 20, 75);
      doc.text(`Revenue: $${businessMetrics.totalRevenue}`, 20, 85);
    }
    doc.save(`analytics-${timeRange}.pdf`);
    setIsExporting(false);
  };

  const filteredTags = seoTags.filter(t => t.type === seoTagType);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>Track visitors, SEO, and business metrics</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={isExporting}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportPDF} disabled={isExporting}>
              <FileText className="h-4 w-4 mr-1" /> PDF
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          {regions.length > 0 && (
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All Regions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Business Metrics from Real Data */}
        {businessMetrics && (
          <div className="p-4 rounded-lg bg-amber-50 border mb-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{businessMetrics.totalOrders}</p>
                <p className="text-xs">Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold">${businessMetrics.totalRevenue}</p>
                <p className="text-xs">Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{businessMetrics.conversionRate}%</p>
                <p className="text-xs">Conversion</p>
              </div>
              <div>
                <p className="text-2xl font-bold">${businessMetrics.avgOrderValue}</p>
                <p className="text-xs">Avg Order</p>
              </div>
            </div>
          </div>
        )}

        {/* Traffic Metrics Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-cyan-50 border">
            <Users className="h-4 w-4 text-cyan-600" />
            <p className="text-2xl font-bold">{totalVisitors}</p>
            <p className="text-xs">Unique Visitors</p>
          </div>
          <div className="p-4 rounded-lg bg-indigo-50 border">
            <Eye className="h-4 w-4 text-indigo-600" />
            <p className="text-2xl font-bold">{totalPageViews}</p>
            <p className="text-xs">Page Views</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border">
            <MousePointer className="h-4 w-4 text-amber-600" />
            <p className="text-2xl font-bold">{avgBounceRate}%</p>
            <p className="text-xs">Bounce Rate</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 border">
            <Clock className="h-4 w-4 text-emerald-600" />
            <p className="text-2xl font-bold">3:24</p>
            <p className="text-xs">Avg Session</p>
          </div>
        </div>

        {/* Accordion sections for SEO, Alerts, Charts */}
        <Accordion type="multiple" defaultValue={["seo", "alerts"]}>
          {/* SEO Tags */}
          <AccordionItem value="seo">
            <AccordionTrigger>
              <Tags className="h-5 w-5 mr-2" /> SEO Tag Management ({seoTags.length} tags)
            </AccordionTrigger>
            <AccordionContent>
              <Select value={seoTagType} onValueChange={setSeoTagType}>
                <SelectTrigger className="w-48 mb-4"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="og">Open Graph</SelectItem>
                  <SelectItem value="twitter">Twitter Card</SelectItem>
                  <SelectItem value="meta">Meta Tags</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Tag list with edit/delete */}
              <div className="space-y-2 mb-4">
                {filteredTags.map(tag => (
                  <div key={tag.id} className="flex items-center justify-between p-2 rounded bg-white border">
                    <div className="flex-1">
                      <code className="text-xs">{tag.name}</code>
                      {editingTag === tag.id ? (
                        <Input value={editTagContent} onChange={e => setEditTagContent(e.target.value)} className="mt-1" />
                      ) : (
                        <p className="text-sm truncate">{tag.content}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {editingTag === tag.id ? (
                        <Button size="sm" variant="ghost" onClick={() => updateSeoTag(tag.id)}><Save className="h-4 w-4" /></Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => { setEditingTag(tag.id); setEditTagContent(tag.content); }}><Edit3 className="h-4 w-4" /></Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => removeSeoTag(tag.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add new tag */}
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Tag name" value={newTag.name} onChange={e => setNewTag(prev => ({ ...prev, name: e.target.value }))} />
                <Input placeholder="Content" value={newTag.content} onChange={e => setNewTag(prev => ({ ...prev, content: e.target.value }))} />
              </div>
              <Button onClick={addSeoTag} className="mt-2"><Plus className="h-4 w-4 mr-1" /> Add Tag</Button>
            </AccordionContent>
          </AccordionItem>

          {/* Metric Alerts */}
          <AccordionItem value="alerts">
            <AccordionTrigger>
              <Bell className="h-5 w-5 mr-2" /> Metric Alerts ({alerts.filter(a => a.enabled).length} active)
            </AccordionTrigger>
            <AccordionContent>
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded bg-white border mb-2">
                  <div>
                    <p className="font-medium">{alert.name}</p>
                    <p className="text-xs">{alert.metric} {alert.operator === "gt" ? ">" : "<"} {alert.threshold}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => toggleAlert(alert.id, alert.enabled)}>
                      {alert.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteAlert(alert.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              
              {/* Add new alert */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <Input placeholder="Alert name" value={newAlert.name} onChange={e => setNewAlert(prev => ({ ...prev, name: e.target.value }))} />
                <Select value={newAlert.metric} onValueChange={v => setNewAlert(prev => ({ ...prev, metric: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bounceRate">Bounce Rate</SelectItem>
                    <SelectItem value="conversionRate">Conversion Rate</SelectItem>
                    <SelectItem value="totalOrders">Total Orders</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newAlert.operator} onValueChange={v => setNewAlert(prev => ({ ...prev, operator: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gt">Greater than</SelectItem>
                    <SelectItem value="lt">Less than</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" value={newAlert.threshold} onChange={e => setNewAlert(prev => ({ ...prev, threshold: Number(e.target.value) }))} />
              </div>
              <Button onClick={addAlert} className="mt-2"><Bell className="h-4 w-4 mr-1" /> Create Alert</Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
```

---

## SECTION 3: DARKWAVE DEV HUB BROWSER UI

Add this component to your Developer page to browse/search available snippets:

```typescript
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
  }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ecosystem/snippets")
      .then(r => r.json())
      .then(data => { setSnippets(Array.isArray(data) ? data : []); setIsLoading(false); })
      .catch(() => { setSnippets([]); setIsLoading(false); });
  }, []);

  const searchByName = async () => {
    if (!searchQuery.trim()) {
      const res = await fetch("/api/ecosystem/snippets");
      setSnippets(await res.json());
      return;
    }
    setIsLoading(true);
    const res = await fetch(`/api/ecosystem/snippets?name=${encodeURIComponent(searchQuery)}`);
    setSnippets(await res.json());
    setIsLoading(false);
  };

  const categories = Array.from(new Set(snippets.map(s => s.category))).filter(Boolean);
  const filteredSnippets = snippets.filter(s => categoryFilter === "all" || s.category === categoryFilter);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Darkwave Dev Hub Browser</CardTitle>
        <CardDescription>Search and browse code snippets shared across the ecosystem</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search by name (e.g., analytics.md)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchByName()}
          />
          <Button onClick={searchByName}>Search</Button>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 mb-4"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {/* Results */}
        {isLoading ? (
          <p>Loading...</p>
        ) : filteredSnippets.length === 0 ? (
          <p className="text-center py-8">No snippets found</p>
        ) : (
          <ScrollArea className="h-80">
            {filteredSnippets.map(snippet => (
              <div 
                key={snippet.id}
                className="p-4 rounded-lg border mb-2 cursor-pointer hover:border-purple-300"
                onClick={() => setSelectedSnippet(selectedSnippet === snippet.id ? null : snippet.id)}
              >
                <div className="flex justify-between">
                  <div>
                    <span className="font-semibold">{snippet.name}</span>
                    {snippet.version && <Badge className="ml-2">{snippet.version}</Badge>}
                    {snippet.description && <p className="text-sm text-muted-foreground">{snippet.description}</p>}
                    <p className="text-xs text-muted-foreground">{snippet.category}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(snippet.code); }}>
                    Copy
                  </Button>
                </div>
                {selectedSnippet === snippet.id && (
                  <pre className="mt-4 p-3 rounded bg-slate-900 text-slate-100 text-xs overflow-x-auto max-h-64">
                    <code>{snippet.code.slice(0, 2000)}</code>
                  </pre>
                )}
              </div>
            ))}
          </ScrollArea>
        )}

        {/* Agent Instructions */}
        <div className="p-4 rounded bg-indigo-50 border mt-4">
          <p className="font-semibold">Agent Retrieval:</p>
          <code className="block">GET /api/ecosystem/snippets?name=analytics.md</code>
          <code className="block">GET /api/ecosystem/snippets/by-name/analytics.md</code>
          <code className="block">GET /api/ecosystem/snippets?category=documentation</code>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## SECTION 4: ECOSYSTEM API ENHANCEMENTS

Add name-based search to your ecosystem snippets API:

**server/storage.ts:**
```typescript
async getSharedCodeSnippets(category?: string, name?: string): Promise<SharedCodeSnippet[]> {
  if (name) {
    return await db
      .select()
      .from(sharedCodeSnippets)
      .where(ilike(sharedCodeSnippets.name, `%${name}%`))
      .orderBy(desc(sharedCodeSnippets.updatedAt));
  }
  if (category) {
    return await db
      .select()
      .from(sharedCodeSnippets)
      .where(eq(sharedCodeSnippets.category, category))
      .orderBy(desc(sharedCodeSnippets.updatedAt));
  }
  return await db.select().from(sharedCodeSnippets).orderBy(desc(sharedCodeSnippets.updatedAt));
}

async getSharedCodeSnippetByName(name: string): Promise<SharedCodeSnippet | undefined> {
  const [snippet] = await db
    .select()
    .from(sharedCodeSnippets)
    .where(eq(sharedCodeSnippets.name, name));
  return snippet || undefined;
}
```

**server/appEcosystemRoutes.ts:**
```typescript
app.get('/api/ecosystem/snippets', async (req, res) => {
  const category = req.query.category as string | undefined;
  const name = req.query.name as string | undefined;
  const snippets = await storage.getSharedCodeSnippets(category, name);
  res.json(snippets);
});

app.get('/api/ecosystem/snippets/by-name/:name', async (req, res) => {
  const snippet = await storage.getSharedCodeSnippetByName(req.params.name);
  if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
  res.json(snippet);
});
```

---

## SECTION 5: DEPENDENCIES

Required npm packages:
- recharts (for charts)
- jspdf (for PDF export)
- lucide-react (for icons)
- @radix-ui/react-accordion
- @radix-ui/react-select
- @radix-ui/react-scroll-area

---

## USAGE

1. Copy the API routes to your `server/routes.ts`
2. Copy the AnalyticsPanel and DarkwaveHubBrowser components to your page
3. Add required imports
4. Ensure you have the storage methods for `getAllScheduledOrders()` and `getRegions()`
5. Install jspdf if not already: `npm install jspdf`

**Retrieval for agents:**
```
GET https://your-app.replit.app/api/ecosystem/snippets/by-name/analytics.md
```

---

*Darkwave Studios - Cross-App Ecosystem Documentation*
*Version 1.0.0*

