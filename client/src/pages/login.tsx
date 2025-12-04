import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Coffee, Clock, MapPin, Star, ArrowRight, Users, Utensils } from "lucide-react";
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
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-background">
      
      {/* Hero Section - Nashville Baristas */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={coffeeShopImage} 
            alt="Nashville Coffee Shop" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left - Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-amber-600/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-4 py-2">
                <Coffee className="h-4 w-4 text-amber-400" />
                <span className="text-amber-200 text-sm font-medium">Nashville's Coffee Concierge</span>
              </div>

              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Nashville Baristas,
                <br />
                <span className="text-amber-400">Delivered to Your Meetings</span>
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
                Premium coffee from Nashville's finest roasters, delivered straight to your boardroom. 
                Just give us 2 hours notice.
              </p>

              {/* Key Benefits */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-sm">2-Hour Lead Time</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Star className="h-4 w-4 text-amber-400" />
                  <span className="text-sm">Curated Roasters</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Users className="h-4 w-4 text-amber-400" />
                  <span className="text-sm">Meeting-Ready</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  onClick={handleExplore}
                  size="lg"
                  className="h-14 px-8 bg-amber-600 hover:bg-amber-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all group"
                  data-testid="button-explore"
                >
                  See Vendors & Menus
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => setLocation("/schedule")}
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 border-white/30 text-white hover:bg-white/10 text-lg rounded-xl"
                  data-testid="button-schedule"
                >
                  Schedule Delivery
                </Button>
              </div>
            </motion.div>

            {/* Right - Barista Image Stack */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block relative"
            >
              <div className="relative">
                <img 
                  src={baristaImage} 
                  alt="Professional Nashville Barista" 
                  className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-xl overflow-hidden shadow-xl border-4 border-background">
                  <img 
                    src={latteArtImage} 
                    alt="Artisan Latte Art" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2-Hour Promise Strip */}
      <section className="bg-amber-600 py-4">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">2-Hour Minimum Notice</span>
            </div>
            <span className="hidden sm:block text-amber-200">•</span>
            <span className="hidden sm:block">Carafes, Pastries & Artisan Espresso</span>
            <span className="hidden md:block text-amber-200">•</span>
            <span className="hidden md:block">Delivered to Your Door</span>
          </div>
        </div>
      </section>

      {/* Vendor Showcase */}
      <section className="py-16 bg-card">
        <div className="container max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium text-amber-600 uppercase tracking-wider">Trusted Nashville Partners</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Our Curated Roasters
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              We partner with Nashville's finest coffee shops to bring you premium quality for every meeting.
            </p>
          </motion.div>

          {/* Vendor Cards */}
          <ScrollArea className="w-full">
            <div className="flex gap-6 pb-4">
              {COFFEE_SHOPS.map((shop, index) => (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-[320px] bg-background rounded-2xl overflow-hidden shadow-lg border border-border/50 group"
                >
                  {/* Vendor Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={shop.image} 
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-amber-500 text-white border-none">
                        {shop.rating} <Star className="h-3 w-3 ml-1 fill-current" />
                      </Badge>
                    </div>
                  </div>

                  {/* Vendor Info */}
                  <div className="p-5">
                    <h3 className="font-serif text-xl font-bold text-foreground">{shop.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {shop.location}
                    </p>
                    <p className="text-sm text-amber-600 font-medium mt-1">{shop.specialty}</p>

                    {/* Sample Menu Items */}
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Utensils className="h-3 w-3" />
                        <span className="font-medium">Popular for Meetings:</span>
                      </div>
                      {shop.menu.filter(item => item.category === 'Catering' || item.category === 'Coffee').slice(0, 2).map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-foreground">{item.name}</span>
                          <span className="text-amber-600 font-semibold">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={handleExplore}
                      className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white"
                      data-testid={`button-view-menu-${shop.id}`}
                    >
                      View Full Menu
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </section>

      {/* Meeting-Focused Section */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src={meetingImage} 
                alt="Corporate Meeting with Coffee" 
                className="rounded-2xl shadow-xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Perfect for Every Meeting
              </h2>
              <p className="text-muted-foreground text-lg">
                From quick team huddles to all-day conferences, we've got you covered with premium Nashville coffee.
              </p>

              <div className="space-y-4">
                {[
                  { title: "Boardroom-Ready Carafes", desc: "Hot, fresh coffee that serves 10-12 people" },
                  { title: "Pastry Boxes for Teams", desc: "Assorted artisan pastries and breakfast items" },
                  { title: "White-Glove Setup", desc: "We handle the delivery so you can focus on business" },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Coffee className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleExplore}
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                data-testid="button-get-started"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/30 bg-card/50">
        <span>Powered by </span>
        <a 
          href="https://darkwavestudios.io" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-serif font-semibold text-foreground hover:text-amber-600 transition-colors"
        >
          Darkwave Studios, LLC
        </a>
        <span> • &copy; 2025</span>
      </footer>
    </div>
  );
}
