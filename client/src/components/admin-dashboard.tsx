import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  RefreshCw,
  Truck,
  Coffee
} from 'lucide-react';

interface SystemMetrics {
  orders: {
    today: number;
    pending: number;
    inProgress: number;
    delivered: number;
    cancelled: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  doordash: {
    configured: boolean;
    environment: string;
    circuitBreaker: 'closed' | 'open' | 'half-open';
    recentFailures: number;
  };
  logs: {
    total: number;
    recentErrors: number;
    byCategory: Record<string, number>;
  };
}

interface LogEntry {
  timestamp: string;
  level: string;
  category: string;
  message: string;
  metadata?: Record<string, any>;
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs?limit=50');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMetrics(), fetchLogs()]);
      setLoading(false);
    };
    
    loadData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchMetrics();
        fetchLogs();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
      case 'critical':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getCircuitBreakerBadge = (state: string) => {
    switch (state) {
      case 'closed':
        return <Badge className="bg-green-500">Healthy</Badge>;
      case 'open':
        return <Badge variant="destructive">Circuit Open</Badge>;
      case 'half-open':
        return <Badge className="bg-yellow-500">Recovering</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="admin-loading">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="admin-dashboard">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Monitoring</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
              data-testid="toggle-autorefresh"
            />
            Auto-refresh (30s)
          </label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { fetchMetrics(); fetchLogs(); }}
            data-testid="button-refresh-metrics"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-orders-today">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <ShoppingBag className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.orders.today || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.orders.pending || 0} pending, {metrics?.orders.inProgress || 0} in progress
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-revenue-today">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((metrics?.revenue.today || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              ${((metrics?.revenue.thisMonth || 0) / 100).toFixed(0)} this month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-delivery-status">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery System</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {metrics?.doordash.configured ? (
                getCircuitBreakerBadge(metrics.doordash.circuitBreaker)
              ) : (
                <Badge variant="secondary">Not Configured</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.doordash.configured 
                ? `${metrics.doordash.environment} mode`
                : 'Awaiting credentials'}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-system-health">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {(metrics?.logs.recentErrors || 0) === 0 ? (
                <Badge className="bg-green-500">Healthy</Badge>
              ) : (metrics?.logs.recentErrors || 0) < 5 ? (
                <Badge className="bg-yellow-500">Warning</Badge>
              ) : (
                <Badge variant="destructive">Issues Detected</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.logs.recentErrors || 0} errors in last hour
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList data-testid="admin-tabs">
          <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs">System Logs</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{metrics?.orders.pending || 0}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics?.orders.inProgress || 0}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{metrics?.orders.delivered || 0}</div>
              <div className="text-sm text-muted-foreground">Delivered</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{metrics?.orders.cancelled || 0}</div>
              <div className="text-sm text-muted-foreground">Cancelled</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-700">{metrics?.orders.today || 0}</div>
              <div className="text-sm text-muted-foreground">Total Today</div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Logs</CardTitle>
              <CardDescription>Last 50 log entries</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {logs.map((log, i) => (
                    <div 
                      key={i} 
                      className="flex items-start gap-3 p-2 rounded border text-sm"
                      data-testid={`log-entry-${i}`}
                    >
                      <span className={`font-mono uppercase text-xs ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.category}
                      </Badge>
                      <span className="flex-1">{log.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  DoorDash Drive
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Status</span>
                  {metrics?.doordash.configured ? (
                    <Badge className="bg-green-500">Connected</Badge>
                  ) : (
                    <Badge variant="secondary">Not Configured</Badge>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Environment</span>
                  <span className="font-mono">{metrics?.doordash.environment || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Circuit Breaker</span>
                  {getCircuitBreakerBadge(metrics?.doordash.circuitBreaker || 'unknown')}
                </div>
                <div className="flex justify-between">
                  <span>Recent Failures</span>
                  <span className={metrics?.doordash.recentFailures ? 'text-red-500' : ''}>
                    {metrics?.doordash.recentFailures || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Stripe Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Status</span>
                  <Badge className="bg-green-500">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Today's Volume</span>
                  <span>${((metrics?.revenue.today || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Week Volume</span>
                  <span>${((metrics?.revenue.thisWeek || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Month Volume</span>
                  <span>${((metrics?.revenue.thisMonth || 0) / 100).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminDashboard;
