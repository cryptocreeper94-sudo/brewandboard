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
  ShoppingCart,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";
import { COFFEE_SHOPS, Shop, EXTENDED_DELIVERY_PREMIUM, EXTENDED_DELIVERY_RADIUS_MILES, NASHVILLE_ZIP_COORDS } from "@/lib/mock-data";
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

function getTypeBadge(type: Shop['type']) {
  const badges: Record<Shop['type'], { label: string; className: string }> = {
    coffee: { label: 'Coffee', className: 'bg-amber-700/80 text-amber-100' },
    smoothie: { label: 'Smoothie', className: 'bg-green-700/80 text-green-100' },
    both: { label: 'Coffee & Smoothie', className: 'bg-teal-700/80 text-teal-100' },
    bakery: { label: 'Bakery', className: 'bg-pink-700/80 text-pink-100' },
    chain: { label: 'National Chain', className: 'bg-blue-700/80 text-blue-100' },
    donut: { label: 'Donuts', className: 'bg-rose-700/80 text-rose-100' },
    juice: { label: 'Juice Bar', className: 'bg-lime-700/80 text-lime-100' },
    boba: { label: 'Bubble Tea', className: 'bg-purple-700/80 text-purple-100' },
    breakfast: { label: 'Breakfast', className: 'bg-orange-700/80 text-orange-100' },
  };
  return badges[type] || { label: type, className: 'bg-gray-700/80 text-gray-100' };
}

export default function FindBaristasPage() {
  const [zipcode, setZipcode] = useState("");
  const [searchedZip, setSearchedZip] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const { addItem, getItemQuantity, itemCount } = useCart();
  const { toast } = useToast();

  const allShopsWithDistance = useMemo(() => {
    if (!searchedZip || !NASHVILLE_ZIP_COORDS[searchedZip]) return [];
    
    const coords = NASHVILLE_ZIP_COORDS[searchedZip];
    
    return COFFEE_SHOPS
      .map(shop => ({
        ...shop,
        distance: calculateDistance(coords.lat, coords.lng, shop.lat, shop.lng),
        isExtendedDelivery: calculateDistance(coords.lat, coords.lng, shop.lat, shop.lng) > EXTENDED_DELIVERY_RADIUS_MILES
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [searchedZip]);

  const nearbyShops = useMemo(() => allShopsWithDistance.filter(s => !s.isExtendedDelivery), [allShopsWithDistance]);
  const extendedShops = useMemo(() => allShopsWithDistance.filter(s => s.isExtendedDelivery), [allShopsWithDistance]);

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
            <p className="text-amber-200/60 text-sm">Coffee shops, bakeries & more near you</p>
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
          
          <div className="mt-4 p-3 bg-amber-900/20 rounded-lg border border-amber-700/30">
            <h3 className="text-amber-300 text-sm font-medium mb-2">How It Works</h3>
            <ul className="text-amber-200/70 text-xs space-y-1">
              <li>1. Enter your delivery ZIP code above</li>
              <li>2. Browse nearby vendors (within 10 miles) - standard $5 delivery</li>
              <li>3. Extended delivery vendors (10+ miles) have a +$7.50 premium</li>
              <li>4. Tap "Order" to add items to your cart, then schedule delivery</li>
            </ul>
          </div>
        </motion.div>

        {searchedZip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-amber-100 font-serif text-xl">
                {allShopsWithDistance.length} Vendors Near {searchedZip}
              </h2>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-amber-600/50 text-amber-400">
                  {nearbyShops.length} nearby
                </Badge>
                {extendedShops.length > 0 && (
                  <Badge variant="outline" className="border-orange-600/50 text-orange-400">
                    {extendedShops.length} extended
                  </Badge>
                )}
              </div>
            </div>

            {nearbyShops.length === 0 && extendedShops.length === 0 ? (
              <Card className="bg-black/20 border-amber-800/30">
                <CardContent className="p-8 text-center">
                  <Coffee className="h-12 w-12 text-amber-600/50 mx-auto mb-4" />
                  <p className="text-amber-200/60">No coffee shops found near this ZIP code.</p>
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
                      transition={{ delay: index * 0.05 }}
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
                                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                                  <Badge className="bg-amber-500 text-white border-none">
                                    {shop.rating} <Star className="h-3 w-3 ml-0.5 fill-current" />
                                  </Badge>
                                  <Badge className={`${getTypeBadge(shop.type).className} text-[10px] border-none`}>
                                    {getTypeBadge(shop.type).label}
                                  </Badge>
                                </div>
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
                  
                  {extendedShops.length > 0 && (
                    <>
                      <div className="flex items-center gap-3 mt-8 mb-4 pt-6 border-t border-amber-800/30">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-400" />
                          <h3 className="text-amber-100 font-serif text-lg">Extended Delivery</h3>
                        </div>
                        <Badge className="bg-orange-600/80 text-white border-none text-xs">
                          +${EXTENDED_DELIVERY_PREMIUM.toFixed(2)} Premium
                        </Badge>
                      </div>
                      <p className="text-amber-200/50 text-xs mb-4">
                        These vendors are more than {EXTENDED_DELIVERY_RADIUS_MILES} miles away and require an additional ${EXTENDED_DELIVERY_PREMIUM.toFixed(2)} delivery fee.
                      </p>
                      
                      {extendedShops.map((shop, index) => (
                        <motion.div
                          key={shop.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (nearbyShops.length + index) * 0.05 }}
                        >
                          <Card 
                            className="bg-gradient-to-r from-[#2d1810] to-[#1a0f09] border-orange-800/40 hover:border-orange-600/50 transition-all cursor-pointer overflow-hidden relative"
                            data-testid={`card-shop-${shop.id}`}
                          >
                            <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-medium flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              +${EXTENDED_DELIVERY_PREMIUM.toFixed(2)}
                            </div>
                            <CardContent className="p-0">
                              <div className="flex">
                                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                                  <img 
                                    src={shop.image} 
                                    alt={shop.name}
                                    className="w-full h-full object-cover opacity-90"
                                  />
                                </div>
                                <div className="flex-1 p-4">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h3 className="text-amber-100 font-medium">{shop.name}</h3>
                                      <p className="text-amber-200/50 text-sm">{shop.location}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                                      <Badge className="bg-amber-500 text-white border-none">
                                        {shop.rating} <Star className="h-3 w-3 ml-0.5 fill-current" />
                                      </Badge>
                                      <Badge className={`${getTypeBadge(shop.type).className} text-[10px] border-none`}>
                                        {getTypeBadge(shop.type).label}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <p className="text-amber-200/40 text-xs mt-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {shop.address}
                                  </p>
                                  
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2 text-orange-400 text-sm">
                                      <Navigation className="h-4 w-4" />
                                      <span>{shop.distance.toFixed(1)} mi</span>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      className="bg-orange-600 hover:bg-orange-700"
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
                    </>
                  )}
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
