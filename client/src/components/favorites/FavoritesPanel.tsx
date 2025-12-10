import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Star, 
  Coffee, 
  Store,
  Croissant,
  ChevronRight,
  Trash2,
  Plus
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Favorite {
  id: number;
  type: "vendor" | "item";
  vendorId?: number;
  vendorName?: string;
  vendorLogo?: string;
  itemId?: string;
  itemName?: string;
  itemPrice?: number;
  category?: string;
  createdAt: string;
}

export function FavoritesPanel({ userId }: { userId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites", userId],
    queryFn: async () => {
      const res = await fetch(`/api/favorites/${userId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  const removeMutation = useMutation({
    mutationFn: async (fav: Favorite) => {
      const type = fav.type;
      const refId = fav.vendorId || fav.itemId;
      const res = await fetch(`/api/favorites/${userId}/${type}/${refId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove favorite");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Removed from favorites" });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive",
      });
    },
    onSettled: () => setRemovingId(null),
  });

  const handleRemove = (fav: Favorite) => {
    setRemovingId(fav.id);
    removeMutation.mutate(fav);
  };

  const vendorFavorites = favorites.filter(f => f.type === "vendor");
  const itemFavorites = favorites.filter(f => f.type === "item");

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-pink-500/5 to-red-500/5 border-pink-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
          <h3 className="font-serif text-lg">Loading Favorites...</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (!favorites.length) {
    return (
      <Card className="p-6 bg-gradient-to-br from-pink-500/5 to-red-500/5 border-pink-500/20 text-center">
        <Heart className="h-12 w-12 mx-auto mb-3 text-pink-400/40" />
        <h3 className="font-serif text-lg mb-2">No Favorites Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Heart your favorite vendors and items for quick access
        </p>
        <Link href="/schedule">
          <Button 
            variant="outline"
            className="border-pink-500/30 hover:bg-pink-500/10 text-pink-600"
            data-testid="button-browse-vendors"
          >
            <Store className="h-4 w-4 mr-2" />
            Browse Vendors
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-pink-500/5 to-red-500/5 border-pink-500/20">
      <div className="p-4 border-b border-pink-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
            >
              <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
            </motion.div>
            <h3 className="font-serif text-lg">Favorites</h3>
            <Badge variant="secondary" className="text-[10px] bg-pink-100 text-pink-700">
              {favorites.length}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="vendors" className="w-full">
        <TabsList className="w-full rounded-none border-b bg-transparent h-10">
          <TabsTrigger 
            value="vendors" 
            className="flex-1 gap-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
          >
            <Store className="h-3.5 w-3.5" />
            Vendors ({vendorFavorites.length})
          </TabsTrigger>
          <TabsTrigger 
            value="items"
            className="flex-1 gap-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
          >
            <Coffee className="h-3.5 w-3.5" />
            Items ({itemFavorites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="m-0">
          <ScrollArea className="h-[220px]">
            <div className="p-3 space-y-2">
              <AnimatePresence>
                {vendorFavorites.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No favorite vendors yet
                  </div>
                ) : (
                  vendorFavorites.map((fav, index) => (
                    <motion.div
                      key={fav.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-3 p-2 bg-card border rounded-lg hover:shadow-sm transition-shadow">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: 'linear-gradient(135deg, #2d1810 0%, #5c4033 100%)' }}
                        >
                          {fav.vendorLogo ? (
                            <img src={fav.vendorLogo} alt="" className="h-6 w-6 rounded" />
                          ) : (
                            <Store className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">{fav.vendorName}</h4>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-pink-500 hover:bg-pink-50"
                          onClick={() => handleRemove(fav)}
                          disabled={removingId === fav.id}
                          data-testid={`button-remove-fav-${fav.id}`}
                        >
                          {removingId === fav.id ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity }}>
                              <Trash2 className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="items" className="m-0">
          <ScrollArea className="h-[220px]">
            <div className="p-3 space-y-2">
              <AnimatePresence>
                {itemFavorites.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No favorite items yet
                  </div>
                ) : (
                  itemFavorites.map((fav, index) => (
                    <motion.div
                      key={fav.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-3 p-2 bg-card border rounded-lg hover:shadow-sm transition-shadow">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center shrink-0">
                          {fav.category === "food" ? (
                            <Croissant className="h-5 w-5 text-amber-600" />
                          ) : (
                            <Coffee className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">{fav.itemName}</h4>
                          <p className="text-xs text-muted-foreground">{fav.vendorName}</p>
                        </div>
                        {fav.itemPrice && (
                          <span className="text-sm font-medium text-[#5c4033]">
                            ${fav.itemPrice.toFixed(2)}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-pink-500 hover:bg-pink-50"
                          onClick={() => handleRemove(fav)}
                          disabled={removingId === fav.id}
                          data-testid={`button-remove-item-fav-${fav.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export function FavoriteButton({ 
  type, 
  vendorId, 
  vendorName, 
  itemId, 
  itemName, 
  itemPrice,
  userId,
  initialFavorited = false
}: {
  type: "vendor" | "item";
  vendorId?: number;
  vendorName?: string;
  itemId?: string;
  itemName?: string;
  itemPrice?: number;
  userId: number;
  initialFavorited?: boolean;
}) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const referenceId = type === "vendor" ? vendorId : itemId;
      if (isFavorited) {
        const res = await fetch(`/api/favorites/${userId}/${type}/${referenceId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to remove");
        return { action: "removed" };
      } else {
        const res = await fetch(`/api/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            userId, 
            favoriteType: type, 
            referenceId: String(referenceId),
            referenceName: type === "vendor" ? vendorName : itemName,
            referenceData: { vendorName, itemPrice }
          }),
        });
        if (!res.ok) throw new Error("Failed to add");
        return { action: "added" };
      }
    },
    onSuccess: (data) => {
      setIsFavorited(!isFavorited);
      toast({
        title: data.action === "added" ? "Added to favorites!" : "Removed from favorites",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    },
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMutation.mutate();
      }}
      disabled={toggleMutation.isPending}
      data-testid={`button-favorite-${type}-${vendorId || itemId}`}
    >
      <motion.div
        animate={isFavorited ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`h-4 w-4 transition-colors ${
            isFavorited 
              ? "text-pink-500 fill-pink-500" 
              : "text-muted-foreground hover:text-pink-400"
          }`} 
        />
      </motion.div>
    </Button>
  );
}
