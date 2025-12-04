import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, Clock, MapPin, Star, ArrowRight, Sparkles } from "lucide-react";
import { COFFEE_SHOPS } from "@/lib/mock-data";

import baristaImage from "@assets/generated_images/professional_barista.png";
import latteArtImage from "@assets/generated_images/artisan_latte_art.png";
import meetingImage from "@assets/generated_images/corporate_meeting_with_coffee.png";
import coffeeShopImage from "@assets/generated_images/premium_nashville_coffee_shop_interior.png";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem("coffee_user");
    const sessionExpiry = localStorage.getItem("coffee_session_expiry");
    
    if (savedUser && sessionExpiry) {
      if (new Date().getTime() < parseInt(sessionExpiry)) {
        setLocation("/dashboard");
      } else {
        localStorage.removeItem("coffee_session_expiry");
      }
    }
  }, [setLocation]);

  const handleExplore = () => {
    localStorage.setItem("is_guest", "true");
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
      
      {/* Elegant Header */}
      <header className="py-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center shadow-lg">
              <Coffee className="h-6 w-6 text-amber-100" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-800 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Coffee Talk
              </h1>
              <p className="text-xs text-amber-700 font-medium tracking-widest uppercase">Nashville Concierge</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={handleExplore}
              className="bg-stone-800 hover:bg-stone-900 text-white rounded-full px-6"
              data-testid="button-explore-header"
            >
              Enter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <main className="px-6 md:px-12 pb-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Bento Grid */}
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            
            {/* Hero Card - Large */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="col-span-12 lg:col-span-8 row-span-2 relative rounded-3xl overflow-hidden bg-stone-900 min-h-[400px] md:min-h-[500px] group"
            >
              <img 
                src={coffeeShopImage} 
                alt="Nashville Coffee Shop" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="inline-flex items-center gap-2 bg-amber-600/90 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                    <Sparkles className="h-4 w-4 text-amber-100" />
                    <span className="text-amber-50 text-sm font-medium tracking-wide">Nashville's Premier Service</span>
                  </div>
                  
                  <h2 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Artisan Coffee,<br />
                    <span className="text-amber-300 italic">Delivered with Grace</span>
                  </h2>
                  
                  <p className="text-lg text-stone-300 max-w-xl mb-8 leading-relaxed">
                    Experience Nashville's finest baristas at your next meeting. 
                    Premium carafes, artisan pastries — simply give us two hours notice.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Button
                      onClick={handleExplore}
                      size="lg"
                      className="h-14 px-8 bg-amber-600 hover:bg-amber-700 text-white text-lg font-medium rounded-full shadow-xl hover:shadow-2xl transition-all"
                      data-testid="button-explore"
                    >
                      View Our Vendors
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() => setLocation("/schedule")}
                      variant="outline"
                      size="lg"
                      className="h-14 px-8 border-white/40 text-white hover:bg-white/10 rounded-full backdrop-blur-sm"
                      data-testid="button-schedule"
                    >
                      Schedule Delivery
                    </Button>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* 2-Hour Promise Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-12 sm:col-span-6 lg:col-span-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[200px]"
            >
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  2 Hours
                </h3>
                <p className="text-amber-100 text-lg">
                  Minimum notice for guaranteed delivery to your meeting
                </p>
              </div>
            </motion.div>

            {/* Barista Image Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="col-span-12 sm:col-span-6 lg:col-span-4 relative rounded-3xl overflow-hidden min-h-[250px] group"
            >
              <img 
                src={baristaImage} 
                alt="Nashville Barista" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p 
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Expert Baristas
                </p>
                <p className="text-amber-200 text-sm">Nashville's finest craftspeople</p>
              </div>
            </motion.div>

            {/* Latte Art Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="col-span-6 lg:col-span-4 relative rounded-3xl overflow-hidden min-h-[200px] group"
            >
              <img 
                src={latteArtImage} 
                alt="Artisan Latte Art" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p 
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Artisan Craft
                </p>
              </div>
            </motion.div>

            {/* Meeting Image Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="col-span-6 lg:col-span-4 relative rounded-3xl overflow-hidden min-h-[200px] group"
            >
              <img 
                src={meetingImage} 
                alt="Corporate Meeting" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p 
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Meeting Ready
                </p>
              </div>
            </motion.div>

            {/* Vendors Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="col-span-12 pt-8 pb-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                <Star className="h-5 w-5 text-amber-600 fill-amber-600" />
                <span className="text-sm font-medium text-amber-700 tracking-widest uppercase">Our Curated Partners</span>
                <Star className="h-5 w-5 text-amber-600 fill-amber-600" />
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              </div>
              <h3 
                className="text-3xl md:text-4xl font-bold text-stone-800 text-center"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Nashville's Finest Roasters
              </h3>
            </motion.div>

            {/* Vendor Cards - Bento Style */}
            {COFFEE_SHOPS.slice(0, 4).map((shop, index) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`${
                  index === 0 ? 'col-span-12 md:col-span-6 lg:col-span-5' :
                  index === 1 ? 'col-span-12 md:col-span-6 lg:col-span-7' :
                  index === 2 ? 'col-span-12 md:col-span-7 lg:col-span-7' :
                  'col-span-12 md:col-span-5 lg:col-span-5'
                } bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 group`}
              >
                <div className="flex flex-col sm:flex-row h-full">
                  {/* Vendor Image */}
                  <div className="relative w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                    <img 
                      src={shop.image} 
                      alt={shop.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-amber-500 text-white border-none shadow-lg">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {shop.rating}
                      </Badge>
                    </div>
                  </div>

                  {/* Vendor Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <h4 
                        className="text-2xl font-bold text-stone-800 mb-1"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {shop.name}
                      </h4>
                      <p className="text-sm text-stone-500 flex items-center gap-1 mb-2">
                        <MapPin className="h-3 w-3" /> {shop.location}
                      </p>
                      <p className="text-amber-700 font-medium text-sm mb-4">{shop.specialty}</p>

                      {/* Menu Preview */}
                      <div className="space-y-2 border-t border-stone-100 pt-4">
                        <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">Featured Items</p>
                        {shop.menu.filter(item => item.category === 'Catering' || item.category === 'Coffee').slice(0, 2).map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <span className="text-stone-700 text-sm">{item.name}</span>
                            <span className="text-amber-700 font-semibold text-sm">${item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={handleExplore}
                      className="mt-4 bg-stone-800 hover:bg-stone-900 text-white rounded-full"
                      data-testid={`button-view-menu-${shop.id}`}
                    >
                      View Full Menu
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="col-span-12 bg-gradient-to-r from-stone-800 via-stone-900 to-stone-800 rounded-3xl p-8 md:p-12 text-center"
            >
              <h3 
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Ready to Elevate Your Next Meeting?
              </h3>
              <p className="text-stone-300 text-lg max-w-2xl mx-auto mb-8">
                Experience the convenience of Nashville's finest coffee, delivered with white-glove service. 
                Just two hours notice is all we need.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={handleExplore}
                  size="lg"
                  className="h-14 px-10 bg-amber-600 hover:bg-amber-700 text-white text-lg font-medium rounded-full"
                  data-testid="button-get-started"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-stone-200 bg-white/50">
        <p className="text-sm text-stone-500">
          Powered by{' '}
          <a 
            href="https://darkwavestudios.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-serif font-semibold text-stone-700 hover:text-amber-600 transition-colors"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Darkwave Studios, LLC
          </a>
          {' '}• © 2025
        </p>
      </footer>
    </div>
  );
}
