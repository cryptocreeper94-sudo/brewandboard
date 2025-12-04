import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Search, 
  Star, 
  Coffee, 
  ArrowLeft, 
  Navigation,
  Phone,
  Clock,
  ShoppingCart
} from "lucide-react";
import { Link } from "wouter";
import { COFFEE_SHOPS, Shop } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const NASHVILLE_ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
  '37201': { lat: 36.1627, lng: -86.7816 },
  '37202': { lat: 36.1627, lng: -86.7816 },
  '37203': { lat: 36.1498, lng: -86.7906 },
  '37204': { lat: 36.1159, lng: -86.7817 },
  '37205': { lat: 36.1145, lng: -86.8587 },
  '37206': { lat: 36.1877, lng: -86.7380 },
  '37207': { lat: 36.2152, lng: -86.7617 },
  '37208': { lat: 36.1805, lng: -86.8040 },
  '37209': { lat: 36.1561, lng: -86.8571 },
  '37210': { lat: 36.1360, lng: -86.7524 },
  '37211': { lat: 36.0722, lng: -86.7118 },
  '37212': { lat: 36.1357, lng: -86.8049 },
  '37213': { lat: 36.1714, lng: -86.7530 },
  '37214': { lat: 36.1714, lng: -86.6679 },
  '37215': { lat: 36.0906, lng: -86.8169 },
  '37216': { lat: 36.2067, lng: -86.7097 },
  '37217': { lat: 36.1177, lng: -86.6633 },
  '37218': { lat: 36.2153, lng: -86.8387 },
  '37219': { lat: 36.1658, lng: -86.7844 },
  '37220': { lat: 36.0696, lng: -86.7781 },
  '37221': { lat: 36.0624, lng: -86.8917 },
  '37067': { lat: 35.9625, lng: -86.8187 },
  '37069': { lat: 35.9256, lng: -86.8684 },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function FindBaristasPage() {
  const [zipcode, setZipcode] = useState("");
  const [searchedZip, setSearchedZip] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const { addItem, getItemQuantity, itemCount } = useCart();
  const { toast } = useToast();

  const nearbyShops = useMemo(() => {
    if (!searchedZip || !NASHVILLE_ZIP_COORDS[searchedZip]) return [];
    
    const coords = NASHVILLE_ZIP_COORDS[searchedZip];
    
    return COFFEE_SHOPS
      .map(shop => ({
        ...shop,
        distance: calculateDistance(coords.lat, coords.lng, shop.lat, shop.lng)
      }))
      .filter(shop => shop.distance <= 10)
      .sort((a, b) => a.distance - b.distance);
  }, [searchedZip]);

  const handleSearch = () => {
    if (zipcode.length === 5 && /^\d{5}$/.test(zipcode)) {
      if (NASHVILLE_ZIP_COORDS[zipcode]) {
        setSearchedZip(zipcode);
      } else {
        toast({
          title: "ZIP Code Not Found",
          description: "Please enter a Nashville area ZIP code",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Invalid ZIP Code",
        description: "Please enter a 5-digit ZIP code",
        variant: "destructive"
      });
    }
  };

  const openMenu = (shop: Shop) => {
    setSelectedShop(shop);
    setShowMenu(true);
  };

  const categories = selectedShop 
    ? Array.from(new Set(selectedShop.menu.map(item => item.category)))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f09] via-[#2d1810] to-[#1a0f09]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-amber-100 hover:bg-amber-900/30" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl text-amber-100">Find Baristas</h1>
            <p className="text-amber-200/60 text-sm">Discover coffee shops within 10 miles</p>
          </div>
          {itemCount > 0 && (
            <Link href="/schedule" className="ml-auto">
              <Button className="bg-amber-600 hover:bg-amber-700 relative" data-testid="button-view-cart">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                <Badge className="absolute -top-2 -right-2 bg-white text-amber-900 text-xs px-1.5">
                  {itemCount}
                </Badge>
              </Button>
            </Link>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#2d1810] to-[#1a0f09] border border-amber-800/30 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-amber-500" />
            <h2 className="text-amber-100 font-medium">Enter Your ZIP Code</h2>
          </div>
          
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="e.g., 37203"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-black/30 border-amber-800/30 text-amber-100 placeholder:text-amber-200/40"
              data-testid="input-zipcode"
            />
            <Button 
              onClick={handleSearch}
              className="bg-amber-600 hover:bg-amber-700 px-6"
              data-testid="button-search-zip"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <p className="text-amber-200/50 text-xs mt-3">
            Serving Nashville metro area: Downtown, The Gulch, 12 South, East Nashville, Franklin, and more
          </p>
        </motion.div>

        {searchedZip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-amber-100 font-serif text-xl">
                {nearbyShops.length} Baristas Near {searchedZip}
              </h2>
              <Badge variant="outline" className="border-amber-600/50 text-amber-400">
                Within 10 miles
              </Badge>
            </div>

            {nearbyShops.length === 0 ? (
              <Card className="bg-black/20 border-amber-800/30">
                <CardContent className="p-8 text-center">
                  <Coffee className="h-12 w-12 text-amber-600/50 mx-auto mb-4" />
                  <p className="text-amber-200/60">No coffee shops found within 10 miles of this ZIP code.</p>
                  <p className="text-amber-200/40 text-sm mt-2">Try a different Nashville area ZIP code.</p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-4 pr-4">
                  {nearbyShops.map((shop, index) => (
                    <motion.div
                      key={shop.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="bg-gradient-to-r from-[#2d1810] to-[#1a0f09] border-amber-800/30 hover:border-amber-600/50 transition-all cursor-pointer overflow-hidden"
                        data-testid={`card-shop-${shop.id}`}
                      >
                        <CardContent className="p-0">
                          <div className="flex">
                            <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                              <img 
                                src={shop.image} 
                                alt={shop.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="text-amber-100 font-medium">{shop.name}</h3>
                                  <p className="text-amber-200/50 text-sm">{shop.location}</p>
                                </div>
                                <Badge className="bg-amber-500 text-white border-none flex-shrink-0">
                                  {shop.rating} <Star className="h-3 w-3 ml-0.5 fill-current" />
                                </Badge>
                              </div>
                              
                              <p className="text-amber-200/40 text-xs mt-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {shop.address}
                              </p>
                              
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2 text-amber-400 text-sm">
                                  <Navigation className="h-4 w-4" />
                                  <span>{shop.distance.toFixed(1)} mi</span>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="bg-amber-600 hover:bg-amber-700"
                                  onClick={() => openMenu(shop)}
                                  data-testid={`button-order-${shop.id}`}
                                >
                                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                                  Order
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </motion.div>
        )}

        {!searchedZip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <Coffee className="h-16 w-16 text-amber-600/30 mx-auto mb-4" />
            <p className="text-amber-200/50">Enter your ZIP code to find nearby coffee shops</p>
          </motion.div>
        )}
      </div>

      <Dialog open={showMenu} onOpenChange={setShowMenu}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden bg-gradient-to-br from-[#1a0f09] to-[#2d1810] border-amber-800/30">
          {selectedShop && (
            <>
              <DialogHeader className="pb-2">
                <DialogTitle className="font-serif text-2xl text-amber-100 flex items-center gap-3">
                  <Coffee className="h-6 w-6 text-amber-500" />
                  {selectedShop.name}
                </DialogTitle>
                <p className="text-amber-200/60 text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {selectedShop.address}
                </p>
              </DialogHeader>
              
              <ScrollArea className="max-h-[55vh] pr-4">
                <div className="space-y-6">
                  {categories.map(category => (
                    <div key={category}>
                      <h4 className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3 border-b border-amber-800/30 pb-2">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {selectedShop.menu
                          .filter(item => item.category === category)
                          .map(item => {
                            const qty = getItemQuantity(item.id);
                            return (
                              <div 
                                key={item.id} 
                                className="flex items-center gap-3 p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
                                data-testid={`menu-item-${item.id}`}
                              >
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-amber-100 font-medium text-sm">{item.name}</h5>
                                  <p className="text-amber-200/50 text-xs truncate">{item.description}</p>
                                </div>
                                <span className="text-amber-400 font-semibold text-sm whitespace-nowrap">
                                  ${item.price.toFixed(2)}
                                </span>
                                <Button
                                  size="sm"
                                  variant={qty > 0 ? "default" : "outline"}
                                  className={qty > 0 
                                    ? "bg-amber-600 hover:bg-amber-700 min-w-[70px]" 
                                    : "border-amber-600 text-amber-400 hover:bg-amber-600/20 min-w-[70px]"
                                  }
                                  onClick={() => {
                                    addItem(selectedShop, item);
                                    toast({
                                      title: "Added to Cart",
                                      description: `${item.name} added`
                                    });
                                  }}
                                  data-testid={`button-add-${item.id}`}
                                >
                                  {qty > 0 ? `${qty} in cart` : "Add"}
                                </Button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {itemCount > 0 && (
                <div className="pt-3 border-t border-amber-800/30">
                  <Link href="/schedule">
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => setShowMenu(false)}
                      data-testid="button-checkout"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Checkout ({itemCount} items)
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
