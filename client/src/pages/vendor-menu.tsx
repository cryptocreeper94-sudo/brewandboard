import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import {
  ArrowLeft,
  Search,
  MapPin,
  Star,
  Clock,
  ShoppingCart,
  Plus,
  Minus,
  Filter,
  Coffee,
  UtensilsCrossed,
  Sparkles,
  Heart,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { COFFEE_SHOPS, Product, Shop } from "@/lib/mock-data";
import { useCart } from "@/contexts/CartContext";
import { ItemCustomizationModal } from "@/components/ItemCustomizationModal";
import { useToast } from "@/hooks/use-toast";

const TYPE_ICONS: Record<string, { icon: typeof Coffee; label: string; color: string }> = {
  coffee: { icon: Coffee, label: "Coffee", color: "from-amber-500 to-orange-600" },
  chain: { icon: Coffee, label: "Chain", color: "from-green-500 to-emerald-600" },
  smoothie: { icon: Sparkles, label: "Smoothies", color: "from-pink-500 to-rose-600" },
  both: { icon: Coffee, label: "Coffee & Smoothies", color: "from-purple-500 to-violet-600" },
  bakery: { icon: UtensilsCrossed, label: "Bakery", color: "from-yellow-500 to-amber-600" },
  donut: { icon: UtensilsCrossed, label: "Donuts", color: "from-pink-400 to-rose-500" },
  juice: { icon: Sparkles, label: "Juice", color: "from-green-400 to-emerald-500" },
  boba: { icon: Coffee, label: "Bubble Tea", color: "from-purple-400 to-pink-500" },
  breakfast: { icon: UtensilsCrossed, label: "Breakfast", color: "from-orange-400 to-red-500" },
};

export default function VendorMenuPage() {
  const params = useParams<{ vendorId?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { items, itemCount, subtotal } = useCart();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedVendor, setSelectedVendor] = useState<Shop | null>(
    params.vendorId ? COFFEE_SHOPS.find(s => s.id === params.vendorId) || null : null
  );
  const [customizeItem, setCustomizeItem] = useState<{ product: Product; shop: Shop } | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const filteredVendors = useMemo(() => {
    return COFFEE_SHOPS.filter(shop => {
      const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "all" || shop.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType]);

  const menuCategories = useMemo(() => {
    if (!selectedVendor) return {};
    const categories: Record<string, Product[]> = {};
    selectedVendor.menu.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    return categories;
  }, [selectedVendor]);

  const handleSelectVendor = (vendor: Shop) => {
    setSelectedVendor(vendor);
    setExpandedCategory(Object.keys(menuCategories)[0] || null);
  };

  const handleBackToVendors = () => {
    setSelectedVendor(null);
    setExpandedCategory(null);
  };

  const typeInfo = selectedVendor ? TYPE_ICONS[selectedVendor.type] || TYPE_ICONS.coffee : null;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 50%, #3d2418 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md border-b border-amber-800/30" style={{ background: 'rgba(26, 15, 9, 0.95)' }}>
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {selectedVendor ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToVendors}
                  className="text-amber-200 hover:text-amber-100 hover:bg-amber-800/30"
                  data-testid="button-back-to-vendors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              ) : (
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" className="text-amber-200 hover:text-amber-100 hover:bg-amber-800/30" data-testid="button-back-dashboard">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <div>
                <h1 className="font-serif text-lg font-bold text-amber-100">
                  {selectedVendor ? selectedVendor.name : "Browse Vendors"}
                </h1>
                {selectedVendor && (
                  <p className="text-xs text-amber-300/60 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedVendor.location}
                  </p>
                )}
              </div>
            </div>

            {/* Cart Button */}
            <Link href="/schedule">
              <Button
                variant="outline"
                size="sm"
                className="relative border-amber-600/50 text-amber-200 hover:bg-amber-800/30 gap-2"
                data-testid="button-view-cart"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-amber-950 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!selectedVendor ? (
            /* Vendor List View */
            <motion.div
              key="vendor-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Search & Filter */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
                  <Input
                    placeholder="Search vendors, locations, or specialties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-amber-950/30 border-amber-800/40 text-amber-100 placeholder:text-amber-400/40"
                    data-testid="input-search-vendors"
                  />
                </div>

                {/* Type Filter Pills */}
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-2">
                    <Button
                      variant={selectedType === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType("all")}
                      className={selectedType === "all" 
                        ? "bg-amber-600 hover:bg-amber-700 text-white" 
                        : "border-amber-700/50 text-amber-300 hover:bg-amber-800/30"
                      }
                      data-testid="filter-all"
                    >
                      All
                    </Button>
                    {Object.entries(TYPE_ICONS).map(([type, { label }]) => (
                      <Button
                        key={type}
                        variant={selectedType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType(type)}
                        className={selectedType === type 
                          ? "bg-amber-600 hover:bg-amber-700 text-white" 
                          : "border-amber-700/50 text-amber-300 hover:bg-amber-800/30"
                        }
                        data-testid={`filter-${type}`}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Vendor Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVendors.map((vendor) => {
                  const vendorType = TYPE_ICONS[vendor.type] || TYPE_ICONS.coffee;
                  return (
                    <motion.div
                      key={vendor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className="bg-gradient-to-br from-amber-950/50 to-amber-900/30 border-amber-800/30 cursor-pointer overflow-hidden group"
                        onClick={() => handleSelectVendor(vendor)}
                        data-testid={`vendor-card-${vendor.id}`}
                      >
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={vendor.image}
                            alt={vendor.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <Badge className={`absolute top-2 right-2 bg-gradient-to-r ${vendorType.color} text-white border-0 text-xs`}>
                            {vendorType.label}
                          </Badge>
                          {vendor.isNationalChain && (
                            <Badge className="absolute top-2 left-2 bg-blue-500/80 text-white border-0 text-xs">
                              National Chain
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-serif font-semibold text-amber-100 group-hover:text-amber-50 transition-colors">
                              {vendor.name}
                            </h3>
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              <span className="text-xs font-medium">{vendor.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-amber-300/70 flex items-center gap-1 mb-2">
                            <MapPin className="h-3 w-3" />
                            {vendor.location}
                          </p>
                          <p className="text-xs text-amber-200/60 line-clamp-1">{vendor.specialty}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-amber-400/70">
                              {vendor.menu.length} items
                            </span>
                            <Button
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7"
                              data-testid={`button-view-menu-${vendor.id}`}
                            >
                              View Menu
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {filteredVendors.length === 0 && (
                <div className="text-center py-12">
                  <Coffee className="h-12 w-12 mx-auto text-amber-600/40 mb-4" />
                  <p className="text-amber-300/60">No vendors found matching your search</p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Vendor Menu View */
            <motion.div
              key="vendor-menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Vendor Header Card */}
              <Card className="bg-gradient-to-br from-amber-950/50 to-amber-900/30 border-amber-800/30 overflow-hidden">
                <div className="relative h-40">
                  <img
                    src={selectedVendor.image}
                    alt={selectedVendor.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      {typeInfo && (
                        <Badge className={`bg-gradient-to-r ${typeInfo.color} text-white border-0`}>
                          {typeInfo.label}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-amber-400 text-sm">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{selectedVendor.rating}</span>
                      </div>
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-white">{selectedVendor.name}</h2>
                    <p className="text-sm text-amber-200/80">{selectedVendor.specialty}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 text-sm text-amber-300/70">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedVendor.address}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Menu Categories */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-semibold text-amber-100">Menu</h3>
                
                {Object.entries(menuCategories).map(([category, products]) => (
                  <Card 
                    key={category} 
                    className="bg-amber-950/30 border-amber-800/30 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-amber-900/20 transition-colors"
                      data-testid={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div>
                        <h4 className="font-medium text-amber-100">{category}</h4>
                        <p className="text-xs text-amber-400/60">{products.length} items</p>
                      </div>
                      {expandedCategory === category ? (
                        <ChevronUp className="h-5 w-5 text-amber-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-amber-400" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedCategory === category && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-amber-800/30">
                            {products.map((product) => (
                              <div
                                key={product.id}
                                className="p-4 border-b border-amber-800/20 last:border-0 hover:bg-amber-900/20 transition-colors cursor-pointer"
                                onClick={() => setCustomizeItem({ product, shop: selectedVendor })}
                                data-testid={`menu-item-${product.id}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-amber-100 mb-1">{product.name}</h5>
                                    <p className="text-xs text-amber-300/60 mb-2 line-clamp-2">{product.description}</p>
                                    {product.modifiers && product.modifiers.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {product.modifiers.slice(0, 3).map(mod => (
                                          <Badge 
                                            key={mod.id} 
                                            variant="outline" 
                                            className="text-[10px] border-amber-700/40 text-amber-400/70"
                                          >
                                            {mod.name}
                                          </Badge>
                                        ))}
                                        {product.modifiers.length > 3 && (
                                          <Badge variant="outline" className="text-[10px] border-amber-700/40 text-amber-400/70">
                                            +{product.modifiers.length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="font-semibold text-amber-200">${product.price.toFixed(2)}</p>
                                    <Button
                                      size="sm"
                                      className="mt-2 bg-amber-600 hover:bg-amber-700 text-white h-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCustomizeItem({ product, shop: selectedVendor });
                                      }}
                                      data-testid={`button-add-${product.id}`}
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Cart Summary */}
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4"
          style={{ background: 'linear-gradient(to top, rgba(26, 15, 9, 0.98), rgba(26, 15, 9, 0.9))' }}
        >
          <div className="container max-w-4xl mx-auto">
            <Link href="/schedule">
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white h-14 text-lg font-semibold shadow-lg"
                data-testid="button-checkout"
              >
                <ShoppingCart className="h-5 w-5 mr-3" />
                View Cart ({itemCount} items) • ${subtotal.toFixed(2)}
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Customization Modal */}
      {customizeItem && (
        <ItemCustomizationModal
          isOpen={!!customizeItem}
          onClose={() => setCustomizeItem(null)}
          product={customizeItem.product}
          shop={customizeItem.shop}
        />
      )}
    </div>
  );
}
