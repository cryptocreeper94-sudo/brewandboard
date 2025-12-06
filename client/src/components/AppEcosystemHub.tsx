import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Plus,
  Key,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Power,
  PowerOff,
  Code2,
  Activity,
  ExternalLink,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ConnectedApp {
  id: string;
  name: string;
  description?: string;
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  isActive: boolean;
  permissions: string[];
  requestCount: number;
  lastSyncAt?: string;
  createdAt: string;
}

interface SyncLog {
  id: string;
  appId: string;
  action: string;
  direction: string;
  endpoint?: string;
  status: string;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'read:code', label: 'Read Code', desc: 'Access shared code snippets' },
  { id: 'write:code', label: 'Write Code', desc: 'Push code snippets' },
  { id: 'read:data', label: 'Read Data', desc: 'Access general data' },
  { id: 'write:data', label: 'Write Data', desc: 'Push general data' },
  { id: 'read:clients', label: 'Read Clients', desc: 'Access CRM clients' },
  { id: 'read:hallmarks', label: 'Read Hallmarks', desc: 'Access blockchain hallmarks' },
  { id: 'sync:all', label: 'Full Sync', desc: 'All permissions' },
];

export function AppEcosystemHub() {
  const { toast } = useToast();
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState<{apiKey: string; apiSecret: string} | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    baseUrl: '',
    permissions: [] as string[],
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [appsRes, logsRes] = await Promise.all([
        fetch('/api/ecosystem/apps'),
        fetch('/api/ecosystem/logs?limit=20'),
      ]);
      
      if (appsRes.ok) setApps(await appsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (error) {
      console.error('Failed to fetch ecosystem data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddApp = async () => {
    if (!newApp.name || !newApp.baseUrl) {
      toast({ title: "Name and Base URL required", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch('/api/ecosystem/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp),
      });

      if (res.ok) {
        const data = await res.json();
        toast({ title: "App connected successfully!" });
        setShowCredentials(data.credentials);
        setShowAddModal(false);
        setNewApp({ name: '', description: '', baseUrl: '', permissions: [] });
        fetchData();
      } else {
        const error = await res.json();
        toast({ title: error.error || "Failed to add app", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Connection failed", variant: "destructive" });
    }
  };

  const handleToggleApp = async (app: ConnectedApp) => {
    try {
      const res = await fetch(`/api/ecosystem/apps/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !app.isActive }),
      });

      if (res.ok) {
        toast({ title: app.isActive ? "App disabled" : "App enabled" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Failed to update app", variant: "destructive" });
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm("Are you sure you want to remove this connected app?")) return;

    try {
      const res = await fetch(`/api/ecosystem/apps/${appId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({ title: "App removed" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Failed to remove app", variant: "destructive" });
    }
  };

  const handleRegenerateKey = async (appId: string) => {
    if (!confirm("This will invalidate the existing API key. Continue?")) return;

    try {
      const res = await fetch(`/api/ecosystem/apps/${appId}/regenerate-key`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        toast({ title: "New API key generated" });
        setShowCredentials({ apiKey: data.apiKey, apiSecret: '(unchanged)' });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Failed to regenerate key", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePermission = (permId: string) => {
    setNewApp(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  if (isLoading) {
    return (
      <Card className="premium-card border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-amber-600" />
            <span className="text-muted-foreground">Loading App Ecosystem...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="premium-card border-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/5" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                App Ecosystem Hub
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                Connect and manage your other apps for seamless data sharing
                <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">
                  {apps.length} Connected
                </Badge>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="gap-2"
                data-testid="button-refresh-apps"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                data-testid="button-add-app"
              >
                <Plus className="h-4 w-4" />
                Connect App
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {apps.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Apps Connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect your other apps to enable code sharing and data sync
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="gap-2"
                data-testid="button-connect-first-app"
              >
                <Plus className="h-4 w-4" />
                Connect Your First App
              </Button>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-3">
              {apps.map((app) => (
                <AccordionItem
                  key={app.id}
                  value={app.id}
                  className="border rounded-xl bg-white/50 backdrop-blur px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-4" data-testid={`accordion-app-${app.id}`}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                        app.isActive 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                          : 'bg-gray-400'
                      }`}>
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{app.name}</span>
                          <Badge className={app.isActive 
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                            : "bg-gray-100 text-gray-600 border-gray-200"
                          }>
                            {app.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {app.baseUrl}
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-sm font-medium">{app.requestCount} requests</p>
                        <p className="text-xs text-muted-foreground">
                          {app.lastSyncAt ? new Date(app.lastSyncAt).toLocaleDateString() : 'Never synced'}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="ml-16 space-y-4">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                        <Key className="h-4 w-4 text-amber-600" />
                        <code className="text-sm font-mono flex-1">{app.apiKey}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(app.apiKey, app.id)}
                          data-testid={`button-copy-key-${app.id}`}
                        >
                          {copiedKey === app.id ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {app.permissions.map(perm => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {perm}
                          </Badge>
                        ))}
                        {app.permissions.length === 0 && (
                          <span className="text-xs text-muted-foreground">No permissions granted</span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleApp(app)}
                          className="gap-2"
                          data-testid={`button-toggle-${app.id}`}
                        >
                          {app.isActive ? (
                            <>
                              <PowerOff className="h-4 w-4" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4" />
                              Enable
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerateKey(app.id)}
                          className="gap-2"
                          data-testid={`button-regen-${app.id}`}
                        >
                          <RefreshCw className="h-4 w-4" />
                          New Key
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteApp(app.id)}
                          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-${app.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {logs.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-amber-600" />
                Recent Sync Activity
              </h4>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {logs.map(log => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 text-sm"
                    >
                      <Badge
                        variant="outline"
                        className={log.direction === 'inbound' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                        }
                      >
                        {log.direction === 'inbound' ? '←' : '→'}
                      </Badge>
                      <span className="font-medium">{log.action}</span>
                      <span className="text-muted-foreground truncate flex-1">{log.endpoint}</span>
                      <Badge
                        className={log.status === 'success' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                        }
                      >
                        {log.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Connect New App
            </DialogTitle>
            <DialogDescription>
              Add another app to enable data sharing and code sync
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">App Name</label>
              <Input
                placeholder="e.g., Orbit Staffing"
                value={newApp.name}
                onChange={e => setNewApp({ ...newApp, name: e.target.value })}
                data-testid="input-app-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Base URL</label>
              <Input
                placeholder="https://your-app.replit.app"
                value={newApp.baseUrl}
                onChange={e => setNewApp({ ...newApp, baseUrl: e.target.value })}
                data-testid="input-app-url"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                placeholder="What does this app do?"
                value={newApp.description}
                onChange={e => setNewApp({ ...newApp, description: e.target.value })}
                data-testid="input-app-description"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Permissions</label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_PERMISSIONS.map(perm => (
                  <div
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${
                      newApp.permissions.includes(perm.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                    }`}
                    data-testid={`perm-${perm.id}`}
                  >
                    <p className="text-sm font-medium">{perm.label}</p>
                    <p className="text-xs text-muted-foreground">{perm.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={handleAddApp}
              className="w-full gap-2 bg-gradient-to-r from-blue-500 to-purple-600"
              data-testid="button-confirm-add-app"
            >
              <Sparkles className="h-4 w-4" />
              Connect App
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showCredentials} onOpenChange={() => setShowCredentials(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <Key className="h-5 w-5" />
              API Credentials Generated
            </DialogTitle>
            <DialogDescription>
              Save these credentials securely - the secret will only be shown once!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm font-medium mb-2">API Key:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white p-2 rounded flex-1 overflow-x-auto">
                  {showCredentials?.apiKey}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(showCredentials?.apiKey || '', 'apiKey')}
                >
                  {copiedKey === 'apiKey' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium mb-2 text-red-700">API Secret (save now!):</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white p-2 rounded flex-1 overflow-x-auto">
                  {showCredentials?.apiSecret}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(showCredentials?.apiSecret || '', 'apiSecret')}
                >
                  {copiedKey === 'apiSecret' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              onClick={() => setShowCredentials(null)}
              className="w-full"
              data-testid="button-close-credentials"
            >
              I've Saved These Credentials
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
