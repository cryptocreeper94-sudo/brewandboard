import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, ExternalLink, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WebResult {
  url: string;
  domain: string;
  type: "url" | "search";
}

function detectSearchType(query: string): "url" | "search" {
  if (!query.trim()) return "search";
  if (query.match(/^https?:\/\//i)) return "url";
  if (query.match(/^www\./i)) return "url";
  if (query.match(/\.[a-z]{2,}$/i) && !query.includes(" ")) return "url";
  return "search";
}

export function WebSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [webResult, setWebResult] = useState<WebResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchType = detectSearchType(query);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setWebResult(null);
      setIsOpen(false);
      return;
    }

    const searchQuery = query.trim();
    const type = detectSearchType(searchQuery);
    
    if (type === "url") {
      let url = searchQuery;
      if (searchQuery.match(/^www\./i)) {
        url = `https://${searchQuery}`;
      } else if (!searchQuery.match(/^https?:\/\//i) && searchQuery.match(/\.[a-z]{2,}$/i)) {
        url = `https://${searchQuery}`;
      }
      
      try {
        const urlObj = new URL(url);
        setWebResult({
          url: url,
          domain: urlObj.hostname,
          type: "url"
        });
        setIsOpen(true);
      } catch {
        setWebResult({
          url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
          domain: "google.com",
          type: "search"
        });
        setIsOpen(true);
      }
    } else {
      setWebResult({
        url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
        domain: "google.com",
        type: "search"
      });
      setIsOpen(true);
    }
  }, [query]);

  const handleSearch = () => {
    if (webResult) {
      window.open(webResult.url, "_blank", "noopener,noreferrer");
      setQuery("");
      setWebResult(null);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && webResult) {
      handleSearch();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex items-center bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-r border-border/30">
            <div className="text-primary/70">
              {searchType === "url" ? <Globe className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-0">
              {searchType === "url" ? "URL" : "Search"}
            </Badge>
          </div>
          
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search the web or enter URL..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => webResult && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-sm"
            data-testid="input-web-search"
          />
          
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mr-1"
              onClick={() => {
                setQuery("");
                setWebResult(null);
                setIsOpen(false);
              }}
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && webResult && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-2 border-b border-border/30 bg-muted/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Search className="h-3 w-3" />
                  <span>Quick Search</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">
                    Press Enter
                  </Badge>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                <motion.button
                  onClick={handleSearch}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer group/item text-left"
                  whileHover={{ x: 4 }}
                  data-testid="result-web-search"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    webResult.type === "url" 
                      ? "bg-gradient-to-br from-blue-500 to-purple-500" 
                      : "bg-gradient-to-br from-amber-500 to-orange-500"
                  }`}>
                    {webResult.type === "url" ? (
                      <Globe className="h-5 w-5 text-white" />
                    ) : (
                      <Search className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {webResult.type === "url" ? "Open Website" : "Search Google"}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {webResult.type === "url" ? "URL" : "Web"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {webResult.type === "url" ? webResult.domain : `"${query}"`}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                </motion.button>
              </div>
              
              <div className="p-2 border-t border-border/30 bg-muted/20">
                <p className="text-[10px] text-center text-muted-foreground">
                  Enter a URL to visit or search term to find
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WebSearch;
