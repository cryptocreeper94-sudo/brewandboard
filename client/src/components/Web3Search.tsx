import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Coins, FileCode, TrendingUp, TrendingDown, ExternalLink, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SearchMode = "auto" | "web" | "token" | "contract";

interface TokenResult {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

interface SearchResult {
  type: "token" | "web" | "contract";
  data: TokenResult | { title: string; url: string; snippet: string };
}

function detectSearchMode(query: string): SearchMode {
  if (!query.trim()) return "auto";
  
  if (query.match(/^https?:\/\//i)) return "web";
  
  if (query.match(/^0x[a-fA-F0-9]{40}$/)) return "contract";
  
  if (query.match(/^[A-Z]{2,10}$/) || query.match(/^(btc|eth|sol|bnb|xrp|ada|doge|dot|matic|link|uni|avax|atom|ltc)$/i)) {
    return "token";
  }
  
  return "token";
}

function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8)}`;
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${cap.toLocaleString()}`;
}

export function Web3Search() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TokenResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mode = detectSearchMode(query);

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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      try {
        const searchQuery = query.toLowerCase().trim();
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(searchQuery)}`
        );
        
        if (!response.ok) throw new Error("Search failed");
        
        const searchData = await response.json();
        const coinIds = searchData.coins?.slice(0, 5).map((c: any) => c.id) || [];
        
        if (coinIds.length === 0) {
          setResults([]);
          setIsLoading(false);
          return;
        }

        const marketResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(",")}&order=market_cap_desc&sparkline=false`
        );
        
        if (!marketResponse.ok) throw new Error("Failed to fetch market data");
        
        const marketData = await marketResponse.json();
        setResults(marketData);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error:", err);
        setError("Search failed. Try again.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const getModeIcon = () => {
    switch (mode) {
      case "web": return <Globe className="h-4 w-4" />;
      case "token": return <Coins className="h-4 w-4" />;
      case "contract": return <FileCode className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "web": return "Web";
      case "token": return "Token";
      case "contract": return "Contract";
      default: return "Search";
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex items-center bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-r border-border/30">
            <div className="text-primary/70">
              {getModeIcon()}
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-0">
              {getModeLabel()}
            </Badge>
          </div>
          
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search tokens, contracts, URLs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-sm"
            data-testid="input-web3-search"
          />
          
          {isLoading && (
            <div className="px-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
          
          {query && !isLoading && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mr-1"
              onClick={() => {
                setQuery("");
                setResults([]);
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
        {isOpen && (results.length > 0 || error) && (
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
                  <span>Web3 Research Results</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">
                    {results.length} found
                  </Badge>
                </div>
              </div>

              {error ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {error}
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {results.map((token) => (
                    <motion.a
                      key={token.id}
                      href={`https://www.coingecko.com/en/coins/${token.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/20 last:border-0 group/item"
                      whileHover={{ x: 4 }}
                      data-testid={`result-token-${token.id}`}
                    >
                      <img
                        src={token.image}
                        alt={token.name}
                        className="w-8 h-8 rounded-full ring-2 ring-border/30"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">{token.name}</span>
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {token.symbol}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>MCap: {formatMarketCap(token.market_cap)}</span>
                          <span>Vol: {formatMarketCap(token.total_volume)}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-mono font-semibold text-sm">
                          {formatPrice(token.current_price)}
                        </div>
                        <div className={`flex items-center justify-end gap-1 text-xs ${
                          token.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                        }`}>
                          {token.price_change_percentage_24h >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{Math.abs(token.price_change_percentage_24h).toFixed(2)}%</span>
                        </div>
                      </div>
                      
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </motion.a>
                  ))}
                </div>
              )}
              
              <div className="p-2 border-t border-border/30 bg-muted/20">
                <p className="text-[10px] text-center text-muted-foreground">
                  Powered by CoinGecko • Click result to view details
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Web3Search;
