import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, Clock, MapPin, Star, ArrowRight, Sparkles } from "lucide-react";
import { COFFEE_SHOPS } from "@/lib/mock-data";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import baristaImage from "@assets/generated_images/professional_barista.png";
import latteArtImage from "@assets/generated_images/artisan_latte_art.png";
import meetingImage from "@assets/generated_images/corporate_meeting_with_coffee.png";
import coffeeShopImage from "@assets/generated_images/premium_nashville_coffee_shop_interior.png";
import cremaImage from "@assets/generated_images/crema_coffee_roasters_interior.png";
import baristaParlorImage from "@assets/generated_images/barista_parlor_interior.png";
import frothyMonkeyImage from "@assets/generated_images/frothy_monkey_interior.png";
import drugStoreImage from "@assets/generated_images/drug_store_coffee_interior.png";
import whiteGloveImage from "@assets/generated_images/white_glove_coffee_service.png";
import localRoastersImage from "@assets/generated_images/local_coffee_roasting_scene.png";

const shopImages: Record<string, string> = {
  'crema': cremaImage,
  'barista-parlor': baristaParlorImage,
  'frothy-monkey': frothyMonkeyImage,
  'drug-store': drugStoreImage,
  'steadfast': cremaImage,
  'eighth-and-roast': baristaParlorImage,
  'dose': drugStoreImage,
  'just-love': frothyMonkeyImage,
  'smoothie-king': frothyMonkeyImage,
  'tropical-smoothie': frothyMonkeyImage,
  'jamba': frothyMonkeyImage,
  'juice-bar-nashville': frothyMonkeyImage,
};

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

  const handleDemoMode = () => {
    const demoUser = {
      id: "demo-user",
      email: "demo@coffeetalk.app",
      businessName: "Demo Business",
      contactName: "Demo User",
      isDemo: true
    };
    localStorage.setItem("coffee_user", JSON.stringify(demoUser));
    localStorage.setItem("coffee_demo_mode", "true");
    localStorage.removeItem("coffee_demo_notes");
    setLocation("/portfolio");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100">
      
      {/* Elegant Header - Mobile Optimized */}
      <header className="pt-4 pb-3 px-4 md:px-8 safe-area-top">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 md:gap-3"
          >
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center shadow-lg coffee-glow" style={{ background: 'linear-gradient(135deg, #2d1810 0%, #1a0f0a 100%)' }}>
              <Coffee className="h-5 w-5 md:h-6 md:w-6 text-stone-200" />
            </div>
            <div>
              <h1 className="font-serif text-xl md:text-2xl font-bold text-stone-800 tracking-tight">
                Coffee Talk
              </h1>
              <p className="text-[10px] md:text-xs font-medium tracking-widest uppercase" style={{ color: '#5c4033' }}>Nashville Concierge</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={handleExplore}
              className="text-white rounded-full px-4 md:px-6 h-9 md:h-10 text-sm shine-effect"
              style={{ background: 'linear-gradient(135deg, #3d2418 0%, #2d1810 50%, #1a0f0a 100%)' }}
              data-testid="button-explore-header"
            >
              Enter
              <ArrowRight className="ml-1 md:ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Bento Grid Layout - Mobile First */}
      <main className="px-3 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-12 lg:grid-cols-12 gap-3 md:gap-4 lg:gap-6">
            
            {/* Hero Card - Large */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="col-span-2 md:col-span-8 lg:col-span-8 md:row-span-2 relative rounded-2xl md:rounded-3xl overflow-hidden min-h-[280px] md:min-h-[420px] lg:min-h-[480px] group hover-3d"
              style={{ background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1810 100%)' }}
            >
              <img 
                src={coffeeShopImage} 
                alt="Nashville Coffee Shop" 
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
              
              <div className="absolute inset-0 p-5 md:p-10 flex flex-col justify-end">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="inline-flex items-center gap-1.5 md:gap-2 backdrop-blur-sm rounded-full px-3 py-1 md:px-4 md:py-1.5 mb-4 md:mb-6 sparkle-container" style={{ background: 'rgba(61, 36, 24, 0.9)' }}>
                    <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-stone-300" />
                    <span className="text-stone-200 text-[10px] md:text-sm font-medium tracking-wide">Nashville's Premier Service</span>
                  </div>
                  
                  <h2 
                    className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 md:mb-4"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Artisan Coffee,<br />
                    <span className="italic" style={{ color: '#d4c4b0' }}>Delivered with Grace</span>
                  </h2>
                  
                  <p className="text-sm md:text-base text-stone-300 max-w-lg mb-5 md:mb-8 leading-relaxed hidden sm:block">
                    Experience Nashville's finest baristas at your next meeting. 
                    Premium carafes, artisan pastries — simply give us two hours notice.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                    <Button
                      onClick={handleExplore}
                      size="lg"
                      className="h-11 md:h-14 px-5 md:px-8 text-white text-sm md:text-lg font-medium rounded-full shadow-xl hover:shadow-2xl transition-all shine-effect"
                      style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 50%, #2d1810 100%)' }}
                      data-testid="button-explore"
                    >
                      View Our Vendors
                      <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    <Button
                      onClick={() => setLocation("/schedule")}
                      variant="outline"
                      size="lg"
                      className="h-11 md:h-14 px-5 md:px-8 border-white/40 text-white hover:bg-white/10 rounded-full backdrop-blur-sm text-sm md:text-base"
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
              className="col-span-1 md:col-span-4 lg:col-span-4 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 flex flex-col justify-between min-h-[140px] md:min-h-[200px] lg:min-h-[220px] hover-3d coffee-glow"
              style={{ background: 'linear-gradient(135deg, #3d2418 0%, #2d1810 50%, #1a0f0a 100%)' }}
            >
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-2 md:mb-4">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-stone-200" />
              </div>
              <div>
                <h3 
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  2 Hours
                </h3>
                <p className="text-stone-300 text-xs md:text-sm lg:text-base">
                  Minimum notice for delivery
                </p>
              </div>
            </motion.div>

            {/* Barista Image Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="col-span-1 md:col-span-4 lg:col-span-4 relative rounded-2xl md:rounded-3xl overflow-hidden min-h-[140px] md:min-h-[200px] lg:min-h-[220px] group hover-3d"
            >
              <img 
                src={baristaImage} 
                alt="Nashville Barista" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26, 15, 10, 0.9) 0%, rgba(26, 15, 10, 0.3) 50%, transparent 100%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 lg:p-6">
                <p 
                  className="text-base md:text-xl lg:text-2xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Expert Baristas
                </p>
                <p className="text-stone-300 text-[10px] md:text-xs lg:text-sm">Nashville's finest</p>
              </div>
            </motion.div>

            {/* Feature Cards Row - Horizontal Scroll on Mobile, Grid on Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="col-span-2 md:col-span-12"
            >
              {/* Mobile/Tablet: Horizontal Scroll Carousel */}
              <div className="md:hidden overflow-x-auto scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent -mx-3 px-3">
                <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                  {/* Artisan Craft */}
                  <div className="flex-shrink-0 w-[160px] relative rounded-2xl overflow-hidden min-h-[120px] group hover-3d">
                    <img 
                      src={latteArtImage} 
                      alt="Artisan Latte Art" 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26, 15, 10, 0.85) 0%, transparent 100%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Artisan Craft
                      </p>
                      <p className="text-stone-300 text-[10px]">Handcrafted</p>
                    </div>
                  </div>

                  {/* Meeting Ready */}
                  <div className="flex-shrink-0 w-[160px] relative rounded-2xl overflow-hidden min-h-[120px] group hover-3d">
                    <img 
                      src={meetingImage} 
                      alt="Corporate Meeting" 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26, 15, 10, 0.85) 0%, transparent 100%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Meeting Ready
                      </p>
                      <p className="text-stone-300 text-[10px]">Impress clients</p>
                    </div>
                  </div>

                  {/* White Glove */}
                  <div className="flex-shrink-0 w-[160px] relative rounded-2xl overflow-hidden min-h-[120px] group hover-3d">
                    <img 
                      src={whiteGloveImage} 
                      alt="White Glove Service" 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26, 15, 10, 0.85) 0%, transparent 100%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        White Glove
                      </p>
                      <p className="text-stone-300 text-[10px]">Premium service</p>
                    </div>
                  </div>

                  {/* Local Roasters */}
                  <div className="flex-shrink-0 w-[160px] relative rounded-2xl overflow-hidden min-h-[120px] group hover-3d">
                    <img 
                      src={localRoastersImage} 
                      alt="Local Roasters" 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26, 15, 10, 0.85) 0%, transparent 100%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Local Roasters
                      </p>
                      <p className="text-stone-300 text-[10px]">Nashville's finest</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop/Tablet: 4-column Grid */}
              <div className="hidden md:grid md:grid-cols-4 gap-4 lg:gap-6">
                {/* Artisan Craft */}
                <div className="relative rounded-3xl overflow-hidden h-[200px] group hover-3d flex flex-col justify-end">
                  <img 
                    src={latteArtImage} 
                    alt="Artisan Latte Art" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26, 15, 10, 0.85) 0%, transparent 100%)' }} />
                  <div className="relative z-10 px-5 pb-4">
                    <p className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Artisan Craft
                    </p>
                    <p className="text-stone-300 text-xs mt-1 h-8">Handcrafted with passion</p>
                  </div>
                </div>

                {/* Meeting Ready */}
                <div className="relative rounded-3xl overflow-hidden h-[200px] group hover-3d flex flex-col justify-end">
                  <img 
                    src={meetingImage} 
                    alt="Corporate Meeting" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26, 15, 10, 0.85) 0%, transparent 100%)' }} />
                  <div className="relative z-10 px-5 pb-4">
                    <p className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Meeting Ready
                    </p>
                    <p className="text-stone-300 text-xs mt-1 h-8">Impress your clients</p>
                  </div>
                </div>

                {/* White Glove */}
                <div className="relative rounded-3xl overflow-hidden h-[200px] group hover-3d flex flex-col justify-end">
                  <img 
                    src={whiteGloveImage} 
                    alt="White Glove Service" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26, 15, 10, 0.85) 0%, transparent 100%)' }} />
                  <div className="relative z-10 px-5 pb-4">
                    <p className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      White Glove
                    </p>
                    <p className="text-stone-300 text-xs mt-1 h-8">Premium concierge service</p>
                  </div>
                </div>

                {/* Local Roasters */}
                <div className="relative rounded-3xl overflow-hidden h-[200px] group hover-3d flex flex-col justify-end">
                  <img 
                    src={localRoastersImage} 
                    alt="Local Roasters" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26, 15, 10, 0.85) 0%, transparent 100%)' }} />
                  <div className="relative z-10 px-5 pb-4">
                    <p className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Local Roasters
                    </p>
                    <p className="text-stone-300 text-xs mt-1 h-8">Nashville's finest beans</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Vendors Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="col-span-2 md:col-span-12 pt-6 md:pt-8 lg:pt-12 pb-2 md:pb-4"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #5c4033, transparent)' }} />
                <Star className="h-4 w-4 md:h-5 md:w-5 fill-current" style={{ color: '#5c4033' }} />
                <span className="text-[10px] md:text-sm lg:text-base font-medium tracking-widest uppercase" style={{ color: '#5c4033' }}>Our Partners</span>
                <Star className="h-4 w-4 md:h-5 md:w-5 fill-current" style={{ color: '#5c4033' }} />
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #5c4033, transparent)' }} />
              </div>
              <h3 
                className="text-xl md:text-3xl lg:text-4xl font-bold text-stone-800 text-center"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Nashville's Finest Roasters
              </h3>
            </motion.div>

            {/* Vendor Cards - Horizontal Scroll */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="col-span-2 md:col-span-12"
            >
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent pb-2">
                <div className="flex gap-3 md:gap-4 lg:gap-6 pb-4" style={{ width: 'max-content' }}>
                  {COFFEE_SHOPS.map((shop, index) => (
                    <motion.div
                      key={shop.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex-shrink-0 w-[260px] md:w-[320px] lg:w-[360px] bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-stone-200 group hover-3d"
                    >
                      {/* Vendor Image */}
                      <div className="relative h-36 md:h-44 overflow-hidden">
                        <img 
                          src={shopImages[shop.id] || coffeeShopImage} 
                          alt={shop.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 left-2 md:top-3 md:left-3">
                          <Badge className="text-white border-none shadow-lg text-[10px] md:text-xs" style={{ background: '#3d2418' }}>
                            <Star className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 fill-current" />
                            {shop.rating}
                          </Badge>
                        </div>
                      </div>

                      {/* Vendor Info */}
                      <div className="p-4 md:p-5 flex flex-col h-[220px] md:h-[240px]">
                        <div className="flex-1">
                          <h4 
                            className="text-lg md:text-xl font-bold text-stone-800 mb-1 line-clamp-1"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {shop.name}
                          </h4>
                          <p className="text-[10px] md:text-xs text-stone-500 flex items-center gap-1 mb-1">
                            <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3" /> {shop.location}
                          </p>
                          <p className="font-medium text-[10px] md:text-xs mb-3" style={{ color: '#5c4033' }}>{shop.specialty}</p>

                          {/* Menu Preview */}
                          <div className="space-y-1.5 border-t border-stone-100 pt-3">
                            <p className="text-[9px] md:text-[10px] text-stone-400 uppercase tracking-wider font-medium">Featured</p>
                            {shop.menu.filter(item => item.category === 'Catering' || item.category === 'Coffee').slice(0, 2).map((item) => (
                              <div key={item.id} className="flex justify-between items-center">
                                <span className="text-stone-700 text-[11px] md:text-xs line-clamp-1">{item.name}</span>
                                <span className="font-semibold text-[11px] md:text-xs flex-shrink-0 ml-2" style={{ color: '#5c4033' }}>${item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button 
                          onClick={handleExplore}
                          className="w-full mt-3 md:mt-4 text-white rounded-full text-xs md:text-sm h-9 md:h-10 shine-effect flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #3d2418 0%, #2d1810 50%, #1a0f0a 100%)' }}
                          data-testid={`button-view-menu-${shop.id}`}
                        >
                          View Full Menu
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="col-span-2 md:col-span-12 rounded-2xl md:rounded-3xl p-6 md:p-10 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1810 50%, #1a0f0a 100%)' }}
            >
              {/* Decorative glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(92,64,51,0.2),transparent_70%)]" />
              
              <div className="relative z-10">
                <h3 
                  className="text-xl md:text-3xl font-bold text-white mb-3 md:mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Ready to Elevate Your Next Meeting?
                </h3>
                <p className="text-stone-400 text-sm md:text-base max-w-2xl mx-auto mb-5 md:mb-8">
                  Experience the convenience of Nashville's finest coffee, delivered with white-glove service.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleExplore}
                    size="lg"
                    className="h-11 md:h-14 px-8 md:px-10 text-white text-sm md:text-lg font-medium rounded-full shine-effect sparkle-container"
                    style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 50%, #2d1810 100%)' }}
                    data-testid="button-get-started"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Started
                  </Button>
                  <Button
                    onClick={handleDemoMode}
                    size="lg"
                    variant="outline"
                    className="h-11 md:h-14 px-6 md:px-8 border-stone-400 text-stone-300 hover:bg-stone-800/50 hover:text-white text-sm md:text-lg font-medium rounded-full"
                    data-testid="button-try-demo"
                  >
                    Try Portfolio Demo
                  </Button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 md:py-8 text-center border-t border-stone-200 bg-white/50">
        <p className="text-xs md:text-sm text-stone-500">
          Powered by{' '}
          <a 
            href="https://darkwavestudios.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-serif font-semibold text-stone-700 hover:text-stone-900 transition-colors"
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
