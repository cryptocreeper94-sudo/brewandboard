import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Copy,
  Check,
  Search,
  Filter,
  Maximize2,
  X,
  ExternalLink,
  Download,
  Share2,
  FileText,
  Sparkles,
  RefreshCw,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CodeSnippet {
  id: string;
  name: string;
  description?: string;
  language: string;
  code: string;
  category: string;
  isPublic: boolean;
  usageCount: number;
  version?: string;
  createdBy?: string;
  createdAt: string;
}

export function SnippetBrowser() {
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<CodeSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const categories = ["all", ...Array.from(new Set(snippets.map(s => s.category)))];
  const languages = ["all", ...Array.from(new Set(snippets.map(s => s.language)))];

  const fetchSnippets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ecosystem/snippets");
      if (res.ok) {
        const data = await res.json();
        setSnippets(data);
        setFilteredSnippets(data);
      }
    } catch (error) {
      console.error("Failed to fetch snippets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  useEffect(() => {
    let result = snippets;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.code.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(s => s.category === categoryFilter);
    }

    if (languageFilter !== "all") {
      result = result.filter(s => s.language === languageFilter);
    }

    setFilteredSnippets(result);
  }, [searchQuery, categoryFilter, languageFilter, snippets]);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "Content copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyFullSnippet = async (snippet: CodeSnippet) => {
    const fullContent = `# ${snippet.name}\n\n${snippet.description || ""}\n\n\`\`\`${snippet.language}\n${snippet.code}\n\`\`\``;
    await copyToClipboard(fullContent, `full-${snippet.id}`);
  };

  const generateShareUrl = (snippet: CodeSnippet) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/api/ecosystem/snippets/by-name/${encodeURIComponent(snippet.name)}`;
    setShareUrl(url);
    setShowShareModal(true);
  };

  const downloadSnippet = (snippet: CodeSnippet) => {
    const ext = snippet.language === "typescript" ? "ts" : snippet.language === "markdown" ? "md" : snippet.language;
    const blob = new Blob([snippet.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${snippet.name.replace(/\s+/g, "-")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: `${snippet.name} saved` });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      documentation: "bg-blue-100 text-blue-700 border-blue-200",
      api: "bg-purple-100 text-purple-700 border-purple-200",
      schema: "bg-emerald-100 text-emerald-700 border-emerald-200",
      component: "bg-amber-100 text-amber-700 border-amber-200",
      utility: "bg-cyan-100 text-cyan-700 border-cyan-200",
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <Card className="premium-card border-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 10, scale: 1.05 }}
              >
                <Code2 className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <CardTitle className="font-serif text-2xl gradient-text">Snippet Library</CardTitle>
                <CardDescription>Browse, search, and recall code snippets</CardDescription>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-500/10 text-indigo-700 border-indigo-200">
              {snippets.length} snippets
            </Badge>
            <Button variant="ghost" size="sm" onClick={fetchSnippets} data-testid="button-refresh-snippets">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-snippets"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]" data-testid="select-category-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-[150px]" data-testid="select-language-filter">
              <Code2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang} value={lang}>
                  {lang === "all" ? "All Languages" : lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Snippet Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredSnippets.length === 0 ? (
          <div className="text-center py-12">
            <Code2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No snippets found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? "Try a different search term" : "Push code snippets from connected apps"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSnippets.map(snippet => (
              <motion.div
                key={snippet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group p-4 rounded-xl bg-white border shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedSnippet(snippet)}
                data-testid={`snippet-card-${snippet.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">{snippet.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        copyToClipboard(snippet.code, snippet.id);
                      }}
                      data-testid={`button-copy-${snippet.id}`}
                    >
                      {copiedId === snippet.id ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedSnippet(snippet);
                      }}
                      data-testid={`button-expand-${snippet.id}`}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {snippet.language}
                  </Badge>
                  <Badge className={`text-xs ${getCategoryColor(snippet.category)}`}>
                    {snippet.category}
                  </Badge>
                  {snippet.version && (
                    <Badge variant="secondary" className="text-xs">
                      v{snippet.version}
                    </Badge>
                  )}
                </div>
                {snippet.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {snippet.description}
                  </p>
                )}
                <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-hidden max-h-20">
                  <code>{snippet.code.slice(0, 200)}...</code>
                </pre>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{snippet.usageCount} uses</span>
                  {snippet.createdBy && <span>by {snippet.createdBy}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Full-Screen Snippet Viewer */}
        <Dialog open={!!selectedSnippet} onOpenChange={() => setSelectedSnippet(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Code2 className="h-5 w-5 text-indigo-600" />
                    {selectedSnippet?.name}
                  </DialogTitle>
                  <DialogDescription>{selectedSnippet?.description}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            {selectedSnippet && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{selectedSnippet.language}</Badge>
                  <Badge className={getCategoryColor(selectedSnippet.category)}>
                    {selectedSnippet.category}
                  </Badge>
                  {selectedSnippet.version && (
                    <Badge variant="secondary">v{selectedSnippet.version}</Badge>
                  )}
                  <span className="text-sm text-muted-foreground ml-auto">
                    {selectedSnippet.usageCount} uses
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(selectedSnippet.code, `modal-${selectedSnippet.id}`)}
                    className="gap-2"
                    data-testid="button-copy-full"
                  >
                    {copiedId === `modal-${selectedSnippet.id}` ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copy Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyFullSnippet(selectedSnippet)}
                    className="gap-2"
                    data-testid="button-copy-markdown"
                  >
                    <FileText className="h-4 w-4" />
                    Copy as Markdown
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generateShareUrl(selectedSnippet)}
                    className="gap-2"
                    data-testid="button-share"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadSnippet(selectedSnippet)}
                    className="gap-2"
                    data-testid="button-download"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>

                <ScrollArea className="h-[50vh] rounded-lg border">
                  <pre className="text-sm bg-gray-900 text-gray-100 p-4 min-h-full">
                    <code>{selectedSnippet.code}</code>
                  </pre>
                </ScrollArea>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>For other agents:</strong> Access this snippet via API:
                  </p>
                  <code className="text-xs bg-white p-2 rounded block mt-2 overflow-x-auto">
                    GET {window.location.origin}/api/ecosystem/snippets/by-name/{selectedSnippet.name}
                  </code>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Share URL Modal */}
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                Share Snippet
              </DialogTitle>
              <DialogDescription>
                Use this URL to access the snippet from other agents or projects
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-gray-50 border">
                <p className="text-sm font-medium mb-2">API Endpoint:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white p-2 rounded flex-1 overflow-x-auto border">
                    {shareUrl}
                  </code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(shareUrl, "share-url")}
                    data-testid="button-copy-share-url"
                  >
                    {copiedId === "share-url" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Usage:</strong> Other agents can fetch this snippet with:
                </p>
                <pre className="text-xs bg-white p-2 rounded mt-2 overflow-x-auto">
{`curl "${shareUrl}"`}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Access Guide */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-800">Quick Access for Agents</p>
              <p className="text-sm text-indigo-700 mt-1">
                Click any snippet to expand, then use "Copy Code" or "Share Link" to recall it in any project.
                Other agents can fetch via: <code className="bg-white px-1 rounded">GET /api/ecosystem/snippets/by-name/[name]</code>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
