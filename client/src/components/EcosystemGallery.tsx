import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Shield,
  Link,
  Briefcase,
  Mail,
  Wrench,
  Activity,
  CreditCard,
  Terminal,
  Package,
  ExternalLink,
  Code2,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Database,
  Users,
  FileJson,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ModuleFile {
  server?: string[];
  client?: string[];
  shared?: string[];
  scripts?: string[];
  config?: string[];
}

interface EcosystemModule {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  language: string;
  framework: string;
  files: ModuleFile;
  dependencies?: string[];
  features: string[];
  requiredSecrets?: string[];
  setupInstructions?: string;
  isPublic: boolean;
  usageCount: number;
}

interface ConnectedApp {
  id: string;
  name: string;
  baseUrl: string;
  status: string;
  permissions: string[];
}

interface EcosystemRegistry {
  name: string;
  version: string;
  description: string;
  lastUpdated: string;
  baseApp: string;
  modules: Record<string, EcosystemModule>;
  connectedApps: ConnectedApp[];
  categories: Array<{ id: string; name: string; icon: string }>;
}

const categoryIcons: Record<string, any> = {
  security: Shield,
  blockchain: Link,
  business: Briefcase,
  communication: Mail,
  utilities: Wrench,
  operations: Activity,
  payments: CreditCard,
  devops: Terminal,
};

const categoryColors: Record<string, string> = {
  security: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  blockchain: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  business: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  communication: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
  utilities: "from-gray-500/20 to-gray-600/10 border-gray-500/30",
  operations: "from-red-500/20 to-red-600/10 border-red-500/30",
  payments: "from-green-500/20 to-green-600/10 border-green-500/30",
  devops: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
};

export function EcosystemGallery() {
  const { toast } = useToast();
  const [registry, setRegistry] = useState<EcosystemRegistry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<EcosystemModule | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistry();
  }, []);

  const fetchRegistry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/ecosystem-registry.json');
      if (res.ok) {
        const data = await res.json();
        setRegistry(data);
      }
    } catch (error) {
      console.error('Failed to fetch ecosystem registry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getModules = () => {
    if (!registry) return [];
    const modules = Object.values(registry.modules);
    if (selectedCategory) {
      return modules.filter(m => m.category === selectedCategory);
    }
    return modules;
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#1a0f09]/90 to-[#2d1810]/90 border-amber-900/30">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-amber-200/60 mt-4">Loading ecosystem registry...</p>
        </CardContent>
      </Card>
    );
  }

  if (!registry) {
    return (
      <Card className="bg-gradient-to-br from-[#1a0f09]/90 to-[#2d1810]/90 border-amber-900/30">
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 text-amber-500/40 mx-auto mb-4" />
          <p className="text-amber-200/60">No ecosystem registry found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#1a0f09]/95 to-[#2d1810]/95 border-amber-900/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-purple-500/5" />
        
        <CardHeader className="relative border-b border-amber-900/20 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30">
                <Globe className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-amber-100 flex items-center gap-2">
                  {registry.name}
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </CardTitle>
                <p className="text-amber-200/60 text-sm mt-1">{registry.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-amber-500/30 text-amber-300 px-3 py-1">
                <FileJson className="w-3 h-3 mr-1" />
                v{registry.version}
              </Badge>
              <Badge variant="outline" className="border-purple-500/30 text-purple-300 px-3 py-1">
                <Package className="w-3 h-3 mr-1" />
                {Object.keys(registry.modules).length} Modules
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 px-3 py-1">
                <Users className="w-3 h-3 mr-1" />
                {registry.connectedApps.length} Apps
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-6">
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null 
                ? "bg-amber-600 hover:bg-amber-700 text-white" 
                : "border-amber-900/30 text-amber-200 hover:bg-amber-900/20"
              }
              data-testid="filter-all"
            >
              All Modules
            </Button>
            {registry.categories.map(cat => {
              const Icon = categoryIcons[cat.id] || Package;
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "border-amber-900/30 text-amber-200 hover:bg-amber-900/20"
                  }
                  data-testid={`filter-${cat.id}`}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {cat.name}
                </Button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {getModules().map((module, index) => {
                const Icon = categoryIcons[module.category] || Package;
                const colorClass = categoryColors[module.category] || categoryColors.utilities;
                
                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`bg-gradient-to-br ${colorClass} border cursor-pointer hover:scale-[1.02] transition-all duration-200 group`}
                      onClick={() => setSelectedModule(module)}
                      data-testid={`module-card-${module.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-lg bg-white/10">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                            v{module.version}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-white mb-1 group-hover:text-amber-200 transition-colors">
                          {module.name}
                        </h3>
                        <p className="text-white/60 text-sm line-clamp-2 mb-3">
                          {module.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                              {module.language}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                              {module.framework}
                            </Badge>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {registry.connectedApps.length > 0 && (
            <div className="mt-8 pt-6 border-t border-amber-900/20">
              <h3 className="text-lg font-semibold text-amber-100 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                Connected Applications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {registry.connectedApps.map(app => (
                  <Card
                    key={app.id}
                    className="bg-[#1a0f09]/60 border-amber-900/20"
                    data-testid={`connected-app-${app.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-amber-100">{app.name}</h4>
                        <Badge
                          variant="outline"
                          className={app.status === 'active' 
                            ? "border-emerald-500/30 text-emerald-300" 
                            : "border-amber-500/30 text-amber-300"
                          }
                        >
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-amber-200/50 text-xs mb-2 truncate">{app.baseUrl}</p>
                      <div className="flex flex-wrap gap-1">
                        {app.permissions.slice(0, 3).map(perm => (
                          <Badge key={perm} variant="outline" className="text-xs border-amber-900/30 text-amber-200/60">
                            {perm}
                          </Badge>
                        ))}
                        {app.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs border-amber-900/30 text-amber-200/60">
                            +{app.permissions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-[#1a0f09] to-[#2d1810] border-amber-900/30 text-amber-100">
          {selectedModule && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = categoryIcons[selectedModule.category] || Package;
                    return (
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Icon className="w-6 h-6 text-amber-400" />
                      </div>
                    );
                  })()}
                  <div>
                    <DialogTitle className="text-xl text-amber-100">
                      {selectedModule.name}
                    </DialogTitle>
                    <DialogDescription className="text-amber-200/60">
                      {selectedModule.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                    v{selectedModule.version}
                  </Badge>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                    {selectedModule.language}
                  </Badge>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                    {selectedModule.framework}
                  </Badge>
                  {selectedModule.isPublic && (
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
                      Public
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-amber-200 mb-2">Features</h4>
                  <ul className="grid grid-cols-2 gap-1">
                    {selectedModule.features.map((feature, i) => (
                      <li key={i} className="text-sm text-amber-100/70 flex items-center gap-2">
                        <Check className="w-3 h-3 text-emerald-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-amber-200 mb-2">Files</h4>
                  <ScrollArea className="h-40 rounded-lg bg-[#0d0705] p-3 border border-amber-900/20">
                    {Object.entries(selectedModule.files).map(([key, files]) => (
                      <div key={key} className="mb-3">
                        <span className="text-xs text-amber-400 uppercase">{key}</span>
                        {(files as string[]).map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-1 text-sm text-amber-100/70 hover:text-amber-100 cursor-pointer group"
                            onClick={() => copyToClipboard(file, file)}
                          >
                            <code className="text-xs">{file}</code>
                            {copiedText === file ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </ScrollArea>
                </div>

                {selectedModule.dependencies && selectedModule.dependencies.length > 0 && (
                  <div>
                    <h4 className="font-medium text-amber-200 mb-2">Dependencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedModule.dependencies.map(dep => (
                        <Badge key={dep} variant="outline" className="border-amber-900/30 text-amber-200/70">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedModule.requiredSecrets && selectedModule.requiredSecrets.length > 0 && (
                  <div>
                    <h4 className="font-medium text-amber-200 mb-2">Required Secrets</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedModule.requiredSecrets.map(secret => (
                        <Badge key={secret} variant="outline" className="border-red-500/30 text-red-300">
                          {secret}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-amber-900/20">
                  <Button
                    variant="outline"
                    className="border-amber-500/30 text-amber-200 hover:bg-amber-900/20"
                    onClick={() => copyToClipboard(JSON.stringify(selectedModule, null, 2), 'Module JSON')}
                    data-testid="copy-module-json"
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Copy as JSON
                  </Button>
                  {selectedModule.setupInstructions && (
                    <Button
                      variant="outline"
                      className="border-amber-500/30 text-amber-200 hover:bg-amber-900/20"
                      data-testid="view-setup"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Setup Guide
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
